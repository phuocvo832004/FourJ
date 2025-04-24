import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatters';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import searchApi, { SearchResult as ApiSearchResult, FacetEntry, SearchParams as ApiSearchParams } from '../api/searchApi';

// Định nghĩa lại interface cho cấu trúc product từ API
interface ApiProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  rating?: number;
}

// Interface for product display
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  discount?: number;
}

// Định nghĩa enum cho các API sort option
type ApiSortOption = 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'BEST_SELLING' | 'HIGHEST_RATED';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { addItem: addToCart } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState('relevance');
  const [totalHits, setTotalHits] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(12); // Giảm kích thước để card lớn hơn
  const [facets, setFacets] = useState<Record<string, FacetEntry[]>>({});
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    categories: [] as string[],
    rating: 0
  });

  // Fetch sản phẩm từ search-service
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!query.trim()) {
          setProducts([]);
          setTotalHits(0);
          setLoading(false);
          return;
        }
        
        // Xác định sort option cho API
        let apiSortOption: ApiSortOption;
        switch (sortOption) {
          case 'price-low-high':
            apiSortOption = 'PRICE_ASC';
            break;
          case 'price-high-low':
            apiSortOption = 'PRICE_DESC';
            break;
          case 'rating':
            apiSortOption = 'HIGHEST_RATED';
            break;
          default:
            apiSortOption = 'RELEVANCE';
        }
        
        // Xây dựng tham số tìm kiếm
        const searchRequestParams: ApiSearchParams = {
          query,
          page,
          size,
          sortOption: apiSortOption,
          categories: filters.categories as string[] | undefined, 
          priceRange: {
            min: filters.priceRange[0],
            max: filters.priceRange[1]
          },
          includeAggregations: true
        };
        
        // Gọi API
        const result: ApiSearchResult = await searchApi.searchProductsComplex(searchRequestParams);

        // Chuyển đổi dữ liệu từ API thành dạng hiển thị
        setProducts((result.products as ApiProduct[]).map((product: ApiProduct) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl,
          category: product.categoryName,
          rating: product.rating || 0
        })));
        
        setTotalHits(result.totalHits);
        
        // Cập nhật facets nếu có
        if (result.facets) {
          setFacets(result.facets);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
        setProducts([]);
        setTotalHits(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [query, page, size, sortOption, filters]);
  
  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterName: string, value: number | number[] | string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    
    // Reset về trang đầu tiên khi thay đổi bộ lọc
    setPage(0);
  };
  
  // Xử lý thay đổi sắp xếp
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    setPage(0); // Reset page khi đổi sort
  };
  
  // Xử lý phân trang
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Tạo danh sách các trang hiển thị
  const getPaginationItems = () => {
    const totalPages = Math.ceil(totalHits / size);
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }).map((_, i) => i);
    }
    
    // Hiển thị 1 2 ... 4 5 6 ... 10 khi có nhiều trang
    if (page < 3) {
      return [0, 1, 2, 3, 4, 'ellipsis', totalPages - 1];
    } else if (page >= totalPages - 4) {
      return [0, 'ellipsis', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
    } else {
      return [0, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages - 1];
    }
  };

  // Xử lý điều hướng đến trang chi tiết sản phẩm
  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  // Hàm xử lý thay đổi số lượng
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    // Giới hạn số lượng tối thiểu là 1
    const validQuantity = Math.max(1, newQuantity);
    setQuantityMap(prev => ({
      ...prev,
      [productId]: validQuantity,
    }));
  };

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = (product: Product) => {
    const quantityToAdd = quantityMap[product.id] || 1; // Lấy số lượng từ state, mặc định là 1
    addToCart({
      id: product.id, // Sử dụng id của sản phẩm làm id của cart item
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantityToAdd,
      category: product.category, // Thêm category nếu cần
      description: '', // Thêm description nếu cần
    });
    // Tùy chọn: Reset số lượng về 1 sau khi thêm?
    // setQuantityMap(prev => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="container mx-auto px-4 py-8">
        {/* Header section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span></h1>
          {!loading && !error && <p className="text-gray-600 text-lg">{totalHits} sản phẩm được tìm thấy</p>}
        </div>
        
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <button 
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full bg-white p-3 rounded-lg shadow-sm flex items-center justify-between"
          >
            <span className="font-medium">Bộ lọc</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
            </svg>
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center items-center h-80">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <div className="absolute top-0 left-0 h-16 w-16 flex justify-center items-center">
                <svg className="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}
        
        {/* No results message */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-lg mb-6 shadow-sm">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-center">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}". Vui lòng thử từ khóa khác.</p>
            </div>
          </div>
        )}
        
        {/* Main content */}
        {!loading && !error && products.length > 0 && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar filter - Desktop */}
            <div className={`md:w-1/4 bg-white p-5 rounded-lg shadow-sm sticky top-4 self-start transition-all duration-300 ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`} style={{maxHeight: "calc(100vh - 2rem)", overflowY: "auto"}}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Bộ lọc</h2>
                <button onClick={() => setIsMobileFilterOpen(false)} className="md:hidden text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Lọc theo danh mục */}
              <div className="mb-6 border-b pb-6">
                <h3 className="font-medium mb-3 text-gray-700">Danh mục</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {facets.categories && facets.categories.length > 0 ? (
                    facets.categories.map(category => (
                      <div key={category.key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category.key}`}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={filters.categories.includes(category.key)}
                          onChange={() => {
                            const isSelected = filters.categories.includes(category.key);
                            const newCategories = isSelected
                              ? filters.categories.filter(c => c !== category.key)
                              : [...filters.categories, category.key];
                            handleFilterChange('categories', newCategories);
                          }}
                        />
                        <label htmlFor={`category-${category.key}`} className="text-sm text-gray-700 select-none">
                          <span className="font-medium">{category.key}</span> <span className="text-gray-500">({category.count})</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Không có danh mục nào</p>
                  )}
                </div>
              </div>
              
              {/* Lọc theo khoảng giá */}
              <div className="mb-6 border-b pb-6">
                <h3 className="font-medium mb-3 text-gray-700">Khoảng giá</h3>
                <div className="px-2">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600 font-medium">{filters.priceRange[0].toLocaleString()}đ</span>
                    <span className="text-gray-600 font-medium">{filters.priceRange[1].toLocaleString()}đ</span>
                  </div>
                  <div className="mb-4 relative pt-1">
                    <div className="h-1 bg-gray-200 rounded-full">
                      <div 
                        className="absolute h-1 bg-blue-500 rounded-full" 
                        style={{
                          left: `${(filters.priceRange[0] / 1000000) * 100}%`, 
                          width: `${((filters.priceRange[1] - filters.priceRange[0]) / 1000000) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="50000"
                    value={filters.priceRange[0]}
                    onChange={(e) => {
                      const min = parseInt(e.target.value);
                      const max = filters.priceRange[1];
                      if (min <= max) {
                        handleFilterChange('priceRange', [min, max]);
                      }
                    }}
                    className="w-full mb-2 appearance-none bg-transparent"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="50000"
                    value={filters.priceRange[1]}
                    onChange={(e) => {
                      const min = filters.priceRange[0];
                      const max = parseInt(e.target.value);
                      if (min <= max) {
                        handleFilterChange('priceRange', [min, max]);
                      }
                    }}
                    className="w-full appearance-none bg-transparent"
                  />
                </div>
              </div>
              
              {/* Lọc theo đánh giá */}
              <div className="mb-4">
                <h3 className="font-medium mb-3 text-gray-700">Đánh giá</h3>
                <div className="space-y-3">
                  {[4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center">
                      <input
                        type="radio"
                        id={`rating-${star}`}
                        name="rating"
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={filters.rating === star}
                        onChange={() => handleFilterChange('rating', star)}
                      />
                      <label htmlFor={`rating-${star}`} className="flex items-center text-sm text-gray-700">
                        {Array.from({ length: star }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                        {Array.from({ length: 5 - star }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-gray-300 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                        <span className="ml-1">trở lên</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Nút reset filter */}
              <button
                onClick={() => {
                  setFilters({
                    priceRange: [0, 1000000],
                    categories: [],
                    rating: 0
                  });
                }}
                className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
            
            {/* Product grid */}
            <div className="md:w-3/4">
              {/* Sort control */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <p className="text-gray-600">
                    <span className="font-semibold text-gray-800">{products.length}</span> / {totalHits} sản phẩm
                  </p>
                  <div className="flex items-center">
                    <label htmlFor="sort" className="mr-2 text-gray-600 whitespace-nowrap">Sắp xếp theo:</label>
                    <select
                      id="sort"
                      className="border rounded-md py-1.5 px-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={sortOption}
                      onChange={handleSortChange}
                    >
                      <option value="relevance">Độ phù hợp</option>
                      <option value="price-low-high">Giá thấp đến cao</option>
                      <option value="price-high-low">Giá cao đến thấp</option>
                      <option value="rating">Đánh giá cao nhất</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Product cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg flex flex-col">
                    <div className="relative cursor-pointer" onClick={() => handleProductClick(product.id)}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-52 object-cover"
                      />
                      {product.discount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category}</span>
                      <h3 
                        className="text-md font-semibold mb-2 text-gray-800 flex-grow cursor-pointer hover:text-blue-600"
                        onClick={() => handleProductClick(product.id)}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={i < product.rating ? "currentColor" : "none"} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({product.rating.toFixed(1)})</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600 mb-4">{formatCurrency(product.price)}₫</p>
                      
                      {/* Quantity controls and Add to cart button */}
                      <div className="mt-auto">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">Số lượng:</span>
                            <div className="flex items-center border border-gray-200 rounded">
                                <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(product.id, (quantityMap[product.id] || 1) - 1);
                                    }}
                                    className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l"
                                    disabled={(quantityMap[product.id] || 1) <= 1}
                                >
                                    <MinusIcon className="h-4 w-4" />
                                </button>
                                <input
                                    type="number"
                                    value={quantityMap[product.id] || 1}
                                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value || '1'))}
                                    className="w-12 text-center border-l border-r px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    min="1"
                                />
                                <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(product.id, (quantityMap[product.id] || 1) + 1);
                                    }}
                                    className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-r"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 font-medium text-sm flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalHits > 0 && (
                <div className="flex justify-center mt-10">
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 0}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        page === 0 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {getPaginationItems().map((item, index) => (
                      item === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={index}
                          onClick={() => handlePageChange(item as number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === item
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {(item as number) + 1}
                        </button>
                      )
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= Math.ceil(totalHits / size) - 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        page >= Math.ceil(totalHits / size) - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;