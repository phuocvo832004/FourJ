import React, { useState } from 'react';

// Interface cho đơn hàng
interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled';
  paymentMethod: string;
  items: number;
  totalAmount: number;
}

const AdminOrdersPage: React.FC = () => {
  // Mock data cho đơn hàng
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      customer: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      date: '10/04/2023',
      total: 1250000,
      status: 'delivered',
      paymentMethod: 'COD',
      items: 2,
      totalAmount: 1250000,
    },
    {
      id: 'ORD-002',
      customer: 'Trần Thị B',
      email: 'tranthib@example.com',
      date: '09/04/2023',
      total: 850000,
      status: 'shipping',
      paymentMethod: 'Thẻ tín dụng',
      items: 1,
      totalAmount: 850000,
    },
    {
      id: 'ORD-003',
      customer: 'Lê Văn C',
      email: 'levanc@example.com',
      date: '08/04/2023',
      total: 2150000,
      status: 'processing',
      paymentMethod: 'Chuyển khoản',
      items: 3,
      totalAmount: 2150000,
    },
    {
      id: 'ORD-004',
      customer: 'Phạm Thị D',
      email: 'phamthid@example.com',
      date: '07/04/2023',
      total: 1750000,
      status: 'cancelled',
      paymentMethod: 'Ví điện tử',
      items: 2,
      totalAmount: 1750000,
    },
    {
      id: 'ORD-005',
      customer: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      date: '06/04/2023',
      total: 3200000,
      status: 'delivered',
      paymentMethod: 'Thẻ tín dụng',
      items: 4,
      totalAmount: 3200000,
    },
    {
      id: 'ORD-006',
      customer: 'Vũ Thị F',
      email: 'vuthif@example.com',
      date: '05/04/2023',
      total: 920000,
      status: 'delivered',
      paymentMethod: 'COD',
      items: 1,
      totalAmount: 920000,
    },
    {
      id: 'ORD-007',
      customer: 'Đặng Văn G',
      email: 'dangvang@example.com',
      date: '04/04/2023',
      total: 1570000,
      status: 'pending',
      paymentMethod: 'Chuyển khoản',
      items: 2,
      totalAmount: 1570000,
    },
    {
      id: 'ORD-008',
      customer: 'Ngô Thị H',
      email: 'ngothih@example.com',
      date: '03/04/2023',
      total: 2780000,
      status: 'shipping',
      paymentMethod: 'Thẻ tín dụng',
      items: 3,
      totalAmount: 2780000,
    },
  ]);

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  // State cho đơn hàng đang xem chi tiết
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // State cho modal chi tiết đơn hàng
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Lọc đơn hàng
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(filters.search.toLowerCase()) || 
                         order.customer.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === '' || order.status === filters.status;
    
    // Logic để lọc theo khoảng thời gian có thể được bổ sung ở đây
    
    return matchesSearch && matchesStatus;
  });

  // Xử lý xem chi tiết đơn hàng
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Xử lý cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = (id: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => {
      if (order.id === id) {
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };

  // Hiển thị trạng thái đơn hàng
  const renderStatus = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ xác nhận</span>;
      case 'processing':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Đang xử lý</span>;
      case 'shipping':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Đang giao</span>;
      case 'delivered':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã giao</span>;
      case 'cancelled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return null;
    }
  };

  // Định dạng giá tiền
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý đơn hàng</h1>
        <div className="mt-4 md:mt-0">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              name="search"
              id="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Mã đơn hàng hoặc tên khách hàng"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipping">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              name="dateFrom"
              id="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              name="dateTo"
              id="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatus(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewOrderDetails(order)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Chi tiết
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="processing">Đang xử lý</option>
                      <option value="shipping">Đang giao</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Phân trang */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{filteredOrders.length}</span> của <span className="font-medium">{filteredOrders.length}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-current="page"
                  className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  1
                </a>
                <a
                  href="#"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {isModalOpen && selectedOrder && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Chi tiết đơn hàng #{selectedOrder.id}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Khách hàng</p>
                        <p className="text-sm text-gray-900">{selectedOrder.customer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{selectedOrder.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Ngày đặt</p>
                        <p className="text-sm text-gray-900">{selectedOrder.date}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phương thức thanh toán</p>
                        <p className="text-sm text-gray-900">{selectedOrder.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                        <div className="mt-1">{renderStatus(selectedOrder.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Số sản phẩm</p>
                        <p className="text-sm text-gray-900">{selectedOrder.items}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-500">Tổng tiền</p>
                        <p className="text-base font-semibold text-gray-900">{formatPrice(selectedOrder.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => window.print()}
                >
                  In đơn hàng
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage; 