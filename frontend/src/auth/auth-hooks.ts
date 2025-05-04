import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { registerAuthCallback, clearToken } from './auth-service';
import { auth0Config } from './auth0-config';
import authApi from '../api/authApi';

// Interface bổ sung để đảm bảo typing chính xác
interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token?: string;
  scope?: string;
  token_type: string;
}

// Hook để kiểm tra xem người dùng đã xác thực hay chưa
export const useAuth = () => {
  const { 
    isAuthenticated, 
    isLoading: auth0Loading, 
    loginWithRedirect, 
    logout,
    user: auth0User,
    getAccessTokenSilently 
  } = useAuth0();
  
  const [isLoading, setIsLoading] = useState(auth0Loading);
  const [user, setUser] = useState(auth0User);
  
  // Khi auth0User thay đổi, gọi API backend để lấy thông tin user đầy đủ
  useEffect(() => {
    if (auth0User && isAuthenticated) {
      // Đặt loading để hiển thị trạng thái tải
      setIsLoading(true);
      
      // Lấy token từ Auth0
      getAccessTokenSilently({
        authorizationParams: {
          audience: auth0Config.audience,
          scope: auth0Config.scope,
        },
        cacheMode: "off"
      }).then(() => {
        // Gọi API backend để lấy thông tin user (token đã được thiết lập trong apiClient interceptor)
        authApi.getAuthMe()
          .then(response => {
            // Cập nhật user state với dữ liệu từ backend
            setUser({
              ...auth0User,
              ...response.data
            });
          })
          .catch(error => {
            console.error("Error fetching user data from backend:", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }).catch(error => {
        console.error("Error getting token:", error);
        setIsLoading(false);
      });
    } else {
      setIsLoading(auth0Loading);
    }
  }, [auth0User, isAuthenticated, auth0Loading, getAccessTokenSilently]);
  
  // Hàm kiểm tra role của người dùng, đọc trực tiếp từ user object
  const hasRole = useCallback((roleName: string): boolean => {
    // Nếu user chưa load xong hoặc chưa đăng nhập, không có role
    if (isLoading || !user) {
      // console.log("hasRole: isLoading or no user");
      return false;
    }

    // Lấy roles từ user object - cập nhật để phù hợp với Kong OIDC
    // Kong OIDC chuẩn hóa roles trong X-User-Permissions hoặc thông qua claims trong token
    const roles = user["https://myapp.example.com/roles"] || user.roles || [];

    // Kiểm tra xem roles có phải là mảng và có chứa role cần tìm không
    const result = Array.isArray(roles) && roles.includes(roleName);

    return result;
  }, [user, isLoading]); // Phụ thuộc vào user và isLoading để re-render khi chúng thay đổi

  
  // Hàm lấy token
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: auth0Config.audience,
          scope: auth0Config.scope,
        },
        cacheMode: "off", // Tắt cache để tránh lỗi CORS
        detailedResponse: true
      }) as TokenResponse | string;
      
      // Nếu token là một object (điều này xảy ra khi detailedResponse: true)
      if (typeof token === 'object' && token.access_token) {
        return token.access_token;
      }
      
      // Nếu token là string (trường hợp mặc định)
      return token as string;
    } catch (err: unknown) {
      console.error("Error getting access token:", err);
      
      // Kiểm tra nếu đây là lỗi cần đăng nhập lại
      if (err && typeof err === 'object' && 'error' in err) {
        const authError = err as { error: string };
        if (authError.error === 'login_required' || authError.error === 'consent_required') {
          // Chuyển hướng người dùng đến trang đăng nhập 
          loginWithRedirect({
            authorizationParams: {
              audience: auth0Config.audience,
              scope: auth0Config.scope,
              redirect_uri: auth0Config.redirectUri
            }
          });
        }
      }
      
      return null;
    }
  }, [getAccessTokenSilently, loginWithRedirect]);

  // Đăng ký callback với AuthService khi component được mount
  useEffect(() => {
    registerAuthCallback(getToken);
    
    // Cleanup khi component unmount, không cần thiết trong trường hợp này
    // vì AuthService là singleton, nhưng vẫn đảm bảo tính đúng đắn của code
    return () => {
      // Nếu cần, có thể thêm logic cleanup ở đây
    };
  }, [getToken]); // Thêm getToken vào mảng dependency

  // Hàm logout cải tiến để xóa token trong AuthService
  const logoutUser = useCallback(() => {
    // Xóa token trước khi logout
    clearToken();
    
    // Gọi logout từ Auth0
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      }
    });
  }, [logout]);
  
  return {
    isAuthenticated,
    isLoading,
    user,
    login: loginWithRedirect, // Sử dụng trực tiếp từ useAuth0
    logout: logoutUser, // Sử dụng hàm wrapper đã được cải tiến
    getToken, // Giữ lại hàm này để các component có thể gọi trực tiếp
    hasRole,
  };
}; 