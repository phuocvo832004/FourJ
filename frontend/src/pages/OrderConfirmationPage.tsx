import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useCart } from '../hooks/useCart';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated, isLoading } = useAuth0();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Xóa giỏ hàng sau khi đặt hàng thành công
    clearCart();
    
    // Nếu không có orderId hoặc người dùng không đăng nhập, chuyển hướng về trang chủ
    if ((!orderId && !isLoading) || (!isAuthenticated && !isLoading)) {
      navigate('/');
    }
  }, [orderId, isAuthenticated, isLoading, navigate, clearCart]);

  if (isLoading) {
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-semibold mb-4">Đặt hàng thành công!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-2">Mã đơn hàng: <span className="font-semibold">{orderId}</span></p>
            <p className="text-gray-700">
              Bạn có thể theo dõi trạng thái đơn hàng của mình trong mục "Lịch sử đơn hàng" trên tài khoản của bạn.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to={`/order/${orderId}`}
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
            >
              Xem chi tiết đơn hàng
            </Link>
            <Link
              to="/"
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 border-t">
          <div className="text-center">
            <h3 className="font-medium text-gray-900 mb-2">Cần hỗ trợ?</h3>
            <p className="text-gray-600 mb-4">
              Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
            </p>
            <a href="mailto:support@example.com" className="text-primary-600 hover:text-primary-700 font-medium">
              support@example.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 