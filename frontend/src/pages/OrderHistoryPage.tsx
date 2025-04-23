import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/auth-hooks';
import ErrorNotification from '../components/ErrorNotification';
import { formatDateTime } from '../utils/formatters';
import { useUserOrders } from '../hooks/useOrder';

const OrderHistoryPage: React.FC = () => {
  const { isAuthenticated, isLoading, getToken } = useAuth();
  const { orders, loading: isLoadingOrders, error, refetch } = useUserOrders();

  // Lấy token và lưu vào localStorage trước khi tải đơn hàng
  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated && !isLoading) {
        const token = await getToken();
        if (token) {
          console.log('Token đã được lưu vào localStorage, độ dài:', token.length);
        } else {
          console.warn('Không thể lấy token từ Auth0');
        }
      }
    };

    fetchToken();
  }, [isAuthenticated, isLoading, getToken]);

  const handleRetry = async () => {
    // Lấy lại token trước khi thử lại
    if (isAuthenticated) {
      await getToken();
    }
    refetch();
  };

  if (isLoading || (isLoadingOrders && !error)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Vui lòng đăng nhập để xem lịch sử đơn hàng</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Lịch sử đơn hàng</h1>
        <ErrorNotification message={error} onClose={() => {}} />
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Không thể tải lịch sử đơn hàng</p>
          <button 
            onClick={handleRetry} 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Lịch sử đơn hàng</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
          <Link to="/products" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPED':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  // Sử dụng formatDateTime từ utils
  const formatOrderDate = (dateString: string) => {
    return formatDateTime(dateString);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Lịch sử đơn hàng</h1>
        <button 
          onClick={refetch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Làm mới
        </button>
      </div>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div>
                  <p className="text-gray-500">Mã đơn hàng: <span className="font-medium text-gray-900">#{order.orderNumber}</span></p>
                  <p className="text-gray-500">Ngày đặt: <span className="font-medium text-gray-900">{formatOrderDate(order.createdAt)}</span></p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium mb-2">Sản phẩm</h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.price.toLocaleString()} VND</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <p className="text-gray-600">Tổng tiền: <span className="font-semibold text-gray-900">{order.totalAmount.toLocaleString()} VND</span></p>
                  <p className="text-gray-600">Phương thức thanh toán: <span className="font-medium">{order.paymentInfo.paymentMethod}</span></p>
                </div>
                <div className="mt-3 md:mt-0 flex space-x-2">
                  <Link 
                    to={`/order/${order.id}`} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Xem chi tiết
                  </Link>
                  {order.status === 'PENDING' && (
                    <Link
                      to={`/order/${order.id}`}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Hủy đơn hàng
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage;