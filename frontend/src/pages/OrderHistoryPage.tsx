import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Order } from '../types';

// Mock data - trong thực tế sẽ lấy từ API
const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        name: 'Điện thoại Samsung Galaxy S21',
        price: 20990000,
        quantity: 1,
        image: 'https://via.placeholder.com/150'
      }
    ],
    total: 20990000,
    status: 'delivered',
    createdAt: '2023-04-01T10:30:00Z',
    shippingAddress: 'Nguyễn Văn A, 123 Đường Lê Lợi, TP. Hồ Chí Minh, 70000, Việt Nam, SĐT: 0901234567',
    paymentMethod: 'credit_card'
  },
  {
    id: 'order-2',
    userId: 'user-1',
    items: [
      {
        id: 'item-2',
        productId: 'product-2',
        name: 'Laptop Dell XPS 13',
        price: 35990000,
        quantity: 1,
        image: 'https://via.placeholder.com/150'
      },
      {
        id: 'item-3',
        productId: 'product-3',
        name: 'Chuột không dây Logitech',
        price: 790000,
        quantity: 2,
        image: 'https://via.placeholder.com/150'
      }
    ],
    total: 37570000,
    status: 'shipping',
    createdAt: '2023-04-15T14:20:00Z',
    shippingAddress: 'Nguyễn Văn A, 123 Đường Lê Lợi, TP. Hồ Chí Minh, 70000, Việt Nam, SĐT: 0901234567',
    paymentMethod: 'paypal'
  }
];

const OrderHistoryPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    // Trong thực tế, đây sẽ là API call để lấy lịch sử đơn hàng
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        // const response = await fetch('/api/orders');
        // const data = await response.json();
        // setOrders(data);
        
        // Sử dụng mock data
        setTimeout(() => {
          setOrders(mockOrders);
          setIsLoadingOrders(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setIsLoadingOrders(false);
      }
    };

    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  if (isLoading || isLoadingOrders) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Vui lòng đăng nhập để xem lịch sử đơn hàng</p>
          <Link to="/" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Lịch sử đơn hàng</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Bạn chưa có đơn hàng nào</p>
          <Link to="/products" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipping':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Lịch sử đơn hàng</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div>
                  <p className="text-gray-500">Mã đơn hàng: <span className="font-medium text-gray-900">{order.id}</span></p>
                  <p className="text-gray-500">Ngày đặt: <span className="font-medium text-gray-900">{formatDate(order.createdAt)}</span></p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status === 'pending' && 'Chờ xác nhận'}
                    {order.status === 'processing' && 'Đang xử lý'}
                    {order.status === 'shipping' && 'Đang giao hàng'}
                    {order.status === 'delivered' && 'Đã giao hàng'}
                    {order.status === 'cancelled' && 'Đã hủy'}
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
                  </div>
                ))}
              </div>
              
              <hr className="my-4" />
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Tổng cộng:</span>
                <span className="text-xl font-semibold">{order.total.toLocaleString('vi-VN')}₫</span>
              </div>
              
              <div className="mt-6 flex justify-between">
                <Link 
                  to={`/order/${order.id}`}
                  className="inline-block bg-white border border-primary-600 text-primary-600 px-6 py-2 rounded-md hover:bg-primary-50 transition-colors"
                >
                  Xem chi tiết
                </Link>
                
                {order.status === 'delivered' && (
                  <button className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors">
                    Mua lại
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage; 