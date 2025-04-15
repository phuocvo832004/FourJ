import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Seller, Product, Order } from '../../types';

const SellerDashboardPage: React.FC = () => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        
        // Fetch seller profile
        const profileResponse = await fetch('/api/seller/profile');
        if (!profileResponse.ok) {
          throw new Error('Failed to load seller profile');
        }
        const profileData = await profileResponse.json();
        setSeller(profileData);
        
        // Fetch recent orders
        const ordersResponse = await fetch('/api/seller/orders/recent');
        if (!ordersResponse.ok) {
          throw new Error('Failed to load recent orders');
        }
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);
        
        // Fetch top products
        const productsResponse = await fetch('/api/seller/products/top');
        if (!productsResponse.ok) {
          throw new Error('Failed to load top products');
        }
        const productsData = await productsResponse.json();
        setTopProducts(productsData);
        
        // Fetch statistics
        const statsResponse = await fetch('/api/seller/stats');
        if (!statsResponse.ok) {
          throw new Error('Failed to load statistics');
        }
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError('Không thể tải dữ liệu người bán. Vui lòng thử lại sau.');
        
        // Set demo data for preview purposes
        setSeller({
          id: '1',
          userId: '1',
          name: 'Shop ABC',
          description: 'Chuyên cung cấp sản phẩm chất lượng cao',
          logo: 'https://via.placeholder.com/150',
          address: 'Hà Nội, Việt Nam',
          phoneNumber: '0123456789',
          email: 'shop@example.com',
          rating: 4.8,
          status: 'approved',
          createdAt: '2023-01-01T00:00:00Z',
        });
        
        setRecentOrders([
          {
            id: '1001',
            userId: 'user1',
            items: [
              {
                id: 'item1',
                productId: 'prod1',
                name: 'Sản phẩm A',
                price: 250000,
                quantity: 2,
                image: 'https://via.placeholder.com/100',
              }
            ],
            total: 500000,
            status: 'pending',
            createdAt: '2023-05-15T10:30:00Z',
            shippingAddress: 'Hà Nội, Việt Nam',
            paymentMethod: 'cod',
            sellerId: '1',
          },
          {
            id: '1002',
            userId: 'user2',
            items: [
              {
                id: 'item2',
                productId: 'prod2',
                name: 'Sản phẩm B',
                price: 350000,
                quantity: 1,
                image: 'https://via.placeholder.com/100',
              }
            ],
            total: 350000,
            status: 'processing',
            createdAt: '2023-05-14T14:20:00Z',
            shippingAddress: 'TP Hồ Chí Minh, Việt Nam',
            paymentMethod: 'credit_card',
            sellerId: '1',
          },
        ]);
        
        setTopProducts([
          {
            id: 'prod1',
            name: 'Sản phẩm A',
            price: 250000,
            description: 'Mô tả sản phẩm A',
            image: 'https://via.placeholder.com/200',
            category: 'Electronics',
            sellerId: '1',
          },
          {
            id: 'prod2',
            name: 'Sản phẩm B',
            price: 350000,
            description: 'Mô tả sản phẩm B',
            image: 'https://via.placeholder.com/200',
            category: 'Fashion',
            sellerId: '1',
          },
        ]);
        
        setStats({
          totalSales: 8500000,
          pendingOrders: 5,
          totalProducts: 25,
          activeProducts: 20,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {seller && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                <img src={seller.logo} alt={seller.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{seller.name}</h1>
                <p className="text-gray-600">{seller.status === 'approved' ? 'Đã xác thực' : 'Chờ xác thực'}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link to="/seller/products/add">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Thêm sản phẩm
                </button>
              </Link>
              <Link to="/seller/settings">
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                  Cài đặt
                </button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng doanh thu</h3>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Đơn hàng chờ xử lý</h3>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng sản phẩm</h3>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Sản phẩm đang bán</h3>
              <p className="text-2xl font-bold">{stats.activeProducts}</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md mb-8">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Đơn hàng gần đây</h2>
                <Link to="/seller/orders" className="text-blue-600 hover:text-blue-800">
                  Xem tất cả
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{order.userId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                          ${order.status === 'shipping' ? 'bg-purple-100 text-purple-800' : ''}
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                          ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {order.status === 'pending' && 'Chờ xử lý'}
                          {order.status === 'processing' && 'Đang xử lý'}
                          {order.status === 'shipping' && 'Đang giao hàng'}
                          {order.status === 'delivered' && 'Đã giao hàng'}
                          {order.status === 'cancelled' && 'Đã hủy'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/seller/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Sản phẩm bán chạy</h2>
                <Link to="/seller/products" className="text-blue-600 hover:text-blue-800">
                  Quản lý sản phẩm
                </Link>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topProducts.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                      <p className="mt-1 text-sm font-semibold">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link 
                      to={`/seller/products/edit/${product.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 mr-4"
                    >
                      Chỉnh sửa
                    </Link>
                    <Link 
                      to={`/products/${product.id}`}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Xem
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SellerDashboardPage; 