import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
}

const statusOptions = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đã giao hàng' },
  { value: 'delivered', label: 'Đã nhận hàng' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const SellerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');
  
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['sellerOrder', id],
    queryFn: async () => {
      const response = await axios.get(`/api/seller/orders/${id}`);
      
      // Set initial status for update
      setNewStatus(response.data.status);
      
      return response.data;
    },
  });
  
  const updateOrderMutation = useMutation({
    mutationFn: async (data: { status: OrderStatus; note: string }) => {
      const response = await axios.patch(`/api/seller/orders/${id}/status`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerOrder', id] });
      queryClient.invalidateQueries({ queryKey: ['sellerOrders'] });
      setStatusNote('');
    },
  });
  
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStatus) return;
    
    updateOrderMutation.mutate({
      status: newStatus as OrderStatus,
      note: statusNote,
    });
  };
  
  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đã giao hàng';
      case 'delivered':
        return 'Đã nhận hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm - dd/MM/yyyy', { locale: vi });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center py-4">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h1>
            <p className="text-gray-600">Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.</p>
            <button
              onClick={() => navigate('/seller/orders')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/seller/orders')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Đơn hàng #{order.orderNumber}</h1>
              <p className="text-gray-500 mt-1">
                Đặt ngày: {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cập nhật trạng thái</h2>
          <form onSubmit={handleUpdateStatus}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái mới
                </label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn trạng thái</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <input
                  id="note"
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Thêm ghi chú về việc cập nhật trạng thái"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={!newStatus || newStatus === order.status || updateOrderMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {updateOrderMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 p-6 gap-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Thông tin khách hàng</h2>
            <p className="text-gray-600"><span className="font-medium">Tên:</span> {order.customerName}</p>
            <p className="text-gray-600"><span className="font-medium">Email:</span> {order.customerEmail}</p>
            <p className="text-gray-600"><span className="font-medium">Số điện thoại:</span> {order.customerPhone}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Địa chỉ giao hàng</h2>
            <p className="text-gray-600">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress.address}</p>
            <p className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-600">{order.shippingAddress.country}</p>
            <p className="text-gray-600">{order.shippingAddress.phone}</p>
          </div>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item: OrderItem) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-md object-cover" src={item.productImage} alt={item.productName} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-500">ID: {item.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col items-end">
            <div className="text-gray-600 flex justify-between w-full max-w-xs">
              <span>Tạm tính:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="text-gray-600 flex justify-between w-full max-w-xs">
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="text-gray-600 flex justify-between w-full max-w-xs">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="text-lg font-bold text-gray-900 flex justify-between w-full max-w-xs mt-2">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-900">Ghi chú của khách hàng:</h3>
              <p className="text-gray-600 mt-1">{order.notes}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-between items-center">
            <div className="text-gray-600">
              <span className="font-medium">Phương thức thanh toán:</span> {order.paymentMethod}
            </div>
            <div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}`}
              >
                {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                 order.paymentStatus === 'pending' ? 'Chờ thanh toán' : 
                 'Thanh toán thất bại'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetailPage; 