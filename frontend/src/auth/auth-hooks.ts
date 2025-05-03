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
      
      // Lưu token vào localStorage để các request có thể sử dụng
      localStorage.setItem('auth_token', token);
      
      // Loại bỏ việc log token ra console mỗi lần gọi
      // console.log('JWT Token:', token);
      // console.log('%c----- TOKEN FOR POSTMAN -----', 'background: #222; color: #bada55; font-size: 16px');
      // console.log('%cBearer ' + token, 'background: #222; color: #bada55; font-size: 14px');
      // console.log('%c----------------------------', 'background: #222; color: #bada55; font-size: 16px');
      
      return token;
    } catch (err) {
      console.error("Error getting token:", err);
      
      // Không tự động reload trang khi gặp lỗi Missing Refresh Token
      // Thay vào đó, trả về null và để component xử lý
      const error = err as Error;
      if (error.message && error.message.includes('Missing Refresh Token')) {
        // Xóa tokens từ localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth0.is.authenticated');
        
        // Log thông báo lỗi
        console.error('Missing Refresh Token. Please log in again.');
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