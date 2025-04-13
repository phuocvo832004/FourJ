import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Order } from '../types';

// Mock data - tương tự trong OrderHistoryPage, trong thực tế sẽ lấy từ API
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

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading } = useAuth0();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  useEffect(() => {
    // Trong thực tế, đây sẽ là API call để lấy thông tin đơn hàng
    const fetchOrder = async () => {
      setIsLoadingOrder(true);
      try {
        // const response = await fetch(`/api/orders/${id}`);
        // const data = await response.json();
        // setOrder(data);
        
        // Sử dụng mock data
        setTimeout(() => {
          const foundOrder = mockOrders.find(order => order.id === id);
          setOrder(foundOrder || null);
          setIsLoadingOrder(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching order:', error);
        setIsLoadingOrder(false);
      }
    };

    if (isAuthenticated && id) {
      fetchOrder();
    }
  }, [isAuthenticated, id]);

  if (isLoading || isLoadingOrder) {
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
          <p className="text-xl text-gray-600 mb-4">Vui lòng đăng nhập để xem thông tin đơn hàng</p>
          <Link to="/" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy đơn hàng</p>
          <Link to="/orders" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
            Quay lại lịch sử đơn hàng
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

  const getPaymentMethodName = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'credit_card':
        return 'Thẻ tín dụng';
      case 'paypal':
        return 'PayPal';
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/orders" className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Quay lại lịch sử đơn hàng
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-2xl font-semibold">Chi tiết đơn hàng #{order.id}</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Thông tin đơn hàng</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><span className="font-medium">Mã đơn hàng:</span> {order.id}</p>
                <p><span className="font-medium">Ngày đặt:</span> {formatDate(order.createdAt)}</p>
                <p><span className="font-medium">Phương thức thanh toán:</span> {getPaymentMethodName(order.paymentMethod)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Thông tin giao hàng</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><span className="font-medium">Địa chỉ giao hàng:</span> {order.shippingAddress}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium mb-4">Sản phẩm đã đặt</h3>
          <div className="border rounded-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Sản phẩm</th>
                  <th className="py-3 px-4 text-center">Giá</th>
                  <th className="py-3 px-4 text-center">Số lượng</th>
                  <th className="py-3 px-4 text-right">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-md mr-4" 
                        />
                        <Link to={`/product/${item.productId}`} className="font-medium hover:text-primary-600">
                          {item.name}
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">{item.price.toLocaleString('vi-VN')}₫</td>
                    <td className="py-4 px-4 text-center">{item.quantity}</td>
                    <td className="py-4 px-4 text-right font-medium">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between py-2">
              <span>Tạm tính:</span>
              <span>{order.total.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Phí vận chuyển:</span>
              <span>0₫</span>
            </div>
            <div className="flex justify-between py-2 font-medium text-lg border-t mt-2 pt-2">
              <span>Tổng cộng:</span>
              <span>{order.total.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          {order.status === 'delivered' && (
            <div className="mt-8 flex justify-end">
              <button className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors">
                Mua lại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 