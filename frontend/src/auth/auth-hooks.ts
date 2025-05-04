import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { auth0Config } from './auth0-config';
import authApi from '../api/authApi';
import { UserProfileDto } from "../models/UserProfileDto";

// Kiểu cho lỗi Auth0 mong đợi
interface AuthError {
  error: string;
  error_description?: string; // Thêm các trường khác nếu cần
}

// Kiểu dữ liệu cho user state, kết hợp Auth0 và Backend
// Thêm trường permissions (hoặc roles) từ UserProfileDto
type AppUser = UserProfileDto & {
  // Thêm các thuộc tính từ Auth0 nếu cần, ví dụ:
  // sub?: string;
  // nickname?: string;
  // picture?: string;
  // email_verified?: boolean;
};

// Hook để kiểm tra xem người dùng đã xác thực hay chưa
export const useAuth = () => {
  const {
    isAuthenticated: auth0IsAuthenticated, // Đổi tên để tránh xung đột
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: auth0Logout, // Đổi tên
    // user: auth0User, // Không dùng trực tiếp nữa
    getAccessTokenSilently
  } = useAuth0();
  
  const [isAuthenticated, setIsAuthenticated] = useState(auth0IsAuthenticated);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu là true
  const [user, setUser] = useState<AppUser | null>(null); // State lưu thông tin user từ backend
  const [accessToken, setAccessToken] = useState<string | null>(null); // Lưu access token nếu cần
  
  // Hàm fetch thông tin user từ backend
  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
        // Gọi API backend để lấy thông tin user
        // Đảm bảo API client của bạn tự động đính kèm token
        // Đường dẫn phải chính xác: /api/users/profile/me
        const response = await authApi.getAuthMe(); // Giả sử authApi.getAuthMe() gọi GET /api/users/profile/me
        setUser(response.data as UserProfileDto); // Lưu thông tin user từ backend (bao gồm permissions)
        setIsAuthenticated(true);
    } catch (error) {
        console.error("Error fetching user data from backend:", error);
        setUser(null);
        setIsAuthenticated(false);
        // Có thể cần xử lý lỗi cụ thể, ví dụ: nếu lỗi 401 thì logout?
    } finally {
        setIsLoading(false);
    }
  }, []); // Không cần dependencies nếu authApi tự lấy token

  // Lấy token và fetch user khi trạng thái Auth0 thay đổi
  useEffect(() => {
    const initAuth = async () => {
      if (auth0IsAuthenticated) {
        setIsLoading(true);
        try {
          // Lấy access token trước
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: auth0Config.audience,
              scope: auth0Config.scope,
            },
            cacheMode: "off" // Quan trọng để tránh lỗi stale token/CORS
          });
          setAccessToken(token); // Lưu token nếu cần cho các việc khác

          // Sau khi có token, gọi fetchUser
          // Token sẽ được interceptor của authApi tự động đính kèm
          await fetchUser();

        } catch (error) {
          console.error("Error during auth init (getting token or fetching user):", error);
          // Nếu lỗi là login_required, có thể không cần làm gì vì user chưa đăng nhập
          // Sử dụng type guard để kiểm tra cấu trúc lỗi
          const isAuthError = (e: unknown): e is AuthError => 
            typeof e === 'object' && e !== null && 'error' in e;

          if (isAuthError(error) && error.error !== 'login_required') {
             // Xử lý các lỗi khác nếu cần, ví dụ logout
             setIsAuthenticated(false);
             setUser(null);
             setAccessToken(null);
             setIsLoading(false);
          } else if (!isAuthError(error) || error.error !== 'login_required') { // Kiểm tra ngược lại
             setIsLoading(false); // Chỉ set loading false nếu không phải lỗi login_required
          }
          // Nếu là login_required, auth0Loading sẽ tự xử lý
        }
      } else {
         // Nếu không xác thực bởi Auth0
         setIsAuthenticated(false);
         setUser(null);
         setAccessToken(null);
         setIsLoading(auth0Loading); // Đồng bộ trạng thái loading với Auth0
      }
    };
    initAuth();
  }, [auth0IsAuthenticated, auth0Loading, getAccessTokenSilently, fetchUser]);

  // Hàm kiểm tra role/permission, đọc từ user state (đã lấy từ backend)
  const hasRole = useCallback((roleOrPermission: string): boolean => {
    if (isLoading || !user || !user.permissions) {
      return false;
    }
    // Kiểm tra trong danh sách permissions lấy từ API /me
    return user.permissions.includes(roleOrPermission);
  }, [user, isLoading]);

  // Hàm getToken (giữ lại nếu cần gọi thủ công ở đâu đó)
  const getToken = useCallback(async (): Promise<string | null> => {
    if (accessToken) return accessToken; // Trả về token đã lưu nếu có

    // Nếu chưa có, thử lấy lại (có thể không cần thiết nếu useEffect xử lý tốt)
    try {
       const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: auth0Config.audience,
              scope: auth0Config.scope,
            },
            cacheMode: "off"
       });
       setAccessToken(token);
       return token;
    } catch (err) {
        console.error("Error getting access token manually:", err);
         if (err && typeof err === 'object' && 'error' in err) {
           const authError = err as { error: string };
           if (authError.error === 'login_required' || authError.error === 'consent_required') {
             // Có thể không cần login ở đây vì useEffect sẽ xử lý?
             // loginWithRedirect({...});
           }
         }
        return null;
    }
  }, [getAccessTokenSilently, accessToken]);

  // Hàm logout: Clear state và gọi logout của Auth0
  const logoutUser = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
    // Có thể cần clear thêm state trong store (Redux, Zustand,...)
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }, [auth0Logout]);

  return {
    isAuthenticated,
    isLoading,
    user, // Trả về user object đầy đủ từ backend
    login: loginWithRedirect,
    logout: logoutUser,
    getToken, // Trả về hàm getToken nếu cần
    hasRole,
    accessToken // Trả về token nếu cần
  };
}; 