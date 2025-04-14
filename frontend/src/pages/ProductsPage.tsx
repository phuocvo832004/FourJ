import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import ProductCard from '../components/common/ProductCard';
import product1Image from '../assets/product-1.jpg';

interface ApiProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
  stock: number;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface PriceRange {
  id: string;
  label: string;
  min: number;
  max: number | null;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Map API response to Product type
        const mappedProducts: Product[] = data.content.map((item: ApiProduct) => ({
          id: item.id.toString(),
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.imageUrl || product1Image, // Use fallback image if none provided
          category: item.category?.name || 'Uncategorized'
        }));
        
        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(
          mappedProducts.map(product => product.category)
        )).map((name, index) => ({ id: index + 1, name }));
        
        setCategories(uniqueCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Could not load products. Please try again later.');
        
        // Fallback to mock data for development
        const mockProducts = [
          {
            id: '1',
            name: 'Product 1',
            price: 99.99,
            description: 'Product 1 description',
            image: product1Image,
            category: 'Electronics'
          },
          {
            id: '2',
            name: 'Product 2',
            price: 149.99,
            description: 'Product 2 description',
            image: product1Image,
            category: 'Fashion'
          },
        ];
        
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setCategories([
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Fashion' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...products];
    
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
  }, [products, selectedCategories, selectedPriceRanges, searchQuery, sortOption, priceRanges]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Tất cả sản phẩm</h1>

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
              {categories.map(category => (
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

          {(selectedCategories.length > 0 || selectedPriceRanges.length > 0) && (
            <button 
              onClick={() => {
                setSelectedCategories([]);
                setSelectedPriceRanges([]);
                setSearchQuery('');
              }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 