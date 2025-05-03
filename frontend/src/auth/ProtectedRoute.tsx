import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth-hooks';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Nếu đang loading, hiển thị spinner hoặc skeleton
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

  // Nếu đã xác thực, hiển thị nội dung
  return <Outlet />;
}; 