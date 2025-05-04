import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const CallbackPage: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Nếu xác thực đã hoàn tất và không còn loading
    if (!isLoading) {
      if (isAuthenticated) {
        // Nếu đăng nhập thành công, chuyển hướng về trang chủ
        navigate('/');
      } else if (error) {
        // Nếu có lỗi, chuyển hướng về trang đăng nhập
        console.error('Lỗi xác thực:', error);
        navigate('/login');
      }
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Đang xử lý đăng nhập...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default CallbackPage; 