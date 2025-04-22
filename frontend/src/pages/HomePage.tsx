import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
// Import hình ảnh sản phẩm
import product1Image from '../assets/product-1.jpg';

interface Category {
  id: number;
  name: string;
  imageUrl?: string;
}

interface FeaturedProduct extends Product {
  isNew?: boolean;
  discountPercentage?: number;
}

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // Fetch featured products
        // const productsResponse = await fetch('/api/products/featured');
        // if (!productsResponse.ok) {
        //   throw new Error('Không thể tải sản phẩm nổi bật');
        // }
        //const productsData = await productsResponse.ok ? await productsResponse.json() : [];
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Không thể tải danh mục sản phẩm');
        }
        
        const categoriesData = await categoriesResponse.ok ? await categoriesResponse.json() : [];
        
        //setFeaturedProducts(productsData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        
        // Fallback mock data
        setFeaturedProducts([
          {
            id: '1',
            name: 'Sản phẩm nổi bật 1',
            price: 99.99,
            description: 'Mô tả sản phẩm 1',
            image: product1Image,
            category: 'Điện tử',
            isNew: true
          },
          {
            id: '2',
            name: 'Sản phẩm nổi bật 2',
            price: 149.99,
            description: 'Mô tả sản phẩm 2',
            image: product1Image,
            category: 'Quần áo',
            discountPercentage: 15
          },
          {
            id: '3',
            name: 'Sản phẩm nổi bật 3',
            price: 199.99,
            description: 'Mô tả sản phẩm 3',
            image: product1Image,
            category: 'Đồ gia dụng'
          },
          {
            id: '4',
            name: 'Sản phẩm nổi bật 4',
            price: 299.99,
            description: 'Mô tả sản phẩm 4',
            image: product1Image,
            category: 'Làm đẹp',
            isNew: true
          }
        ]);
        
        setCategories([
          { id: 1, name: 'Điện tử' },
          { id: 2, name: 'Quần áo' },
          { id: 3, name: 'Đồ gia dụng' },
          { id: 4, name: 'Làm đẹp' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Khám phá sản phẩm tuyệt vời
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl mb-8"
            >
              Mua sắm các xu hướng mới nhất với giá cả và chất lượng tốt nhất.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link 
                to="/products" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium inline-block transition-colors"
              >
                Mua ngay
              </Link>
            </motion.div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="hidden md:block absolute right-0 bottom-0 w-1/3 h-full bg-blue-500 opacity-50 transform -skew-x-12 translate-x-20"></div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Danh mục sản phẩm</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Link to={`/products?category=${category.name}`} key={category.id}>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow h-full flex flex-col justify-center items-center"
                  >
                    {category.imageUrl && (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="w-16 h-16 object-contain mb-4"
                      />
                    )}
                    <h3 className="text-lg font-medium">{category.name}</h3>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Sản phẩm nổi bật</h2>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -10 }}
                  className="relative bg-white rounded-lg shadow-md overflow-hidden h-full"
                >
                  {product.isNew && (
                    <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 z-10">
                      Mới
                    </div>
                  )}
                  {product.discountPercentage && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 z-10">
                      -{product.discountPercentage}%
                    </div>
                  )}
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <p className="text-blue-600 font-bold mb-2">{formatCurrency(product.price)}₫</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                        Xem chi tiết
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link 
              to="/products" 
              className="inline-block bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Seller Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-blue-50 rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0 bg-blue-600 md:w-48 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="p-8">
                <div className="uppercase tracking-wide text-sm text-blue-700 font-semibold">Cơ hội dành cho bạn</div>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">Bắt đầu bán hàng trên nền tảng của chúng tôi</h2>
                <p className="mt-4 text-gray-600">
                  Tiếp cận hàng triệu khách hàng và mở rộng kinh doanh của bạn với giải pháp bán hàng trực tuyến của chúng tôi. 
                  Dễ dàng tạo cửa hàng, quản lý sản phẩm và theo dõi đơn hàng.
                </p>
                <div className="mt-6 space-y-4 md:space-y-0 md:space-x-4 md:flex items-center">
                  <Link 
                    to="/seller/register" 
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                  <Link 
                    to="/contact" 
                    className="inline-block px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Tìm hiểu thêm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh chóng</h3>
              <p className="text-gray-600">Chúng tôi giao hàng nhanh chóng trong vòng 24h với các đơn nội thành.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Bảo mật thông tin</h3>
              <p className="text-gray-600">Thông tin khách hàng được bảo mật tuyệt đối, an toàn thanh toán.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-blue-600 text-4xl mb-4 flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hỗ trợ 24/7</h3>
              <p className="text-gray-600">Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của khách hàng.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Đăng ký nhận tin</h2>
          <p className="mb-8 max-w-xl mx-auto">Đăng ký để nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt.</p>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              placeholder="Email của bạn" 
              className="flex-grow px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 