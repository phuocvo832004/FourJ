import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { CartItem } from '../../types';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
}) => {
  // Tính tổng giá trị giỏ hàng từ các items được truyền vào props
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 rounded-l-3xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition duration-150"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-5">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 mt-4 text-lg">Giỏ hàng của bạn trống</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="overflow-auto max-h-96 px-4">
                      {items.map(item => (
                        <div key={item.cartItemId || item.id} className="py-4 flex items-center border-b border-gray-200">
                          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-center object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="text-sm font-medium text-red-600 hover:text-red-800"
                                disabled={!item.id}
                              >
                                Xóa
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm text-gray-500">
                                {formatCurrency(item.price)}₫
                              </p>
                              <div className="flex items-center border border-gray-200 rounded">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || !item.id}
                                  className="px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium border-l border-r">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-r"
                                  disabled={!item.id}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="mt-1 text-sm font-medium text-gray-900 text-right">
                              Tổng: {formatCurrency(item.price * item.quantity)}₫
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-4 border-t border-gray-200">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Tổng cộng</p>
                        <p>{formatCurrency(cartTotal)}₫</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Chưa bao gồm phí vận chuyển
                      </p>
                      <div className="mt-4 space-y-2">
                        <Link
                          to="/checkout"
                          className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                          onClick={onClose}
                        >
                          Thanh toán ({formatCurrency(cartTotal)}₫)
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart; 