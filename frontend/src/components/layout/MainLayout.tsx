import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../auth/auth-hooks';
import { useCart } from '../../hooks/useCart';
import Cart from '../common/Cart';
import { useAppDispatch } from '../../hooks';
import { updateQuantity, removeItem } from '../../store/cartSlice';
import SearchBar from '../common/SearchBar';

const MainLayout: React.FC = () => {
  const { isAuthenticated, user, login, logout, hasRole } = useAuth();
  const { items, toggleCart, isOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dispatch = useAppDispatch();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-blue-700">
              Four<span className="text-gray-800">J</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-blue-600">
                Trang chủ
              </Link>
              <Link to="/products" className="text-gray-600 hover:text-blue-600">
                Sản phẩm
              </Link>
              <Link to="/categories" className="text-gray-600 hover:text-blue-600">
                Danh mục
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600">
                Liên hệ
              </Link>
              {isAuthenticated && hasRole('admin') && (
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600">
                  Quản trị
                </Link>
              )}
              {isAuthenticated && hasRole('seller') && (
                <Link to="/seller/dashboard" className="text-gray-600 hover:text-blue-600">
                  Kênh người bán
                </Link>
              )}
            </nav>

            {/* Right buttons */}
            <div className="flex items-center space-x-4">
              {/* SearchBar thay thế search icon */}
              <div className="hidden md:block w-60">
                <SearchBar />
              </div>
              
              {/* Mobile search icon */}
              <Link to="/search" className="md:hidden p-2 text-gray-600 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Cart button */}
              <button
                onClick={toggleCart}
                className="p-2 text-gray-600 hover:text-blue-600 relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* User button/login */}
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={toggleAccountMenu}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                  >
                    <img
                      src={user?.picture || "https://via.placeholder.com/30"}
                      alt={user?.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ${accountMenuOpen ? 'block' : 'hidden'}`}>
                    <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Tài khoản
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Đơn hàng
                    </Link>
                    {isAuthenticated && hasRole('admin') && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Quản trị
                      </Link>
                    )}
                    {isAuthenticated && hasRole('seller') && (
                      <Link to="/seller/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Kênh người bán
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={login}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Đăng nhập
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 md:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t">
              <Link to="/" className="block py-2 text-gray-600 hover:text-blue-600">
                Trang chủ
              </Link>
              <Link to="/products" className="block py-2 text-gray-600 hover:text-blue-600">
                Sản phẩm
              </Link>
              <Link to="/categories" className="block py-2 text-gray-600 hover:text-blue-600">
                Danh mục
              </Link>
              <Link to="/contact" className="block py-2 text-gray-600 hover:text-blue-600">
                Liên hệ
              </Link>
              {isAuthenticated && hasRole('admin') && (
                <Link to="/admin/dashboard" className="block py-2 text-gray-600 hover:text-blue-600">
                  Quản trị
                </Link>
              )}
              {isAuthenticated && hasRole('seller') && (
                <Link to="/seller/dashboard" className="block py-2 text-gray-600 hover:text-blue-600">
                  Kênh người bán
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Shop<span className="text-blue-400">App</span></h3>
              <p className="text-gray-400">
                Cung cấp các sản phẩm chất lượng cao với giá cả phải chăng.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Liên kết</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Trang chủ</Link></li>
                <li><Link to="/products" className="text-gray-400 hover:text-white">Sản phẩm</Link></li>
                <li><Link to="/categories" className="text-gray-400 hover:text-white">Danh mục</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Hỗ trợ</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Vận chuyển</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Đổi trả</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Điều khoản</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Liên hệ</h4>
              <div className="text-gray-400">
                <p>123 Đường ABC, Quận XYZ</p>
                <p>Thành phố HCM, Việt Nam</p>
                <p>Email: info@shopapp.com</p>
                <p>Phone: +84 123 456 789</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ShopApp. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Component */}
      <Cart
        isOpen={isOpen}
        onClose={() => toggleCart()}
        items={items}
        onUpdateQuantity={(id, quantity) => dispatch(updateQuantity({ id, quantity }))}
        onRemoveItem={(id) => dispatch(removeItem(id))}
      />
    </div>
  );
};

export default MainLayout; 