import React from 'react';

const AdminDashboardPage: React.FC = () => {
  // Mock data cho các thống kê
  const stats = [
    { label: 'Tổng doanh thu', value: '2.452.000.000 ₫', change: '+12.5%', changeType: 'positive' },
    { label: 'Đơn hàng', value: '1.245', change: '+8.2%', changeType: 'positive' },
    { label: 'Sản phẩm đã bán', value: '3.257', change: '+5.7%', changeType: 'positive' },
    { label: 'Khách hàng mới', value: '856', change: '-2.3%', changeType: 'negative' },
  ];

  // Mock data cho doanh thu theo tháng
  const revenueData = [
    { month: 'T1', value: 120 },
    { month: 'T2', value: 145 },
    { month: 'T3', value: 132 },
    { month: 'T4', value: 167 },
    { month: 'T5', value: 182 },
    { month: 'T6', value: 196 },
    { month: 'T7', value: 189 },
    { month: 'T8', value: 210 },
    { month: 'T9', value: 225 },
    { month: 'T10', value: 215 },
    { month: 'T11', value: 245 },
    { month: 'T12', value: 272 },
  ];

  // Tìm giá trị cao nhất để chuẩn hóa chiều cao của biểu đồ
  const maxValue = Math.max(...revenueData.map(item => item.value));

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ doanh thu */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Doanh thu theo tháng</h2>
          <div className="h-60 flex items-end space-x-2">
            {revenueData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all cursor-pointer relative group"
                  style={{ height: `${(data.value / maxValue) * 100}%` }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    {data.value} triệu
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{data.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Biểu đồ phân bố sản phẩm */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Phân bố sản phẩm theo danh mục</h2>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">{category.category}</span>
                  <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Đơn hàng gần đây */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
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
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
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
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
            Xem tất cả đơn hàng
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 