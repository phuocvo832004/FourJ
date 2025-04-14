import { useAuth0 } from "@auth0/auth0-react";
import { auth0Config } from "./auth0-config";
import { useEffect, useCallback, useRef } from "react";

// Hook để kiểm tra xem người dùng đã xác thực hay chưa
export const useAuth = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    loginWithRedirect, 
    logout,
    user,
    getAccessTokenSilently 
  } = useAuth0();
  
  // Sử dụng useRef để lưu trữ roles, tránh tạo ra dependency cycle
  const userRolesRef = useRef<string[]>([]);
  
  // Cập nhật userRolesRef khi user thay đổi
  useEffect(() => {
    if (user) {
      userRolesRef.current = user[auth0Config.rolesNamespace] as string[] || [];
    } else {
      userRolesRef.current = [];
    }
  }, [user]);
  
  // Hàm kiểm tra role của người dùng không phụ thuộc vào user nữa
  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false;
    
    // Sử dụng roles từ ref thay vì tính toán lại từ user
    const roles = userRolesRef.current;
    // Tắt log cho production
    // console.log(`Checking role ${roleName}:`, roles);

    // Kiểm tra xem có role cần thiết không
    return roles.includes(roleName);
  }, [user]); // Chỉ phụ thuộc vào user để kiểm tra null
  
  // Debug logging chỉ phụ thuộc vào user, không phụ thuộc vào hasRole
  useEffect(() => {
    // Đã tắt debug logging
    // if (user && process.env.NODE_ENV === 'development') {
    //   console.log("=== AUTH DEBUG ===");
    //   console.log("User object:", user);
    //   console.log(`Roles (${auth0Config.rolesNamespace}):`, user[auth0Config.rolesNamespace]);
    //   
    //   // Kiểm tra một số roles cụ thể, nhưng không tạo dependency cycle
    //   const roles = user[auth0Config.rolesNamespace] as string[] || [];
    //   const hasAdminRole = roles.includes("admin");
    //   console.log("Has admin role:", hasAdminRole);
    //   console.log("=== END AUTH DEBUG ===");
    // }
  }, [user]); // Chỉ phụ thuộc vào user

  // Hàm đăng nhập
  const login = () => {
    loginWithRedirect();
  };
  
  // Hàm đăng xuất
  const logoutUser = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };
  
  // Hàm lấy token
  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      return token;
    } catch (err) {
      console.error("Error getting token:", err);
      
      // Kiểm tra lỗi Missing Refresh Token
      const error = err as Error;
      if (error.message && error.message.includes('Missing Refresh Token')) {
        console.log('Refresh token không có sẵn, đang xóa cache...');
        // Xóa cache Auth0
        localStorage.removeItem('auth0.is.authenticated');
        
        // Reload trang sau 1 giây để người dùng đăng nhập lại
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      
      return null;
    }
  };
  
  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout: logoutUser,
    getToken,
    hasRole
  };
}; 