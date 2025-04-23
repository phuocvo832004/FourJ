import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

type DateRangeOption = '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom';

type Analytics = {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByDate: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    quantity: number;
    image: string;
  }>;
  salesByCategory: Array<{
    category: string;
    sales: number;
    percentage: number;
  }>;
};

const SellerAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeOption>('30days');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  
  // Calculate date range based on selected option
  const getDateRange = () => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;
    
    switch (dateRange) {
      case '7days':
        startDate = subDays(today, 7);
        break;
      case '30days':
        startDate = subDays(today, 30);
        break;
      case 'thisMonth':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'lastMonth': {
        const lastMonth = subMonths(today, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      }
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : subDays(today, 30);
        endDate = customEndDate ? new Date(customEndDate) : today;
        break;
      default:
        startDate = subDays(today, 30);
    }
    
    return {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };
  
  const { startDate, endDate } = getDateRange();
  
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['sellerAnalytics', startDate, endDate],
    queryFn: async () => {
      const response = await axios.get('/api/seller/analytics', {
        params: { startDate, endDate }
      });
      return response.data as Analytics;
    },
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };
  
  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value as DateRangeOption);
  };
  
  // Generating chart data for the sales chart
  const renderSalesChart = () => {
    if (!analytics || !analytics.salesByDate.length) return null;
    
    const maxSales = Math.max(...analytics.salesByDate.map(item => item.sales));
    
    return (
      <div className="relative w-full h-64">
        <div className="flex items-end absolute inset-0 gap-1">
          {analytics.salesByDate.map((item, index) => {
            const height = (item.sales / maxSales) * 100;
            return (
              <div 
                key={index} 
                className="flex-1 flex flex-col items-center justify-end group"
              >
                <div className="relative">
                  <div 
                    className="bg-blue-500 hover:bg-blue-600 w-full rounded-t" 
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {formatCurrency(item.sales)} ({item.orders} đơn)
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 w-full text-center overflow-hidden truncate" title={formatDate(item.date)}>
                  {format(new Date(item.date), 'dd/MM')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const StatCard = ({ title, value, icon, description }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-gray-500 text-sm uppercase font-semibold">{title}</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-5">
              <div className="animate-pulse flex flex-col space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Không có dữ liệu</h1>
          <p className="text-gray-600">Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Thống Kê Cửa Hàng</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="thisMonth">Tháng này</option>
            <option value="lastMonth">Tháng trước</option>
            <option value="custom">Tùy chọn</option>
          </select>
          
          {dateRange === 'custom' && (
            <div className="flex gap-2 mt-2 sm:mt-0">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm"
              />
              <span className="flex items-center">đến</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(analytics.totalSales)}
          icon={<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
          </svg>}
          description={`Từ ${formatDate(startDate)} đến ${formatDate(endDate)}`}
        />
        
        <StatCard
          title="Tổng đơn hàng"
          value={analytics.totalOrders}
          icon={<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>}
        />
        
        <StatCard
          title="Giá trị đơn hàng trung bình"
          value={formatCurrency(analytics.averageOrderValue)}
          icon={<svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path>
          </svg>}
        />
      </div>
      
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Doanh Thu Theo Ngày</h2>
          {renderSalesChart()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sản Phẩm Bán Chạy</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(product.sales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Doanh Thu Theo Danh Mục</h2>
          <div className="space-y-4">
            {analytics.salesByCategory.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{category.category}</span>
                  <span className="text-sm text-gray-500">{formatCurrency(category.sales)} ({category.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalyticsPage;