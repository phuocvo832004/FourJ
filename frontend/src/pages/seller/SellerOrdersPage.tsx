import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: number;
};

type FilterOptions = {
  status: string;
  dateRange: string;
  search: string;
};

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đã giao hàng' },
  { value: 'delivered', label: 'Đã nhận hàng' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const dateRangeOptions = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'year', label: 'Năm nay' },
  { value: 'all', label: 'Tất cả thời gian' },
];

const SellerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    dateRange: 'all',
    search: '',
  });
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['sellerOrders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      const response = await axios.get(`/api/seller/orders?${params.toString()}`);
      return response.data;
    },
  });
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };
  
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, dateRange: e.target.value }));
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };
  
  const getStatusBadgeColor = (status: Order['status']) => {
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
  
  const getStatusText = (status: Order['status']) => {
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
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Đơn Hàng</h1>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian
              </label>
              <select
                id="dateRange"
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <input
                id="search"
                type="text"
                placeholder="Tìm theo mã đơn hoặc tên khách hàng"
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {orders && orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã đơn hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đặt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order: Order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items} sản phẩm
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => navigate(`/seller/orders/${order.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">Không có đơn hàng nào</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerOrdersPage; 