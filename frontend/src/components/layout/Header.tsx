import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/auth-hooks';
import { CartItem } from '../../types';
import logoImage from '../../assets/logo.jpg';
import SearchBar from '../common/SearchBar';
import { useCart } from '../../hooks/useCart';

const Header: React.FC = () => {
  const { items, toggleCart } = useCart();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const cartItemsCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and desktop menu */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-10 w-auto rounded-sm"
                src={logoImage}
                alt="FourJ Shop"
              />
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 hover:border-gray-300"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Products
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Categories
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Mobile menu button, search, and cart */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 mr-2"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => toggleCart()}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 mr-2 relative"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Icons on Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => toggleCart()}
              className="text-gray-700 hover:text-gray-900 relative"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            
            {/* Auth User Profile or Login Button */}
            {isLoading ? (
              <div className="h-6 w-6 rounded-full animate-pulse bg-gray-200"></div>
            ) : isAuthenticated ? (
              <div className="relative group">
                <Link to="/account">
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name || 'User'} 
                      className="h-8 w-8 rounded-full object-cover border-2 border-blue-500" 
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  )}
                </Link>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                  <Link 
                    to="/account" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Tài khoản
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar (toggleable) */}
        {isSearchVisible && (
          <div className="pt-2 pb-3 md:hidden">
            <SearchBar className="w-full" />
          </div>
        )}

        {/* Mobile Menu (toggleable) */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100">Home</Link>
              <Link to="/products" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100">Products</Link>
              <Link to="/categories" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100">Categories</Link>
              <Link to="/contact" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100">Contact</Link>
              
              <hr className="my-1 border-gray-200" />
              
              <div className="px-3 py-2">
                <button
                  onClick={() => toggleCart()}
                  className="flex items-center text-gray-700 hover:text-gray-900"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  <span>Giỏ hàng</span>
                  {cartItemsCount > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </div>
              
              {isAuthenticated ? (
                <>
                  <Link to="/account" className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100">
                    <UserIcon className="h-5 w-5 mr-2" />
                    <span>Tài khoản</span>
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 w-full text-left"
                  >
                    <span className="ml-7">Đăng xuất</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="mx-3 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Đăng nhập
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 