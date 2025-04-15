import React from 'react';
import { Outlet } from 'react-router-dom';
import SellerHeader from './SellerHeader';

const SellerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader />
      <main className="py-6">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Kênh Người Bán - Mọi quyền được bảo lưu
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SellerLayout; 