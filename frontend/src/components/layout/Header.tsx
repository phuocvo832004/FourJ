import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { toggleCart, updateQuantity, removeItem } from '../../store/cartSlice';
import Cart from '../common/Cart';
import { RootState } from '../../store/store';
import { useAuth } from '../../auth/auth-hooks';
import { CartItem } from '../../types';
import logoImage from '../../assets/logo.jpg';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { items, isOpen } = useAppSelector((state: RootState) => state.cart);
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  const cartItemsCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img className="h-11 w-auto" src={logoImage} alt="Logo" />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
              <Link to="/products" className="text-gray-700 hover:text-gray-900">Products</Link>
              <Link to="/categories" className="text-gray-700 hover:text-gray-900">Categories</Link>
              <Link to="/contact" className="text-gray-700 hover:text-gray-900">Contact</Link>
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch(toggleCart())}
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
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
        </div>
      </header>

      {/* Cart Component */}
      <Cart
        isOpen={isOpen}
        onClose={() => dispatch(toggleCart())}
        items={items}
        onUpdateQuantity={(id, quantity) => dispatch(updateQuantity({ id, quantity }))}
        onRemoveItem={(id) => dispatch(removeItem(id))}
      />
    </>
  );
};

export default Header; 