import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth-hooks';

interface RoleBasedRouteProps {
  requiredRole: string;
  redirectTo?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  requiredRole,
  redirectTo = "/unauthorized"
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

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
  if (!hasRole(requiredRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Nếu đã xác thực và có đủ quyền, hiển thị nội dung
  return <Outlet />;
}; 