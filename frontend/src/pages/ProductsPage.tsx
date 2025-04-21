import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import ProductCard from '../components/common/ProductCard';
import { useProduct } from '../hooks/useProduct';
import { useNavigate, useLocation } from 'react-router-dom';

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

const ProductsPage: React.FC = () => {
  const { 
    categories, 
    loading, 
    error, 
    getCategories,
    getProductsPaginated
  } = useProduct();
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPage = parseInt(searchParams.get('page') || '0', 10);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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
  
  // Pagination states
  const [page, setPage] = useState<number>(initialPage);
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false);
  const MAX_PRODUCTS_PER_PAGE = 30;

  const loadInitialProducts = useCallback(async () => {
    try {
      const pageSize = 12;
      const result = await getProductsPaginated(initialPage, pageSize);
      setCurrentProducts(result.products);
      setIsLastPage(result.pagination.isLast);
      setPage(initialPage);
      setInitialLoaded(true);
    } catch (err) {
      console.error("Error loading initial products:", err);
    }
  }, [getProductsPaginated, initialPage]);

  useEffect(() => {
    if (categories.length === 0) {
      getCategories();
    }
    
    // Initial product loading with pagination
    loadInitialProducts();
  }, [categories.length, getCategories, loadInitialProducts]);

  const loadMoreProducts = async () => {
    if (isLastPage || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const pageSize = 12;
      
      // Kiểm tra nếu tổng số sản phẩm vượt quá 30
      if (currentProducts.length + pageSize > MAX_PRODUCTS_PER_PAGE) {
        // Chuyển hướng sang trang mới thay vì load thêm
        navigate(`/products?page=${nextPage}`);
        window.scrollTo(0, 0);
        return;
      }
      
      const result = await getProductsPaginated(nextPage, pageSize);
      
      setCurrentProducts(prev => [...prev, ...result.products]);
      setIsLastPage(result.pagination.isLast);
      setPage(nextPage);
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const applyFilters = useCallback(() => {
    if (!initialLoaded || currentProducts.length === 0) return;
    
    let result = [...currentProducts];
    
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
  }, [currentProducts, selectedCategories, selectedPriceRanges, searchQuery, sortOption, priceRanges, initialLoaded]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters, currentProducts]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

  if (loading && !initialLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && (!currentProducts || currentProducts.length === 0)) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">{error}</div>;
  }

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
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
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
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm nào</h3>
              <p className="mt-2 text-gray-500">Hãy thử với bộ lọc khác.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
              
              {/* Load More Button */}
              {!isLastPage && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors disabled:bg-blue-400"
                  >
                    {loadingMore ? (
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
              
              {/* Phân trang */}
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
                
                {!isLastPage && (
                  <button
                    onClick={() => navigate(`/products?page=${initialPage + 1}`)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    Trang sau
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 