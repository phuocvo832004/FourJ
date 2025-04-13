import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Về chúng tôi</h3>
            <p className="text-gray-300">
              Chúng tôi cung cấp các sản phẩm chất lượng cao với giá cả phải chăng.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white">Trang chủ</Link></li>
              <li><Link to="/products" className="text-gray-300 hover:text-white">Sản phẩm</Link></li>
              <li><Link to="/categories" className="text-gray-300 hover:text-white">Danh mục</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">Giới thiệu</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: contact@example.com</li>
              <li>Điện thoại: (123) 456-7890</li>
              <li>Địa chỉ: 123 Đường ABC, Thành phố XYZ</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} E-Commerce. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 