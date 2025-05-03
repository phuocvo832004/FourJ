import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

interface ErrorWithResponse extends Error {
  response?: {
    status?: number;
  };
}

const PaymentResultPage: React.FC = () => {
  const [status, setStatus] = useState<'success' | 'failed' | 'loading' | 'error'>('loading');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const orderCode = params.get('orderCode');
        const status = params.get('status');
        const errorMessage = params.get('message');
        
        // Xử lý trạng thái từ URL nếu có
        if (status === 'success') {
          setStatus('success');
        } else if (status === 'cancelled' || status === 'failed') {
          setStatus('failed');
        } else if (status === 'error') {
          setStatus('error');
          setErrorMessage(errorMessage || 'Đã xảy ra lỗi không xác định');
          return;
        }
        
        if (!orderCode) {
          setStatus('error');
          setErrorMessage('Không tìm thấy thông tin đơn hàng');
          return;
        }
        
        try {
          // Kiểm tra token trong localStorage
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.warn('Không tìm thấy token trong localStorage');
            // Lưu URL hiện tại để chuyển hướng sau khi đăng nhập
            localStorage.setItem('redirect_after_login', window.location.href);
            // Chuyển hướng đến trang đăng nhập
            setStatus('error');
            setErrorMessage('Vui lòng đăng nhập để xem chi tiết đơn hàng');
            navigate('/login');
            return;
          }
          
          // Sử dụng orderApi thay vì gọi trực tiếp apiClient
          const response = await apiClient.get(`/orders/number/${orderCode}`);
          
          const orderData = response.data;
          
          setOrderNumber(orderData.orderNumber || orderCode);
          setOrderId(orderData.id || '');
          setAmount(orderData.totalAmount || 0);
          
          // Kiểm tra trạng thái thanh toán từ orderData nếu chưa có từ URL
          if (!status) {
            const paymentStatus = orderData.paymentInfo?.status;
            
            if (paymentStatus === 'PAID' || paymentStatus === 'COMPLETED' || paymentStatus === 'SUCCESS') {
              setStatus('success');
            } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED' || paymentStatus === 'EXPIRED') {
              setStatus('failed');
            } else {
              // PENDING, PROCESSING
              setStatus('loading');
              
              // Kiểm tra lại sau 5 giây
              setTimeout(() => checkPaymentStatus(), 5000);
            }
          }
        } catch (error: unknown) {
          console.error('Error fetching order details:', error);
          
          // Xử lý lỗi 401 (Unauthorized)
          const apiError = error as ErrorWithResponse;
          if (apiError.response?.status === 401) {
            console.warn('Token hết hạn hoặc không hợp lệ');
            localStorage.setItem('redirect_after_login', window.location.href);
            navigate('/login');
            return;
          }
          
          if (status !== 'success' && status !== 'cancelled' && status !== 'failed') {
            setStatus('error');
            setErrorMessage('Không thể lấy thông tin đơn hàng');
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
        setErrorMessage('Đã xảy ra lỗi khi kiểm tra trạng thái thanh toán');
      }
    };
    
    checkPaymentStatus();
  }, [location.search, navigate]);
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold mb-2">Đang xử lý thanh toán...</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-4">Đơn hàng #{orderNumber} với số tiền {amount.toLocaleString('vi-VN')}₫ đã được thanh toán thành công.</p>
            <div className="flex justify-center gap-4">
              <Link to={`/order/${orderId}`} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Xem chi tiết đơn hàng
              </Link>
              <Link to="/" className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        );
        
      case 'failed':
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Thanh toán không thành công</h2>
            <p className="text-gray-600 mb-6">Đơn hàng #{orderNumber} chưa được thanh toán.</p>
            <div className="flex justify-center gap-4">
              <Link to={`/order/${orderId}`} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Xem chi tiết đơn hàng
              </Link>
              <button 
                onClick={() => navigate(-1)} 
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Quay lại
              </button>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-6">{errorMessage || 'Không thể xác định trạng thái thanh toán'}</p>
            <div className="flex justify-center gap-4">
              <Link to="/orders" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Đơn hàng của tôi
              </Link>
              <Link to="/" className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Trang chủ
              </Link>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentResultPage; 