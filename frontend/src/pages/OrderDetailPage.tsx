import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/auth-hooks';
import { Order } from '../types';
import ErrorNotification from '../components/ErrorNotification';
import apiClient from '../api/apiClient';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading, getToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tokenAttempt, setTokenAttempt] = useState(0);
  const fetchAttemptedRef = useRef(false);

  const fetchOrder = useCallback(async () => {
    if (fetchAttemptedRef.current && order) {
      return;
    }

    if (tokenAttempt > 2) {
      setError('Không thể lấy token xác thực. Vui lòng thử đăng nhập lại.');
      setIsLoadingOrder(false);
      return;
    }

    try {
      setIsLoadingOrder(true);
      const token = await getToken();
      
      if (!token) {
        setTokenAttempt(prev => prev + 1);
        setError('Bạn cần đăng nhập để xem chi tiết đơn hàng');
        setIsLoadingOrder(false);
        return;
      }
      
      const response = await apiClient.get(`/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOrder(response.data);
      fetchAttemptedRef.current = true;
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      fetchAttemptedRef.current = true;
    } finally {
      setIsLoadingOrder(false);
    }
  }, [id, getToken, tokenAttempt, order]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    if (tokenAttempt > 2) {
      setError('Không thể lấy token xác thực. Vui lòng thử đăng nhập lại.');
      return;
    }

    try {
      setIsCancelling(true);
      
      const token = await getToken();
      if (!token) {
        setTokenAttempt(prev => prev + 1);
        setError('Bạn cần đăng nhập để hủy đơn hàng');
        return;
      }
      
      const response = await apiClient.delete(`/orders/${id}/cancel`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOrder(response.data);
      setSuccessMessage('Đơn hàng đã được hủy thành công');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!order || !id) return;
    
    if (tokenAttempt > 2) {
      setError('Không thể lấy token xác thực. Vui lòng thử đăng nhập lại.');
      return;
    }
    
    setIsProcessingPayment(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        setTokenAttempt(prev => prev + 1);
        throw new Error('Không có token xác thực');
      }
      
      const response = await apiClient.post(`/orders/${id}/payment`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = response.data;
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Không thể tạo phiên thanh toán');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error instanceof Error ? error.message : 'Không thể xử lý thanh toán');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleTrackOrder = () => {
    if (!order?.trackingNumber) {
      alert('Đơn hàng chưa có mã theo dõi');
      return;
    }
    window.open(`https://tracking.vnpost.vn/#/result?barcode=${order.trackingNumber}`, '_blank');
  };

  const handlePrintInvoice = () => {
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <p>Mã đơn hàng: #${order.id}</p>
            <p>Ngày: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          
          <div class="info">
            <p><strong>Người nhận:</strong> ${order.recipientName}</p>
            <p><strong>Địa chỉ:</strong> ${
              typeof order.shippingAddress === 'object' 
                ? JSON.stringify(order.shippingAddress) 
                : order.shippingAddress
            }</p>
            <p><strong>Số điện thoại:</strong> ${order.recipientPhone}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.price.toLocaleString('vi-VN')}₫</td>
                  <td>${item.quantity}</td>
                  <td>${(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="total">Tổng cộng:</td>
                <td>${order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0}₫</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="info">
            <p><strong>Phương thức thanh toán:</strong> ${getPaymentMethodName(order.paymentMethod)}</p>
            <p><strong>Trạng thái:</strong> ${getStatusText(order.status)}</p>
            ${order.trackingNumber ? `<p><strong>Mã theo dõi:</strong> ${order.trackingNumber}</p>` : ''}
            ${order.notes ? `<p><strong>Ghi chú:</strong> ${order.notes}</p>` : ''}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipping':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return '';
    }
  };

  const getPaymentMethodName = (method: Order['paymentMethod']) => {
    switch (method) {
      case 'credit_card':
        return 'Thẻ tín dụng';
      case 'paypal':
        return 'PayPal';
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      default:
        return '';
    }
  };

  if (isLoading || isLoadingOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Vui lòng đăng nhập để xem chi tiết đơn hàng</p>
          <Link to="/login" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorNotification message={error} onClose={() => setError('')} />
        <div className="flex justify-center mt-8 gap-4">
          {error.includes('token') && (
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Đăng nhập lại
            </button>
          )}
          <Link to="/orders" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Không tìm thấy thông tin đơn hàng</p>
          <Link to="/orders" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/orders" className="text-primary-600 hover:text-primary-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Quay lại lịch sử đơn hàng
        </Link>
      </div>

      {error && <ErrorNotification message={error} onClose={() => setError(null)} />}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-2xl font-semibold">Chi tiết đơn hàng #{order.id}</h1>
            <div className="mt-2 md:mt-0 flex gap-2">
              {order.status === 'pending' && !order.paymentMethod && (
                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessingPayment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isProcessingPayment ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                        <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="currentColor"/>
                      </svg>
                      Thanh toán
                    </>
                  )}
                </button>
              )}
              {order.status === 'pending' && (
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                </button>
              )}
              {order.trackingNumber && (
                <button
                  onClick={handleTrackOrder}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Theo dõi đơn hàng
                </button>
              )}
              <button
                onClick={handlePrintInvoice}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                In hóa đơn
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Thông tin đơn hàng</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><span className="font-medium">Mã đơn hàng:</span> {order.id}</p>
                <p><span className="font-medium">Ngày đặt:</span> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                <p><span className="font-medium">Phương thức thanh toán:</span> {order.paymentMethod ? getPaymentMethodName(order.paymentMethod) : 'Chưa thanh toán'}</p>
                <p><span className="font-medium">Trạng thái:</span> <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span></p>
                {order.trackingNumber && <p><span className="font-medium">Mã theo dõi:</span> {order.trackingNumber}</p>}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Thông tin giao hàng</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><span className="font-medium">Người nhận:</span> {order.recipientName}</p>
                <p><span className="font-medium">Số điện thoại:</span> {order.recipientPhone}</p>
                <p><span className="font-medium">Địa chỉ:</span> {
                  typeof order.shippingAddress === 'object'
                    ? JSON.stringify(order.shippingAddress)
                    : order.shippingAddress
                }</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Sản phẩm</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Sản phẩm</th>
                    <th className="py-3 px-4 text-center">Đơn giá</th>
                    <th className="py-3 px-4 text-center">Số lượng</th>
                    <th className="py-3 px-4 text-center">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">{item.price.toLocaleString('vi-VN')}₫</td>
                      <td className="py-4 px-4 text-center">{item.quantity}</td>
                      <td className="py-4 px-4 text-center font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-right font-medium">Tổng cộng:</td>
                    <td className="py-4 px-4 text-center font-bold">{order && order.totalAmount ? order.totalAmount.toLocaleString('vi-VN') : 0}₫</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {order.notes && (
            <div>
              <h3 className="text-lg font-medium mb-3">Ghi chú</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 