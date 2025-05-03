import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth-hooks';

interface RoleBasedRouteProps {
  requiredRole: string;
  redirectTo?: string;
}

const BYPASS_ROLE_CHECK = false; 

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  requiredRole,
  redirectTo = "/unauthorized"
}) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();

  // Ghi log thông tin debug
  useEffect(() => {
    if (!isLoading && isAuthenticated) {

      
      if (BYPASS_ROLE_CHECK) {
        console.warn("⚠️ BYPASSING ROLE CHECK FOR DEVELOPMENT - REMOVE IN PRODUCTION ⚠️");
      }
    }
  }, [isLoading, isAuthenticated, requiredRole, hasRole, user]);

  // Nếu đang loading, hiển thị spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nếu chưa xác thực, chuyển hướng về trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu không có role cần thiết, chuyển hướng đến trang không có quyền
  const hasRequiredRole = hasRole(requiredRole);
  if (!hasRequiredRole && !BYPASS_ROLE_CHECK) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu đã xác thực và có đủ quyền (hoặc bypass được bật), hiển thị nội dung
  
  return <Outlet />;
}; 