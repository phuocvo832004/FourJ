import { useAuth0 } from "@auth0/auth0-react";
import { auth0Config } from "./auth0-config";
import { useEffect, useCallback } from "react";

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
  
  // Hàm kiểm tra role của người dùng (định nghĩa trước)
  const hasRole = useCallback((roleName: string): boolean => {
    if (!user) return false;
    
    // Lấy roles từ user object sử dụng namespace từ cấu hình
    const roles = user[auth0Config.rolesNamespace] as string[] || [];
    console.log(`Checking role ${roleName}:`, roles);

    // Kiểm tra xem có role cần thiết không
    return roles.includes(roleName);
  }, [user]);
  
  useEffect(() => {
    if (user) {
      console.log("=== AUTH DEBUG ===");
      console.log("User object:", user);
      console.log(`Roles (${auth0Config.rolesNamespace}):`, user[auth0Config.rolesNamespace]);
      
      // Kiểm tra một số roles cụ thể
      const hasAdminRole = hasRole("admin");
      console.log("Has admin role:", hasAdminRole);
      console.log("=== END AUTH DEBUG ===");
    }
  }, [user, hasRole]);

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
      console.log("Access token obtained: " + token);
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
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