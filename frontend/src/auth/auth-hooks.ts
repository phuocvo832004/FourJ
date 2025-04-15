import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

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
  
  // Hàm kiểm tra role của người dùng, đọc trực tiếp từ user object
  const hasRole = useCallback((roleName: string): boolean => {
    // Nếu user chưa load xong hoặc chưa đăng nhập, không có role
    if (isLoading || !user) {
      // console.log("hasRole: isLoading or no user");
      return false;
    }

    // Lấy roles trực tiếp từ user object
    const roles = user["https://myapp.example.com/roles"];

    // Kiểm tra xem roles có phải là mảng và có chứa role cần tìm không
    const result = Array.isArray(roles) && roles.includes(roleName);

    // console.log("hasRole check:", {
    //   roleName,
    //   userRoles: roles,
    //   result
    // });

    return result;
  }, [user, isLoading]); // Phụ thuộc vào user và isLoading để re-render khi chúng thay đổi

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