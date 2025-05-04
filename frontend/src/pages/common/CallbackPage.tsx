import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken } from '../../auth/auth-service';
import authApi from '../../api/authApi';

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const code = searchParams.get('code');
    const handleCallback = async () => {
      if (code) {
        try {
          // Trao đổi code với token thông qua backend
          const token = await exchangeCodeForToken(code);
          
          if (token) {
            // Lấy thông tin người dùng từ backend
            await authApi.getAuthMe();
            
            // Chuyển hướng người dùng đến trang chính hoặc trang đã lưu trước đó
            const redirectUrl = localStorage.getItem('redirect_after_login') || '/';
            // Xóa URL đã lưu
            localStorage.removeItem('redirect_after_login');
            
            navigate(redirectUrl, { replace: true });
          } else {
            setError('Không thể lấy token từ mã xác thực.');
          }
        } catch (err) {
          console.error('Lỗi khi xử lý callback:', err);
          setError('Đã xảy ra lỗi khi xử lý đăng nhập. Vui lòng thử lại.');
        }
      } else {
        // Nếu không có code, có thể là lỗi từ Auth0
        const errorMessage = searchParams.get('error_description');
        setError(errorMessage || 'Đã xảy ra lỗi khi đăng nhập với Auth0');
      }
    };
    
    handleCallback();
  }, [navigate, searchParams]);
  
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md">
        {error ? (
          <div className="text-red-500">
            <h1 className="text-xl font-bold mb-4">Lỗi xác thực</h1>
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              onClick={() => navigate('/login')}
            >
              Quay lại đăng nhập
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-bold mb-4">Đang xử lý đăng nhập...</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallbackPage; 