import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import ErrorNotification from '../components/ErrorNotification';
import { CartItem } from '../types/index';

const CartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, total, fetchCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [stockWarnings, setStockWarnings] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadCart = async () => {
      // Kiểm tra thời gian gọi API gần nhất
      const lastFetchTime = localStorage.getItem('cartPageLastFetchTime');
      const currentTime = Date.now();
      
      // Nếu đã gọi trong 30 giây qua, không gọi lại
      if (lastFetchTime && (currentTime - parseInt(lastFetchTime)) < 30000) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        await fetchCart();
        // Lưu thời gian gọi API
        localStorage.setItem('cartPageLastFetchTime', currentTime.toString());
      } catch (error) {
        console.error('Failed to load cart:', error);
        setErrorMessage('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [fetchCart]);

  const handleQuantityUpdate = async (id: string, quantity: number) => {
    try {
      const result = await updateQuantity(id, quantity);
      // Kiểm tra và cập nhật cảnh báo tồn kho nếu có
      if (result?.stockWarnings) {
        setStockWarnings(result.stockWarnings);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setErrorMessage('Không thể cập nhật số lượng. Vui lòng thử lại sau.');
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await removeItem(cartItemId);
      // Xóa cảnh báo tồn kho cho sản phẩm đã xóa
      if (stockWarnings[cartItemId]) {
        const newWarnings = { ...stockWarnings };
        delete newWarnings[cartItemId];
        setStockWarnings(newWarnings);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      setErrorMessage('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setStockWarnings({});
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setErrorMessage('Không thể xóa giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  const renderStockWarning = (item: CartItem) => {
    const cartItemId = item.id; // Sử dụng id chính là id của cart_item trong database
    if (stockWarnings[cartItemId]) {
      return (
        <p className="text-red-500 text-sm mt-1">
          Chỉ còn {stockWarnings[cartItemId]} sản phẩm trong kho
        </p>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6">Giỏ hàng của bạn</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link to="/products" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorNotification 
        message={errorMessage} 
        onClose={() => setErrorMessage('')} 
      />
      
      <h1 className="text-3xl font-semibold mb-6">Giỏ hàng của bạn</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-4 px-6 text-left">Sản phẩm</th>
                <th className="py-4 px-6 text-center">Giá</th>
                <th className="py-4 px-6 text-center">Số lượng</th>
                <th className="py-4 px-6 text-center">Tổng</th>
                <th className="py-4 px-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                        {renderStockWarning(item)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">{item.price.toLocaleString('vi-VN')}₫</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleQuantityUpdate(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        disabled={isLoading}
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        disabled={isLoading || Boolean(stockWarnings[item.id] && item.quantity >= stockWarnings[item.id])}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-medium">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isLoading}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="md:w-1/2">
          <button
            onClick={handleClearCart}
            className="px-6 py-3 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Xóa giỏ hàng
          </button>
        </div>
        <div className="md:w-1/2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Tổng giỏ hàng</h3>
          <div className="flex justify-between border-b pb-4 mb-4">
            <span>Tạm tính</span>
            <span className="font-medium">{total.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="flex justify-between font-semibold text-lg mb-6">
            <span>Tổng cộng</span>
            <span>{total.toLocaleString('vi-VN')}₫</span>
          </div>
          <Link
            to="/checkout"
            className="block w-full bg-primary-600 text-white text-center px-6 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:bg-gray-400"
          >
            Tiến hành thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 