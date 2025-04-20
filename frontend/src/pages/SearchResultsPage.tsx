import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import searchApi, { SearchResult, FacetEntry } from '../api/searchApi';

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

// Định nghĩa các kiểu dữ liệu
type FilterType = 'priceRange' | 'categories' | 'rating';
type FilterValue = number | number[] | string[];
type ApiSortOption = 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC' | 'NEWEST' | 'BEST_SELLING' | 'HIGHEST_RATED';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('relevance');
  const [totalHits, setTotalHits] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [facets, setFacets] = useState<Record<string, FacetEntry[]>>({});
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000],
    categories: [] as string[],
    rating: 0
  });

  // Fetch sản phẩm từ search-service
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
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
        const searchParams = {
          query,
          page,
          size,
          sortOption: apiSortOption,
          categories: filters.categories.length > 0 ? filters.categories : undefined,
          priceRange: {
            min: filters.priceRange[0],
            max: filters.priceRange[1]
          },
          includeAggregations: true
        };
        
        // Gọi API
        const result: SearchResult = await searchApi.searchProducts(searchParams);
        
        // Map dữ liệu API sang định dạng hiển thị
        const mappedProducts: Product[] = result.products.map(doc => ({
          id: doc.id,
          name: doc.name,
          price: doc.price,
          image: doc.imageUrl || 'https://via.placeholder.com/150',
          category: doc.categoryName,
          rating: doc.rating || 4.0,
          // Giả định có trường discount, có thể sẽ cần bổ sung vào API
          discount: Math.floor(Math.random() * 30) // Giả lập discount
        }));
        
        setProducts(mappedProducts);
        setTotalHits(result.totalHits);
        setFacets(result.facets || {});
      } catch (error) {
        console.error('Error fetching search results:', error);
        setProducts([]);
        setTotalHits(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [query, sortOption, filters, page, size]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    setPage(0); // Reset về trang đầu khi thay đổi sort
  };

  const handleFilterChange = (type: FilterType, value: FilterValue) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    setPage(0); // Reset về trang đầu khi thay đổi filter
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  // Tính số trang
  const totalPages = Math.ceil(totalHits / size);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Kết quả tìm kiếm cho: "{query}"</h1>
        <p className="text-gray-600">{totalHits} sản phẩm được tìm thấy</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filter */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Danh mục</h3>
            <div className="space-y-2">
              {facets.categories && facets.categories.map(category => (
                <div key={category.key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category.key}`}
                    className="mr-2"
                    checked={filters.categories.includes(category.key)}
                    onChange={() => {
                      const isSelected = filters.categories.includes(category.key);
                      const newCategories = isSelected
                        ? filters.categories.filter(c => c !== category.key)
                        : [...filters.categories, category.key];
                      handleFilterChange('categories', newCategories);
                    }}
                  />
                  <label htmlFor={`category-${category.key}`}>
                    {category.key} ({category.count})
                  </label>
                </div>
              ))}
              
              {/* Hiển thị danh mục mặc định nếu không có facet */}
              {(!facets.categories || facets.categories.length === 0) && 
                ['Áo', 'Quần', 'Váy đầm', 'Giày dép', 'Phụ kiện'].map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      className="mr-2"
                      checked={filters.categories.includes(category)}
                      onChange={() => {
                        const isSelected = filters.categories.includes(category);
                        const newCategories = isSelected
                          ? filters.categories.filter(c => c !== category)
                          : [...filters.categories, category];
                        handleFilterChange('categories', newCategories);
                      }}
                    />
                    <label htmlFor={`category-${category}`}>{category}</label>
                  </div>
                ))
              }
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Khoảng giá</h3>
            <div className="flex justify-between mb-2">
              <span>{filters.priceRange[0].toLocaleString()}đ</span>
              <span>{filters.priceRange[1].toLocaleString()}đ</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000000"
              step="100000"
              className="w-full"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
            />
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Đánh giá</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center">
                  <input
                    type="radio"
                    id={`rating-${star}`}
                    name="rating"
                    className="mr-2"
                    checked={filters.rating === star}
                    onChange={() => handleFilterChange('rating', star)}
                  />
                  <label htmlFor={`rating-${star}`} className="flex items-center">
                    {[...Array(star)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                    {[...Array(5-star)].map((_, i) => (
                      <span key={i} className="text-gray-300">★</span>
                    ))}
                    <span className="ml-1">trở lên</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={() => setPage(0)}
          >
            Áp dụng
          </button>
        </div>
        
        {/* Product listing */}
        <div className="w-full md:w-3/4">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Hiển thị {products.length} / {totalHits} sản phẩm</p>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-gray-600">Sắp xếp theo:</label>
                <select
                  id="sort"
                  className="border rounded p-1"
                  value={sortOption}
                  onChange={handleSortChange}
                >
                  <option value="relevance">Độ phù hợp</option>
                  <option value="price-low-high">Giá thấp đến cao</option>
                  <option value="price-high-low">Giá cao đến thấp</option>
                  <option value="rating">Đánh giá</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải sản phẩm...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                    {product.discount && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-1 truncate">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                      <span className="text-gray-600 text-sm ml-1">{product.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">
                        {product.price.toLocaleString()}đ
                      </span>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
              <p className="text-gray-600">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className={`px-3 py-1 rounded ${
                    page === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  &laquo;
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  // Hiển thị tối đa 5 nút trang
                  if (
                    i === 0 || 
                    i === totalPages - 1 || 
                    (i >= page - 1 && i <= page + 1)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-1 rounded ${
                          page === i ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  } else if (i === page - 2 || i === page + 2) {
                    return <span key={i} className="px-2 self-end">...</span>;
                  }
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages - 1}
                  className={`px-3 py-1 rounded ${
                    page === totalPages - 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage; 