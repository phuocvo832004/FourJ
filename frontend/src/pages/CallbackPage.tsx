import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { exchangeCodeForToken } from '../auth/auth-service';
import { authApi } from '../api/authApi';

const CallbackPage: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const navigate = useNavigate();
  const searchParams = useSearchParams()[0];
  const code = searchParams.get('code');
  const [errorMessage, setError] = useState<string | null>(null);

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

  const handleCallback = useCallback(async () => {
    if (code) {
      try {
        console.log("Received Auth0 code, attempting token exchange");
        const token = await exchangeCodeForToken(code);
        
        if (token) {
          console.log("Token exchange successful, fetching user data");
          try {
            // Gọi API lấy thông tin người dùng
            const userResponse = await authApi.getAuthMe();
            console.log("User data:", userResponse.data);
            
            // Chuyển hướng người dùng
            const redirectUrl = localStorage.getItem('redirect_after_login') || '/';
            localStorage.removeItem('redirect_after_login');
            navigate(redirectUrl, { replace: true });
          } catch (userError) {
            console.error("Error fetching user data:", userError);
            setError('Không thể lấy thông tin người dùng. Vui lòng thử lại.');
          }
        } else {
          setError('Không thể lấy token từ mã xác thực.');
        }
      } catch (err) {
        console.error('Error in callback processing:', err);
        setError('Đã xảy ra lỗi khi xử lý đăng nhập. Vui lòng thử lại.');
      }
    } else {
      const errorMessage = searchParams.get('error_description');
      setError(errorMessage || 'Đã xảy ra lỗi khi đăng nhập với Auth0');
    }
  }, [code, searchParams, navigate, setError]);

  useEffect(() => {
    if (code) {
      handleCallback();
    }
  }, [code, handleCallback]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        {errorMessage ? (
          <div className="text-red-500">
            <h2 className="text-xl font-semibold mb-2">Lỗi đăng nhập</h2>
            <p>{errorMessage}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => navigate('/login')}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">Đang xử lý đăng nhập...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default CallbackPage; 