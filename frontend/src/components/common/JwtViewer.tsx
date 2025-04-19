// Tạo file mới: src/components/common/JwtViewer.tsx

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const JwtViewer: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchToken();
    }
  }, [isAuthenticated, isLoading]);

  const fetchToken = async () => {
    try {
      const accessToken = await getAccessTokenSilently();
      setToken(accessToken);
      
      // Log token ở console
      console.log('%c===== JWT TOKEN FOR POSTMAN =====', 'background: #222; color: #bada55; font-size: 16px; font-weight: bold;');
      console.log('%cToken:', 'color: #bada55; font-weight: bold;');
      console.log(accessToken);
      console.log('%cAuthorization header:', 'color: #bada55; font-weight: bold;');
      console.log('%cBearer ' + accessToken, 'color: #bada55;');
      console.log('%c=================================', 'background: #222; color: #bada55; font-size: 16px; font-weight: bold;');
      
      // Lưu token vào localStorage để dễ truy cập
      localStorage.setItem('auth_token_for_test', accessToken);
    } catch (err) {
      console.error('Error fetching token:', err);
      setError('Không thể lấy token. Hãy thử đăng nhập lại.');
    }
  };

  const copyToClipboard = () => {
    if (!token) return;
    
    // Tạo text với format cho Postman
    const textToCopy = `Bearer ${token}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">JWT Token</h3>
          <div className="flex space-x-2">
            <button
              onClick={fetchToken}
              className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Refresh
            </button>
            <button
              onClick={copyToClipboard}
              className="px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              {copied ? 'Đã copy!' : 'Copy Authorization'}
            </button>
          </div>
        </div>
        
        {error ? (
          <div className="text-red-500 mt-2">{error}</div>
        ) : (
          <>
            <div className="mt-2">
              <p className="text-sm font-semibold">Authorization Header:</p>
              <div className="bg-gray-100 p-2 rounded-md mt-1 text-sm font-mono break-all">
                Bearer {token?.substring(0, 20)}...
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Token đã được lưu vào console và localStorage. Sử dụng F12 để xem đầy đủ.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default JwtViewer;