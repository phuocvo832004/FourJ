import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Seller, Product, Order } from '../../types';
import DashboardCard from '../../components/ui/DashboardCard';
import StatCard from '../../components/ui/StatCard';
import { useSellerOrderStatistics } from '../../hooks/useOrder';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const SellerDashboardPage: React.FC = () => {
  const { statistics, loading: statsLoading, error: statsError } = useSellerOrderStatistics();
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
  });

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setSellerLoading(true);
        
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
        
        setSellerError(null);
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setSellerError('Không thể tải dữ liệu người bán. Vui lòng thử lại sau.');
        
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
            totalAmount: 500000,
            status: 'pending',
            createdAt: '2023-05-15T10:30:00Z',
            shippingAddress: 'Hà Nội, Việt Nam',
            paymentMethod: 'cod',
            sellerId: '1',
            recipientName: 'Nguyễn Văn A',
            recipientPhone: '0987654321',
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
            totalAmount: 350000,
            status: 'processing',
            createdAt: '2023-05-14T14:20:00Z',
            shippingAddress: 'TP Hồ Chí Minh, Việt Nam',
            paymentMethod: 'credit_card',
            sellerId: '1',
            recipientName: 'Trần Thị B',
            recipientPhone: '0912345678',
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
        setSellerLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  const loading = statsLoading || sellerLoading;
  const error = statsError || sellerError;

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
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Chart data for orders by day
  const orderLineChartData = {
    labels: statistics ? Object.keys(statistics.orderCountByDay).map(date => formatDate(date)) : [],
    datasets: [
      {
        label: 'Số đơn hàng',
        data: statistics ? Object.values(statistics.orderCountByDay) : [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Chart data for revenue by day
  const revenueLineChartData = {
    labels: statistics ? Object.keys(statistics.revenueByDay).map(date => formatDate(date)) : [],
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: statistics ? Object.values(statistics.revenueByDay) : [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Chart data for order status distribution
  const orderStatusChartData = {
    labels: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn thành', 'Đã hủy'],
    datasets: [
      {
        data: statistics ? [
          statistics.pendingOrders,
          statistics.processingOrders,
          statistics.shippedOrders,
          statistics.deliveredOrders,
          statistics.completedOrders,
          statistics.cancelledOrders
        ] : [],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="pb-8">
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
              <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-blue-100">
                <img src={seller.logo} alt={seller.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
                <div className="flex items-center">
                  <span className={`text-sm px-2 py-1 rounded-full ${seller.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {seller.status === 'approved' ? 'Đã xác thực' : 'Chờ xác thực'}
                  </span>
                  {seller.rating && (
                    <div className="flex items-center ml-2">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span className="ml-1 text-sm text-gray-600">{seller.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/seller/products/add" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Thêm sản phẩm
              </Link>
              <Link to="/seller/settings" className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Cài đặt cửa hàng
              </Link>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Doanh số"
              value={formatCurrency(stats.totalSales)}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              }
              color="blue"
              change={{ value: '5%', isPositive: true }}
            />
            <StatCard 
              title="Đơn hàng chờ xử lý"
              value={stats.pendingOrders}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              }
              color="yellow"
            />
            <StatCard 
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              }
              color="purple"
            />
            <StatCard 
              title="Sản phẩm đang bán"
              value={stats.activeProducts}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                </svg>
              }
              color="green"
              change={{ value: '+2', isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <DashboardCard
              title="Đơn hàng gần đây"
              className="lg:col-span-2"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              }
              footer={
                <Link to="/seller/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center transition duration-150">
                  Xem tất cả đơn hàng
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              }
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Xem</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/seller/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 transition duration-150">
                              Chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          Không có đơn hàng nào gần đây
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </DashboardCard>

            {/* Top Products */}
            <DashboardCard
              title="Sản phẩm bán chạy"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              }
              footer={
                <Link to="/seller/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center transition duration-150">
                  Xem tất cả sản phẩm
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              }
            >
              {topProducts.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {topProducts.map((product) => (
                    <li key={product.id} className="py-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-100 overflow-hidden">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500 truncate">{formatCurrency(product.price)}</p>
                        </div>
                        <div>
                          <Link to={`/seller/products/edit/${product.id}`} className="inline-flex items-center p-1.5 border border-gray-300 rounded-full text-gray-700 bg-white hover:bg-gray-50 transition duration-150">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Không có sản phẩm nào</p>
                </div>
              )}
            </DashboardCard>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        <div className="lg:col-span-2">
          <DashboardCard title="Đơn hàng theo ngày">
            {statistics && <Line data={orderLineChartData} options={chartOptions} />}
          </DashboardCard>
        </div>
        <div>
          <DashboardCard title="Phân bố trạng thái">
            {statistics && <Pie data={orderStatusChartData} />}
          </DashboardCard>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        <div className="lg:col-span-2">
          <DashboardCard title="Doanh thu theo ngày">
            {statistics && <Line data={revenueLineChartData} options={chartOptions} />}
          </DashboardCard>
        </div>
        <div>
          <DashboardCard title="Sản phẩm nổi bật">
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center p-3 border rounded-lg hover:bg-blue-50 transition">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <div className="ml-3 flex-1">
                    <h4 className="font-medium text-gray-800">{product.name}</h4>
                    <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              ))}
              <Link
                to="/seller/products"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          </DashboardCard>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <DashboardCard title="Truy cập nhanh">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Link to="/seller/products/add" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition">
              <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Thêm sản phẩm</span>
            </Link>
            <Link to="/seller/orders" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition">
              <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Quản lý đơn hàng</span>
            </Link>
            <Link to="/seller/products" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition">
              <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Cập nhật giá</span>
            </Link>
            <Link to="/seller/analytics" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition">
              <svg className="w-8 h-8 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Phân tích bán hàng</span>
            </Link>
            <Link to="/seller/settings" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition">
              <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Cài đặt cửa hàng</span>
            </Link>
            <Link to="/help" className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition">
              <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Trợ giúp</span>
            </Link>
          </div>
        </DashboardCard>
      </motion.div>
    </div>
  );
};

export default SellerDashboardPage; 