import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Giao diện cho sản phẩm
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

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('relevance');
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    categories: [] as string[],
    rating: 0
  });

  // Giả lập dữ liệu tìm kiếm - trong thực tế sẽ gọi API
  useEffect(() => {
    setLoading(true);
    // Giả lập gọi API
    setTimeout(() => {
      // Dữ liệu mẫu
      const dummyProducts: Product[] = [
        {
          id: '1',
          name: 'Áo thun cotton',
          price: 250000,
          image: 'https://via.placeholder.com/150',
          category: 'Áo',
          rating: 4.5,
          discount: 10
        },
        {
          id: '2',
          name: 'Quần jean nam',
          price: 450000,
          image: 'https://via.placeholder.com/150',
          category: 'Quần',
          rating: 4.2
        },
        {
          id: '3',
          name: 'Áo khoác denim',
          price: 550000,
          image: 'https://via.placeholder.com/150',
          category: 'Áo khoác',
          rating: 4.8,
          discount: 15
        },
        {
          id: '4',
          name: 'Đầm xòe công sở',
          price: 650000,
          image: 'https://via.placeholder.com/150',
          category: 'Đầm',
          rating: 4.6
        },
        {
          id: '5',
          name: 'Giày thể thao nữ',
          price: 850000,
          image: 'https://via.placeholder.com/150',
          category: 'Giày',
          rating: 4.4,
          discount: 20
        },
        {
          id: '6',
          name: 'Túi xách thời trang',
          price: 750000,
          image: 'https://via.placeholder.com/150',
          category: 'Phụ kiện',
          rating: 4.3
        }
      ];
      
      // Lọc sản phẩm theo query
      const filteredProducts = query 
        ? dummyProducts.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
          )
        : dummyProducts;
      
      setProducts(filteredProducts);
      setLoading(false);
    }, 500);
  }, [query]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
    
    // Sắp xếp sản phẩm
    const sortedProducts = [...products];
    switch(e.target.value) {
      case 'price-low-high':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      // Mặc định là sắp xếp theo độ phù hợp (giữ nguyên)
      default:
        break;
    }
    
    setProducts(sortedProducts);
  };

  const handleFilterChange = (type: FilterType, value: FilterValue) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    // Trong thực tế sẽ áp dụng bộ lọc và gọi API
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Kết quả tìm kiếm cho: "{query}"</h1>
        <p className="text-gray-600">{products.length} sản phẩm được tìm thấy</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filter */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Bộ lọc</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Danh mục</h3>
            <div className="space-y-2">
              {['Áo', 'Quần', 'Váy đầm', 'Giày dép', 'Phụ kiện'].map(category => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    className="mr-2"
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
              ))}
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
            onClick={() => {/* Áp dụng tất cả bộ lọc */}}
          >
            Áp dụng
          </button>
        </div>
        
        {/* Product listing */}
        <div className="w-full md:w-3/4">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Hiển thị {products.length} sản phẩm</p>
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
              <div className="spinner"></div>
              <p className="mt-2 text-gray-600">Đang tải sản phẩm...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.discount && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.discount}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">
                        {product.discount
                          ? (product.price * (1 - product.discount / 100)).toLocaleString()
                          : product.price.toLocaleString()}đ
                      </span>
                      {product.discount && (
                        <span className="text-gray-500 text-sm line-through">
                          {product.price.toLocaleString()}đ
                        </span>
                      )}
                    </div>
                    <button className="w-full mt-3 bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700">
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Không tìm thấy sản phẩm nào phù hợp.</p>
              <p className="mt-2">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage; 