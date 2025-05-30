import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/auth-hooks';
import { useCart } from '../hooks/useCart';
import ErrorNotification from '../components/ErrorNotification';
import apiClient from '../api/apiClient';
import axios from 'axios';
import { formatCurrency } from '../utils/formatters';

// Danh sách phương thức thanh toán phù hợp với backend
const PAYMENT_METHODS = [
  { id: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
  { id: 'COD', label: 'Thanh toán khi nhận hàng' },
  { id: 'CREDIT_CARD', label: 'Thanh toán trực tuyến' }
];

// Các tỉnh/thành phố
const CITIES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình', 
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

interface ValidationErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

const CheckoutPage: React.FC = () => {
  const { items, total: cartTotal, fetchCart } = useCart();
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[1].id); // Default to COD
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tokenAttempt, setTokenAttempt] = useState(0);

  // Phí vận chuyển và tổng cộng
  const shippingFee = cartTotal > 0 ? 30000 : 0; // 30,000đ
  const grandTotal = cartTotal + shippingFee;

  useEffect(() => {
    // Nếu đã khởi tạo rồi thì không cần chạy lại
    if (isInitialized) return;
    
    const initCheckout = async () => {
      // Giới hạn số lần thử lấy token
      if (tokenAttempt > 2) {
        setErrorMessage('Không thể lấy token xác thực. Vui lòng thử đăng nhập lại.');
        setIsInitialized(true);
        return;
      }

      try {
        // Kiểm tra token trước khi fetchCart
        const token = await getToken();
        if (!token) {
          setTokenAttempt(prev => prev + 1);
          setErrorMessage('Bạn cần đăng nhập để tiếp tục thanh toán.');
          setIsInitialized(true);
          return;
        }
        
        // Lấy giỏ hàng mới nhất - LUÔN gọi API để đảm bảo dữ liệu mới nhất
        // Thêm tham số force=true để bỏ qua cache
        await fetchCart({ force: true });
        
        // Thêm timeout ngắn để đảm bảo state được cập nhật
        setTimeout(() => {
          setIsInitialized(true);
        }, 100);
        
        // Nếu user đã có thông tin địa chỉ, tự động điền
        if (user?.address) {
          try {
            const addressParts = user.address.split(', ');
            if (addressParts.length >= 2) {
              const city = addressParts.pop();
              const address = addressParts.join(', ');
              
              setShippingAddress(prev => ({
                ...prev,
                address,
                city: city || '',
                phone: user.phone || '',
              }));
            }
          } catch (e) {
            console.error('Failed to parse user address', e);
          }
        }
      } catch (error) {
        console.error('Error initializing checkout:', error);
        if (String(error).includes('token') || String(error).includes('authentication')) {
          setTokenAttempt(prev => prev + 1);
          setErrorMessage('Vấn đề xác thực. Vui lòng thử đăng nhập lại.');
        } else {
          setErrorMessage('Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.');
        }
        setIsInitialized(true);
      }
    };

    initCheckout();
  }, [fetchCart, user, tokenAttempt, getToken, isInitialized]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!shippingAddress.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!shippingAddress.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(shippingAddress.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }
    
    if (!shippingAddress.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ';
    }
    
    if (!shippingAddress.city) {
      errors.city = 'Vui lòng chọn tỉnh/thành phố';
    }
    
    if (shippingAddress.postalCode && !/^[0-9]{5,6}$/.test(shippingAddress.postalCode)) {
      errors.postalCode = 'Mã bưu điện không hợp lệ';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress({
      ...shippingAddress,
      [name]: value,
    });
    
    // Clear validation error when user types
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined
      });
    }
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(e.target.value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const formatFullAddress = (): string => {
    return `${shippingAddress.address}, ${shippingAddress.city}${shippingAddress.postalCode ? ', ' + shippingAddress.postalCode : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!items.length) {
      setErrorMessage('Giỏ hàng của bạn đang trống. Không thể tạo đơn hàng.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Giới hạn số lần thử lấy token
      if (tokenAttempt > 2) {
        setErrorMessage('Không thể lấy token xác thực. Vui lòng thử đăng nhập lại.');
        setIsLoading(false);
        return;
      }

      const token = await getToken();
      
      if (!token) {
        setTokenAttempt(prev => prev + 1);
        setErrorMessage('Bạn cần đăng nhập để tiếp tục thanh toán.');
        setIsLoading(false);
        return;
      }

      // Chuẩn bị dữ liệu đơn hàng theo định dạng backend yêu cầu
      const orderData = {
        shippingAddress: formatFullAddress(),
        paymentMethod: paymentMethod,
        notes: notes,
        items: items.map(item => {
          // Kiểm tra và sử dụng trường đúng
          const productName = item.productName;
          return {
            productId: parseInt(item.productId),
            productName: productName,
            quantity: item.quantity,
            price: item.price
          };
        })
      };
      
      const response = await apiClient.post('/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const orderResponse = response.data;
      
      // Sau khi tạo đơn hàng thành công, xóa cache lịch sử đơn hàng để buộc làm mới
      sessionStorage.removeItem('order_history_cache');
      
      // Nếu thanh toán trực tuyến, chuyển hướng đến trang thanh toán từ link được order-service trả về
      if (paymentMethod === 'BANK_TRANSFER') {
        if (orderResponse.paymentInfo && orderResponse.paymentInfo.checkoutUrl) {
          // Lưu thông tin đơn hàng vào localStorage để khôi phục nếu có lỗi
          localStorage.setItem('last_order_number', orderResponse.orderNumber || '');
          window.location.href = orderResponse.paymentInfo.checkoutUrl;
          return;
        } else {
          throw new Error('Không nhận được URL thanh toán từ server');
        }
      }
      
      // Nếu không phải thanh toán trực tuyến hoặc không có URL thanh toán
      setSuccessMessage('Đơn hàng của bạn đã được tạo thành công!');
      
      // Redirect after short delay
      setTimeout(() => {
        // Đảm bảo cache lịch sử đơn hàng được xóa trước khi chuyển hướng
        sessionStorage.removeItem('order_history_cache');
        navigate(`/order/${orderResponse.id}`);
      }, 1000);
    } catch (error: unknown) {
      // Xử lý các loại lỗi từ backend
      let errorMsg = 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại sau.';
      
      if (axios.isAxiosError(error)) {
        console.error('Checkout error:', error);
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      if (errorMsg.includes('Không tìm thấy sản phẩm')) {
        setErrorMessage('Một số sản phẩm không còn tồn tại. Vui lòng cập nhật giỏ hàng.');
      } else if (errorMsg.includes('Giá sản phẩm')) {
        setErrorMessage('Giá sản phẩm đã thay đổi. Vui lòng làm mới giỏ hàng.');
      } else if (errorMsg.includes('không đủ số lượng')) {
        setErrorMessage('Một số sản phẩm không đủ số lượng trong kho.');
      } else if (errorMsg.includes('URL thanh toán')) {
        setErrorMessage('Không thể kết nối đến cổng thanh toán. Vui lòng thử lại sau hoặc chọn phương thức thanh toán khác.');
      } else {
        setErrorMessage(errorMsg);
      }
      
      // Thử làm mới giỏ hàng để đảm bảo dữ liệu mới nhất
      try {
        await fetchCart();
      } catch (cartError) {
        console.error('Failed to refresh cart:', cartError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
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
      {errorMessage && (
        <ErrorNotification 
          message={errorMessage} 
          onClose={() => setErrorMessage('')} 
        />
      )}
      
      {errorMessage && errorMessage.includes('token') && (
        <div className="flex justify-center mt-4 mb-6">
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Đăng nhập lại
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Thành công! </strong>
          <span className="block sm:inline">{successMessage}</span>
          <div className="flex justify-center mt-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-600"></div>
          </div>
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Shipping and Payment Information */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700 mb-2">
                  Họ tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.fullName ? 'border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                {validationErrors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="0912345678"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.phone ? 'border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.address ? 'border-red-500' : ''
                  }`}
                  disabled={isLoading}
                />
                {validationErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.city ? 'border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {validationErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-gray-700 mb-2">
                    Mã bưu điện
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    placeholder="Không bắt buộc"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.postalCode ? 'border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {validationErrors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.postalCode}</p>
                  )}
                </div>
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
                  <label key={method.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={handlePaymentMethodChange}
                      className="mr-2 h-5 w-5 text-blue-600"
                      disabled={isLoading}
                    />
                    <span className="text-gray-700">{method.label}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-blue-300"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : `Đặt hàng (${formatCurrency(grandTotal)}₫)`}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex">
                  <div className="flex-shrink-0 w-20 h-20">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      SL: {item.quantity} x {formatCurrency(item.price)}₫
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatCurrency(item.price * item.quantity)}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span>{formatCurrency(cartTotal)}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>{formatCurrency(shippingFee)}₫</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng</span>
                <span className="text-blue-600">{formatCurrency(grandTotal)}₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 