import { useAuth0 } from "@auth0/auth0-react";

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
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };
  
  // Hàm kiểm tra role của người dùng
  const hasRole = (roleName: string): boolean => {
    if (!user || !user['https://dev-vihsigx84vhnlzvg.us.auth0.com/roles']) {
      return false;
    }
    const roles = user['https://dev-vihsigx84vhnlzvg.us.auth0.com/roles'] as string[];
    return roles.includes(roleName);
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