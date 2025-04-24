import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import ProductCard from '../components/common/ProductCard';
import { useProduct } from '../hooks/useProduct';
import { useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import searchApi from '../api/searchApi';

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

const ProductsPage: React.FC = () => {
  const { 
    useCategories,
    useInfinitePublicProducts,
    prefetchProduct
  } = useProduct();
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPage = parseInt(searchParams.get('page') || '0', 10);

  // Sử dụng React Query hooks
  const { 
    data: categoriesData, 
    isLoading: isCategoriesLoading 
  } = useCategories();
  
  const { 
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isProductsLoading,
    error 
  } = useInfinitePublicProducts(12);
  
  const categories = categoriesData || [];
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRanges] = useState<PriceRange[]>([
    { id: 'under-50', label: 'Dưới $50', min: 0, max: 50 },
    { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
    { id: '100-200', label: '$100 - $200', min: 100, max: 200 },
    { id: 'over-200', label: 'Trên $200', min: 200, max: null },
  ]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('default');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Lấy tất cả sản phẩm từ infinite query
  const allProducts = useMemo(() => {
    return productsData?.pages.flatMap(page => page.products) || [];
  }, [productsData]);
  
  // Prefetch product details khi hover
  const handlePrefetchProduct = (id: string) => {
    prefetchProduct(id);
  };

  // Xử lý tìm kiếm
  const handleServerSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setFilteredProducts(allProducts);
      return;
    }
    
    try {
      // Gọi API search
      const result = await searchApi.searchProductsSimple(
        query,
        0,  // Bắt đầu từ trang 0
        12  // Số lượng sản phẩm mỗi trang
      );
      
      // Cập nhật dữ liệu
      if (result.products && Array.isArray(result.products)) {
        // Ép kiểu result.products thành Product[]
        const products = result.products as unknown as Product[];
        setFilteredProducts(products);
      } else {
        // Trường hợp không có kết quả
        setFilteredProducts([]);
      }
      
    } catch (error) {
      console.error("Error searching products:", error);
      setFilteredProducts([]);
    }
  };

  // Memoize applyFilters function để ngăn render không cần thiết
  const applyFilters = useCallback(() => {
    if (!allProducts.length) return;
    
    let result = [...allProducts];
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(product => 
        selectedCategories.includes(product.category)
      );
    }
    
    // Apply price range filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter(product => {
        return selectedPriceRanges.some(rangeId => {
          const range = priceRanges.find(r => r.id === rangeId);
          if (range) {
            if (range.max === null) {
              return product.price >= range.min;
            }
            return product.price >= range.min && product.price < range.max;
          }
          return false;
        });
      });
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortOption !== 'default') {
      switch(sortOption) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'name-asc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }
    }
    
    setFilteredProducts(result);
  }, [allProducts, selectedCategories, selectedPriceRanges, searchQuery, sortOption, priceRanges]);

  // Apply filter khi dữ liệu thay đổi
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(c => c !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  const handlePriceRangeChange = (rangeId: string) => {
    setSelectedPriceRanges(prev => {
      if (prev.includes(rangeId)) {
        return prev.filter(id => id !== rangeId);
      } else {
        return [...prev, rangeId];
      }
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSearchQuery('');
    setSortOption('default');
  };

  // Custom SearchBar component cho ProductsPage
  const ProductSearchBar = () => {
    const [localQuery, setLocalQuery] = useState(searchQuery);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const suggestionRef = React.useRef<HTMLDivElement>(null);

    // Xử lý click ra ngoài để đóng suggestion
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Fetch suggestions khi người dùng gõ
    useEffect(() => {
      const loadSuggestions = async () => {
        if (localQuery.length < 2) {
          setSuggestions([]);
          return;
        }

        setIsLoading(true);
        
        try {
          const results = await searchApi.getSuggestions(localQuery);
          setSuggestions(results);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      };

      // Debounce để tránh gọi API quá nhiều
      const timeoutId = setTimeout(() => {
        loadSuggestions();
      }, 300);

      return () => {
        clearTimeout(timeoutId);
      };
    }, [localQuery]);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (localQuery.trim()) {
        handleServerSearch(localQuery.trim());
        setShowSuggestions(false);
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      setLocalQuery(suggestion);
      handleServerSearch(suggestion);
      setShowSuggestions(false);
    };

    return (
      <div className="relative w-full" ref={suggestionRef}>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tìm kiếm sản phẩm..."
            value={localQuery}
            onChange={(e) => {
              setLocalQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        </form>

        {/* Suggestions dropdown */}
        {showSuggestions && (localQuery.length >= 2) && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">Đang tìm kiếm...</div>
            ) : suggestions.length > 0 ? (
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">Không có gợi ý</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const isLoading = isProductsLoading || isCategoriesLoading;

  if (isLoading && !allProducts.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && (!allProducts || allProducts.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
        {error instanceof Error ? error.message : 'Không thể tải sản phẩm'}
      </div>
    );
  }

  const productsToDisplay = 
    searchQuery || selectedCategories.length > 0 || selectedPriceRanges.length > 0 
    ? filteredProducts 
    : allProducts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Tất cả sản phẩm</h1>

      {/* Thông báo trang hiện tại */}
      {initialPage > 0 && (
        <div className="mb-4 text-sm text-gray-500">
          Đang xem trang {initialPage + 1}
        </div>
      )}

      {/* Search and Sort */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/2">
          <ProductSearchBar />
        </div>
        <div className="w-full md:w-1/3">
          <select
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="name-asc">Tên: A-Z</option>
            <option value="name-desc">Tên: Z-A</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="md:col-span-1 space-y-6 bg-white p-4 rounded-lg shadow-sm">
          <div>
            <h3 className="font-semibold text-lg mb-3">Danh mục</h3>
            <div className="space-y-2">
              {categories && categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryChange(category.name)}
                  />
                  <span className="ml-2">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Khoảng giá</h3>
            <div className="space-y-2">
              {priceRanges.map(range => (
                <label key={range.id} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={selectedPriceRanges.includes(range.id)}
                    onChange={() => handlePriceRangeChange(range.id)}
                  />
                  <span className="ml-2">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {(selectedCategories.length > 0 || selectedPriceRanges.length > 0 || searchQuery) && (
            <button 
              onClick={handleResetFilters}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="md:col-span-3">
          {productsToDisplay.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm nào</h3>
              <p className="mt-2 text-gray-500">Hãy thử với bộ lọc khác.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsToDisplay.map((product) => (
                  <div 
                    key={product.id} 
                    onMouseEnter={() => handlePrefetchProduct(product.id)}
                  >
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
              
              {/* Load More Button - chỉ hiển thị khi không có filter */}
              {!searchQuery && !selectedCategories.length && !selectedPriceRanges.length && hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors disabled:bg-blue-400"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center">
                        <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Đang tải...
                      </span>
                    ) : (
                      'Xem thêm sản phẩm'
                    )}
                  </button>
                </div>
              )}
              
              {/* Phân trang - chỉ hiển thị khi không có filter */}
              {!searchQuery && !selectedCategories.length && !selectedPriceRanges.length && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                  {initialPage > 0 && (
                    <button
                      onClick={() => navigate(`/products?page=${initialPage - 1}`)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    >
                      Trang trước
                    </button>
                  )}
                  
                  <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg">
                    Trang {initialPage + 1}
                  </span>
                  
                  {hasNextPage && (
                    <button
                      onClick={() => navigate(`/products?page=${initialPage + 1}`)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    >
                      Trang sau
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 