import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-hooks';
import ErrorNotification from '../components/ErrorNotification';
import apiClient from '../api/apiClient';
import { formatDateTime } from '../utils/formatters';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderResponse {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
}

const OrderHistoryPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, getToken } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    // Kiểm tra xem cache đã bị xóa hay chưa
    const cacheWasCleared = !sessionStorage.getItem('order_history_cache');
    
    // Nếu đã khởi tạo và cache chưa bị xóa thì không cần fetch lại
    if (isInitialized && !cacheWasCleared) return;
    
    setIsLoadingOrders(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Không có token xác thực');
      }
      
      const response = await apiClient.get(`/orders/my-orders`, {
        params: {
          page: currentPage - 1,
          size: 10
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const ordersData = response.data.content || [];
      setOrders(ordersData);
      setTotalPages(response.data.totalPages || 1);
      setIsInitialized(true);
      
      // Đánh dấu cache đã được làm mới
      sessionStorage.setItem('order_history_cache', 'true');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [isAuthenticated, user, currentPage, getToken, isInitialized]);

  const handleChangePage = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      setIsInitialized(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (!sessionStorage.getItem('order_history_cache')) {
        setIsInitialized(false);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleReorder = async (orderId: string) => {
    try {
      setIsLoadingOrders(true);
      const token = await getToken();
      
      await apiClient.post(`/orders/${orderId}/reorder`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      navigate('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      setError('Không thể tạo lại đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleRetry = () => {
    setIsInitialized(false);
    setError(null);
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
        <ErrorNotification message={error} onClose={() => setError(null)} />
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

  if (isInitialized && orders.length === 0) {
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
      case 'SHIPPING':
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
      case 'SHIPPING':
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
          onClick={() => {
            sessionStorage.removeItem('order_history_cache');
            setIsInitialized(false);
            setIsLoadingOrders(true);
            fetchOrders();
          }}
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
              
              <hr className="my-4" />
              
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row">
                    <div className="sm:w-20 sm:h-20 flex-shrink-0 mb-2 sm:mb-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow sm:ml-4">
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <p className="text-gray-500">
                        {item.quantity} x {item.price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <div className="sm:ml-4 mt-2 sm:mt-0">
                      <Link 
                        to={`/products/${item.productId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Xem sản phẩm
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <hr className="my-4" />
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Tổng cộng:</span>
                <span className="text-xl font-semibold">{(order.total || 0).toLocaleString('vi-VN')}₫</span>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3 justify-between">
                <Link 
                  to={`/order/${order.id}`}
                  className="inline-block bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Xem chi tiết
                </Link>
                
                {order.status === 'DELIVERED' && (
                  <button 
                    onClick={() => handleReorder(order.id)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Mua lại
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex space-x-2" aria-label="Pagination">
            <button
              onClick={() => handleChangePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              Trước
            </button>
            
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handleChangePage(index + 1)}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handleChangePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:pointer-events-none"
            >
              Sau
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;