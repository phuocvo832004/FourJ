import React from 'react';
import { Outlet } from 'react-router-dom';
import SellerHeader from './SellerHeader';

const SellerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SellerHeader />
      <main className="flex-grow py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Kênh Người Bán - Mọi quyền được bảo lưu
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Trợ giúp</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Điều khoản</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Chính sách</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SellerLayout; 