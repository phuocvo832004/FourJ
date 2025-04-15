import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/auth-hooks';
import ErrorNotification from '../components/ErrorNotification';

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

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated || !user || isInitialized) return;
    
    setIsLoadingOrders(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Không có token xác thực');
      }
      
      const response = await fetch(`/api/orders/my-orders?page=${currentPage}&size=5`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error('Không thể tải lịch sử đơn hàng');
      }
      
      const data = await response.json();
      setOrders(data.content || []);
      setTotalPages(data.totalPages || 1);
      setIsInitialized(true);
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
      setIsInitialized(false); // Đánh dấu để fetch lại khi trang thay đổi
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleBuyAgain = async (orderId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/orders/${orderId}/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể tạo đơn hàng mới');
      }
      
      // Chuyển hướng đến trang giỏ hàng sau khi thêm thành công
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error reordering:', error);
      setError('Không thể tạo lại đơn hàng. Vui lòng thử lại sau.');
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Lịch sử đơn hàng</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div>
                  <p className="text-gray-500">Mã đơn hàng: <span className="font-medium text-gray-900">#{order.orderNumber}</span></p>
                  <p className="text-gray-500">Ngày đặt: <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span></p>
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
                <span className="text-xl font-semibold">{order.total.toLocaleString('vi-VN')}₫</span>
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3 justify-between">
                <Link 
                  to={`/orders/${order.id}`}
                  className="inline-block bg-white border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Xem chi tiết
                </Link>
                
                {order.status === 'DELIVERED' && (
                  <button 
                    onClick={() => handleBuyAgain(order.id)}
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
      
      {/* Pagination */}
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
                key={index}
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