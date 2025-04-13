import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-hooks';
import { useCart } from '../hooks/useCart';
import ErrorNotification from '../components/ErrorNotification';

// Danh sách phương thức thanh toán phù hợp với backend
const PAYMENT_METHODS = [
  { id: 'CREDIT_CARD', label: 'Thẻ tín dụng' },
  { id: 'PAYPAL', label: 'PayPal' },
  { id: 'COD', label: 'Thanh toán khi nhận hàng' },
  { id: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' }
];

const CheckoutPage: React.FC = () => {
  const { items, total: cartTotal, fetchCart } = useCart();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    fullAddress: '',
  });
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Phí vận chuyển và tổng cộng
  const shippingFee = cartTotal > 0 ? 30000 : 0; // 30,000đ
  const grandTotal = cartTotal + shippingFee;

  useEffect(() => {
    const initCheckout = async () => {
      try {
        // Lấy giỏ hàng mới nhất
        await fetchCart();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing checkout:', error);
        setErrorMessage('Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.');
      }
    };

    initCheckout();
  }, [fetchCart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!items.length) {
      setErrorMessage('Giỏ hàng của bạn đang trống. Không thể tạo đơn hàng.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const token = await getToken();
      
      if (!token) {
        setErrorMessage('Bạn cần đăng nhập để tiếp tục thanh toán.');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress: shippingAddress.fullAddress,
          paymentMethod: paymentMethod,
          notes: notes
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đã xảy ra lỗi khi tạo đơn hàng');
      }
      
      const orderData = await response.json();
      navigate(`/order-confirmation/${orderData.orderNumber}`);
    } catch (error: unknown) {
      // Xử lý các loại lỗi từ backend
      const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
      
      if (errorMessage.includes('Không tìm thấy sản phẩm')) {
        setErrorMessage('Một số sản phẩm không còn tồn tại. Vui lòng cập nhật giỏ hàng.');
      } else if (errorMessage.includes('Giá sản phẩm')) {
        setErrorMessage('Giá sản phẩm đã thay đổi. Vui lòng làm mới giỏ hàng.');
      } else if (errorMessage.includes('không đủ số lượng')) {
        setErrorMessage('Một số sản phẩm không đủ số lượng trong kho.');
      } else {
        setErrorMessage('Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ErrorNotification 
        message={errorMessage} 
        onClose={() => setErrorMessage('')} 
      />
      
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Shipping and Payment Information */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700 mb-2">
                  Họ tên
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="fullAddress" className="block text-gray-700 mb-2">
                  Địa chỉ đầy đủ
                </label>
                <textarea
                  id="fullAddress"
                  name="fullAddress"
                  value={shippingAddress.fullAddress}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Vui lòng nhập địa chỉ đầy đủ bao gồm số nhà, đường phố, phường/xã, quận/huyện, thành phố, quốc gia"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="notes" className="block text-gray-700 mb-2">
                  Ghi chú đơn hàng (tùy chọn)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={handleNotesChange}
                  rows={3}
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
              <div className="mb-6 space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <label key={method.id} className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={handlePaymentMethodChange}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-blue-300"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
            <div className="border-b pb-4 mb-4">
              {items.length === 0 ? (
                <p className="text-gray-500">Giỏ hàng trống</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {item.name} x {item.quantity}
                        </p>
                        <p className="text-gray-600 text-sm">{item.category}</p>
                      </div>
                      <p className="font-medium">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Tổng phụ</p>
                <p className="font-medium">{cartTotal.toLocaleString('vi-VN')}₫</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Phí vận chuyển</p>
                <p className="font-medium">{shippingFee.toLocaleString('vi-VN')}₫</p>
              </div>
            </div>
            <div className="flex justify-between border-t pt-4">
              <p className="font-semibold">Tổng cộng</p>
              <p className="font-semibold text-xl">{grandTotal.toLocaleString('vi-VN')}₫</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 