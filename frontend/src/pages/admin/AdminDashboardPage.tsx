import React from 'react';
import { Link } from 'react-router-dom';
import AdminCard from '../../components/ui/AdminCard';
import AdminStatCard from '../../components/ui/AdminStatCard';
import AdminChart from '../../components/ui/AdminChart';
import { motion } from 'framer-motion';

const AdminDashboardPage: React.FC = () => {
  // Mock data cho các thống kê
  const stats = [
    {
      title: 'Tổng doanh thu',
      value: '2.452.000.000 ₫',
      change: { value: '12.5%', direction: 'up' },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      color: 'indigo'
    },
    {
      title: 'Đơn hàng',
      value: '1.245',
      change: { value: '8.2%', direction: 'up' },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Sản phẩm đã bán',
      value: '3.257',
      change: { value: '5.7%', direction: 'up' },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Khách hàng mới',
      value: '856',
      change: { value: '2.3%', direction: 'down' },
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      ),
      color: 'red'
    },
  ];

  // Mock data cho doanh thu theo tháng
  const revenueData = [
    { label: 'T1', value: 120 },
    { label: 'T2', value: 145 },
    { label: 'T3', value: 132 },
    { label: 'T4', value: 167 },
    { label: 'T5', value: 182 },
    { label: 'T6', value: 196 },
    { label: 'T7', value: 189 },
    { label: 'T8', value: 210 },
    { label: 'T9', value: 225 },
    { label: 'T10', value: 215 },
    { label: 'T11', value: 245 },
    { label: 'T12', value: 272 },
  ];

  // Mock data cho các đơn hàng gần đây
  const recentOrders = [
    { id: 'ORD-001', customer: 'Nguyễn Văn A', date: '10/04/2023', amount: '1.250.000 ₫', status: 'Đã giao hàng' },
    { id: 'ORD-002', customer: 'Trần Thị B', date: '09/04/2023', amount: '850.000 ₫', status: 'Đang giao hàng' },
    { id: 'ORD-003', customer: 'Lê Văn C', date: '08/04/2023', amount: '2.150.000 ₫', status: 'Đã giao hàng' },
    { id: 'ORD-004', customer: 'Phạm Thị D', date: '07/04/2023', amount: '1.750.000 ₫', status: 'Đã hủy' },
    { id: 'ORD-005', customer: 'Hoàng Văn E', date: '06/04/2023', amount: '3.200.000 ₫', status: 'Đã giao hàng' },
  ];

  // Mock data cho phân bố sản phẩm theo danh mục
  const categoryData = [
    { category: 'Điện thoại', percentage: 35 },
    { category: 'Laptop', percentage: 25 },
    { category: 'Máy tính bảng', percentage: 15 },
    { category: 'Đồng hồ thông minh', percentage: 10 },
    { category: 'Phụ kiện', percentage: 15 },
  ];

  // Mock data cho doanh thu theo khách hàng
  const customerSalesData = [
    { label: 'Mới', value: 35 },
    { label: 'Quay lại', value: 45 },
    { label: 'VIP', value: 20 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao hàng':
        return 'bg-green-100 text-green-800';
      case 'Đang giao hàng':
        return 'bg-blue-100 text-blue-800';
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <AdminStatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change as { value: string; direction: 'up' | 'down' }}
            color={stat.color as 'indigo' | 'green' | 'red' | 'blue' | 'yellow' | 'purple'}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard
          title="Doanh thu theo tháng"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
          actions={
            <div className="flex items-center">
              <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option>Năm nay</option>
                <option>Năm trước</option>
              </select>
            </div>
          }
        >
          <AdminChart 
            data={revenueData} 
            type="line" 
            height={250}
            color="#4f46e5"
          />
        </AdminCard>

        <AdminCard
          title="Phân bố sản phẩm theo danh mục"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
        >
          <div className="space-y-5 pt-2">
            {categoryData.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{category.category}</span>
                  <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: index === 0 ? '#4f46e5' : 
                                      index === 1 ? '#3b82f6' : 
                                      index === 2 ? '#8b5cf6' : 
                                      index === 3 ? '#ec4899' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Đơn hàng gần đây */}
        <AdminCard
          title="Đơn hàng gần đây"
          className="lg:col-span-2"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          footer={
            <Link to="/admin/orders" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center transition-colors duration-200">
              Xem tất cả đơn hàng
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          }
        >
          <div className="overflow-x-auto -mx-6 -my-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Xem</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>

        {/* Doanh thu theo khách hàng */}
        <AdminCard
          title="Doanh thu theo khách hàng"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        >
          <div className="py-6">
            <AdminChart 
              data={customerSalesData} 
              type="bar" 
              height={160}
              color="#8b5cf6"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-indigo-50">
                <div className="text-2xl font-bold text-indigo-700">35%</div>
                <div className="text-xs text-gray-500">Khách mới</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-700">45%</div>
                <div className="text-xs text-gray-500">Quay lại</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-50">
                <div className="text-2xl font-bold text-purple-700">20%</div>
                <div className="text-xs text-gray-500">VIP</div>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminCard
          title="Hành động nhanh"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        >
          <div className="grid grid-cols-2 gap-4 py-2">
            <Link 
              to="/admin/products/add" 
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Thêm sản phẩm</span>
            </Link>
            <Link 
              to="/admin/users" 
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Thêm người dùng</span>
            </Link>
            <Link 
              to="/admin/orders" 
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Đơn hàng mới</span>
            </Link>
            <Link 
              to="/admin/settings" 
              className="flex flex-col items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Cài đặt</span>
            </Link>
          </div>
        </AdminCard>

        <AdminCard
          title="Hoạt động gần đây"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          className="col-span-2"
        >
          <div className="space-y-4 py-2">
            {[
              { user: 'Admin', action: 'đã thêm sản phẩm mới', target: 'iPhone 13 Pro', time: '5 phút trước', icon: 'add' },
              { user: 'Nguyễn Văn A', action: 'đã đặt đơn hàng', target: '#ORD-006', time: '15 phút trước', icon: 'order' },
              { user: 'Admin', action: 'đã cập nhật trạng thái đơn hàng', target: '#ORD-005', time: '30 phút trước', icon: 'update' },
              { user: 'Trần Thị B', action: 'đã đăng ký tài khoản mới', target: '', time: '1 giờ trước', icon: 'user' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className={`p-2 rounded-lg mr-3 ${
                  activity.icon === 'add' ? 'bg-green-100 text-green-600' :
                  activity.icon === 'order' ? 'bg-blue-100 text-blue-600' :
                  activity.icon === 'update' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  {activity.icon === 'add' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  {activity.icon === 'order' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  )}
                  {activity.icon === 'update' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {activity.icon === 'user' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                    {activity.target && <span className="font-medium"> {activity.target}</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage; 