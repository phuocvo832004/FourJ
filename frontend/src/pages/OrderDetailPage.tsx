import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/auth-hooks';
import ErrorNotification from '../components/ErrorNotification';
import { formatDateTime } from '../utils/formatters';
import { useOrderDetail } from '../hooks/useOrder';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading } = useAuth();
  const { order, loading: isLoadingOrder, error, cancelOrder } = useOrderDetail(id || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleCancelOrder = async () => {
    try {
      const success = await cancelOrder();
      if (success) {
        setSuccessMessage('Đơn hàng đã được hủy thành công');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  if (isLoading || isLoadingOrder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">Vui lòng đăng nhập để xem chi tiết đơn hàng</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/orders" className="text-blue-600 hover:text-blue-800 mr-4">
            &larr; Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-3xl font-semibold">Chi tiết đơn hàng</h1>
        </div>
        <ErrorNotification message={error} onClose={() => {}} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/orders" className="text-blue-600 hover:text-blue-800 mr-4">
            &larr; Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-3xl font-semibold">Chi tiết đơn hàng</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600">Không tìm thấy thông tin đơn hàng</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'SHIPPED':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'COMPLETED':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'CREDIT_CARD':
        return 'Thẻ tín dụng/Ghi nợ';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng';
      case 'PAYPAL':
        return 'PayPal';
      default:
        return method;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'COMPLETED':
        return 'Đã thanh toán';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{successMessage}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg onClick={() => setSuccessMessage(null)} className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Đóng</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      <div className="flex items-center mb-6">
        <Link to="/orders" className="text-blue-600 hover:text-blue-800 mr-4">
          &larr; Quay lại danh sách đơn hàng
        </Link>
        <h1 className="text-3xl font-semibold">Chi tiết đơn hàng #{order.orderNumber}</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500">Ngày đặt: <span className="font-medium text-gray-900">{formatDateTime(order.createdAt)}</span></p>
              <p className="text-gray-500">Cập nhật: <span className="font-medium text-gray-900">{formatDateTime(order.updatedAt)}</span></p>
              {order.completedAt && (
                <p className="text-gray-500">Hoàn thành: <span className="font-medium text-gray-900">{formatDateTime(order.completedAt)}</span></p>
              )}
            </div>
            
            <div className="flex flex-col md:items-end">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              {order.paymentInfo && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentInfo.paymentStatus)}`}>
                  {getPaymentStatusText(order.paymentInfo.paymentStatus)}
                </span>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Địa chỉ giao hàng</h3>
                <p className="text-gray-700">{typeof order.shippingAddress === 'string' ? order.shippingAddress : order.shippingAddress.address}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Phương thức thanh toán</h3>
                {order.paymentInfo && (
                  <>
                    <p className="text-gray-700">{getPaymentMethodName(order.paymentInfo.paymentMethod)}</p>
                    {order.paymentInfo.transactionId && (
                      <p className="text-gray-500 text-sm">Mã giao dịch: {order.paymentInfo.transactionId}</p>
                    )}
                    {order.paymentInfo.paymentDate && (
                      <p className="text-gray-500 text-sm">Ngày thanh toán: {formatDateTime(order.paymentInfo.paymentDate)}</p>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {order.notes && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Ghi chú</h3>
                <p className="text-gray-700">{order.notes}</p>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn giá
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {item.price.toLocaleString()} VND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {(item.price * item.quantity).toLocaleString()} VND
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                      Tổng cộng
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {order.totalAmount.toLocaleString()} VND
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row sm:justify-between">
            {order.status === 'PENDING' && (
              <button
                onClick={handleCancelOrder}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-colors mb-3 sm:mb-0"
              >
                Hủy đơn hàng
              </button>
            )}
            
            {order.paymentInfo && order.paymentInfo.paymentMethod !== 'COD' && order.paymentInfo.paymentStatus === 'PENDING' && order.status !== 'CANCELLED' && (
              <button
                onClick={() => {
                  if (order.paymentInfo && order.paymentInfo.checkoutUrl) {
                    setIsProcessingPayment(true);
                    window.location.href = order.paymentInfo.checkoutUrl;
                  }
                }}
                disabled={isProcessingPayment || !order.paymentInfo.checkoutUrl}
                className={`${
                  isProcessingPayment || !order.paymentInfo.checkoutUrl
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white px-6 py-3 rounded-md transition-colors mb-3 sm:mb-0 sm:ml-3`}
              >
                {isProcessingPayment ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 