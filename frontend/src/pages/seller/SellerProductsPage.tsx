import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../../types';

const SellerProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/seller/products');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((product: Product) => product.category)));
        setCategories(uniqueCategories as string[]);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
        
        // Set demo data for preview purposes
        const demoProducts = [
          {
            id: 'p1',
            name: 'Điện thoại di động XYZ',
            price: 12000000,
            description: 'Điện thoại cao cấp với camera 108MP',
            image: 'https://via.placeholder.com/200',
            category: 'Electronics',
            sellerId: 'seller1',
          },
          {
            id: 'p2',
            name: 'Áo thun nam',
            price: 250000,
            description: 'Áo thun cotton 100% thoáng mát',
            image: 'https://via.placeholder.com/200',
            category: 'Fashion',
            sellerId: 'seller1',
          },
          {
            id: 'p3',
            name: 'Laptop ABC',
            price: 25000000,
            description: 'Laptop cao cấp cho công việc và giải trí',
            image: 'https://via.placeholder.com/200',
            category: 'Electronics',
            sellerId: 'seller1',
          },
          {
            id: 'p4',
            name: 'Giày thể thao nữ',
            price: 850000,
            description: 'Giày đế mềm, phù hợp cho các hoạt động thể thao',
            image: 'https://via.placeholder.com/200',
            category: 'Fashion',
            sellerId: 'seller1',
          },
          {
            id: 'p5',
            name: 'Nồi cơm điện',
            price: 1500000,
            description: 'Nồi cơm điện đa chức năng',
            image: 'https://via.placeholder.com/200',
            category: 'Home & Living',
            sellerId: 'seller1',
          },
        ];
        
        setProducts(demoProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(demoProducts.map(product => product.category)));
        setCategories(uniqueCategories as string[]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        // In a real app, you would call the API to delete the product
        // const response = await fetch(`/api/seller/products/${id}`, {
        //   method: 'DELETE',
        // });
        
        // if (!response.ok) {
        //   throw new Error(`Failed to delete product: ${response.status}`);
        // }
        
        // Remove the product from the state
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Apply filters and sorting
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => 
      categoryFilter === 'all' || product.category === categoryFilter
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? a.price - b.price 
          : b.price - a.price;
      } else if (sortBy === 'category') {
        return sortOrder === 'asc' 
          ? a.category.localeCompare(b.category) 
          : b.category.localeCompare(a.category);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Quản lý sản phẩm</h1>
          <Link to="/seller/products/add">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              + Thêm sản phẩm mới
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full md:w-1/4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-1/4">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sắp xếp theo
                </label>
                <div className="flex">
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Tên sản phẩm</option>
                    <option value="price">Giá</option>
                    <option value="category">Danh mục</option>
                  </select>
                  <button
                    onClick={handleSortOrderToggle}
                    className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy sản phẩm nào
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/products/${product.id}`} className="text-gray-600 hover:text-gray-900 mr-4">
                          Xem
                        </Link>
                        <Link to={`/seller/products/edit/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Đang hiển thị <span className="font-medium">{filteredProducts.length}</span> sản phẩm
              {categoryFilter !== 'all' && (
                <span> trong danh mục <span className="font-medium">{categoryFilter}</span></span>
              )}
              {searchTerm && (
                <span> với từ khóa "<span className="font-medium">{searchTerm}</span>"</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SellerProductsPage; 