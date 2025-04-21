import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminCard from '../../components/ui/AdminCard';
import AdminChart from '../../components/ui/AdminChart';

const AdminAnalyticsPage: React.FC = () => {
  // State cho khoảng thời gian phân tích
  const [timeRange, setTimeRange] = useState<'7_days' | '30_days' | '90_days' | '1_year'>('30_days');
  
  // Mock dữ liệu doanh thu
  const revenueData = {
    '7_days': [
      { label: 'T2', value: 120 },
      { label: 'T3', value: 145 },
      { label: 'T4', value: 132 },
      { label: 'T5', value: 167 },
      { label: 'T6', value: 182 },
      { label: 'T7', value: 196 },
      { label: 'CN', value: 178 },
    ],
    '30_days': Array.from({ length: 30 }, (_, i) => ({
      label: `${i + 1}`,
      value: Math.floor(Math.random() * 100) + 100,
    })),
    '90_days': Array.from({ length: 12 }, (_, i) => ({
      label: `T${i + 1}`,
      value: Math.floor(Math.random() * 200) + 100,
    })),
    '1_year': Array.from({ length: 12 }, (_, i) => ({
      label: `T${i + 1}`,
      value: Math.floor(Math.random() * 300) + 100,
    })),
  };

  // Dữ liệu top sản phẩm
  const topProductsData = [
    { label: 'iPhone 13', value: 56 },
    { label: 'iPad Pro', value: 42 },
    { label: 'MacBook Air', value: 36 },
    { label: 'AirPods Pro', value: 27 },
    { label: 'Apple Watch', value: 21 },
  ];

  // Dữ liệu nguồn lưu lượng truy cập
  const trafficSourcesData = [
    { label: 'Tìm kiếm', value: 45 },
    { label: 'Trực tiếp', value: 30 },
    { label: 'Mạng xã hội', value: 15 },
    { label: 'Email', value: 10 },
  ];

  // Dữ liệu phân tích người dùng
  const userAnalyticsData = {
    newVsReturning: [
      { label: 'Người dùng mới', value: 65 },
      { label: 'Người dùng quay lại', value: 35 },
    ],
    deviceDistribution: [
      { label: 'Desktop', value: 45 },
      { label: 'Mobile', value: 48 },
      { label: 'Tablet', value: 7 },
    ],
    userRetention: [
      { label: 'Tuần 1', value: 100 },
      { label: 'Tuần 2', value: 75 },
      { label: 'Tuần 3', value: 60 },
      { label: 'Tuần 4', value: 55 },
      { label: 'Tuần 5', value: 52 },
      { label: 'Tuần 6', value: 50 },
      { label: 'Tuần 7', value: 48 },
      { label: 'Tuần 8', value: 47 },
    ],
  };

  // Chỉ số KPI
  const kpiData = [
    { metric: 'Tỷ lệ chuyển đổi', value: '3.2%', change: '+0.8%', isUp: true },
    { metric: 'Giá trị đơn hàng trung bình', value: '1.500.000 ₫', change: '+12%', isUp: true },
    { metric: 'Tỷ lệ bị hoàn trả', value: '2.4%', change: '-0.5%', isUp: true },
    { metric: 'Thời gian trên trang', value: '4:32', change: '+0:45', isUp: true },
  ];

  // Xử lý thay đổi khoảng thời gian
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value as '7_days' | '30_days' | '90_days' | '1_year');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header và filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Phân tích dữ liệu</h1>
        <div className="mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="7_days">7 ngày qua</option>
            <option value="30_days">30 ngày qua</option>
            <option value="90_days">90 ngày qua</option>
            <option value="1_year">1 năm qua</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((item, index) => (
          <AdminCard key={index} title={item.metric} className="overflow-visible">
            <div className="pt-2">
              <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
              <div className={`flex items-center text-sm font-medium ${item.isUp ? 'text-green-600' : 'text-red-600'}`}>
                {item.isUp ? (
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {item.change}
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Biểu đồ doanh thu */}
      <AdminCard
        title="Phân tích doanh thu"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        }
      >
        <div className="h-80">
          <AdminChart 
            data={revenueData[timeRange]} 
            type="line" 
            height={300}
            color="#4f46e5"
            showTooltip={true}
            showGrid={true}
          />
        </div>
      </AdminCard>

      {/* Phân tích sản phẩm và nguồn lưu lượng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard
          title="Top sản phẩm bán chạy"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        >
          <div className="h-60">
            <AdminChart 
              data={topProductsData} 
              type="bar" 
              height={230}
              color="#3b82f6"
            />
          </div>
        </AdminCard>

        <AdminCard
          title="Nguồn lưu lượng truy cập"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        >
          <div className="h-60">
            <div className="flex h-full items-center justify-center">
              <div className="w-48 h-48 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {trafficSourcesData.map((item, index) => {
                    const total = trafficSourcesData.reduce((sum, i) => sum + i.value, 0);
                    const startAngle = trafficSourcesData
                      .slice(0, index)
                      .reduce((sum, i) => sum + (i.value / total) * 360, 0);
                    const endAngle = startAngle + (item.value / total) * 360;
                    
                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (endAngle - 90) * (Math.PI / 180);
                    
                    const x1 = 50 + 40 * Math.cos(startRad);
                    const y1 = 50 + 40 * Math.sin(startRad);
                    const x2 = 50 + 40 * Math.cos(endRad);
                    const y2 = 50 + 40 * Math.sin(endRad);
                    
                    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                    
                    const colors = ['#4f46e5', '#3b82f6', '#8b5cf6', '#10b981'];
                    
                    return (
                      <path
                        key={index}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={colors[index % colors.length]}
                        className="hover:opacity-80 transition-opacity duration-200"
                      />
                    );
                  })}
                  <circle cx="50" cy="50" r="20" fill="white" />
                </svg>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {trafficSourcesData.map((item, index) => {
              const colors = ['bg-indigo-600', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500'];
              return (
                <div key={index} className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${colors[index % colors.length]}`}></span>
                  <span className="text-sm text-gray-600">{item.label}: {item.value}%</span>
                </div>
              );
            })}
          </div>
        </AdminCard>
      </div>

      {/* Phân tích người dùng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminCard
          title="Người dùng mới vs. quay lại"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        >
          <div className="h-40 py-4">
            <AdminChart 
              data={userAnalyticsData.newVsReturning} 
              type="bar" 
              height={150}
              color="#8b5cf6"
            />
          </div>
        </AdminCard>

        <AdminCard
          title="Phân bố thiết bị"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        >
          <div className="h-40 py-4">
            <AdminChart 
              data={userAnalyticsData.deviceDistribution} 
              type="bar" 
              height={150}
              color="#ec4899"
            />
          </div>
        </AdminCard>

        <AdminCard
          title="Tỷ lệ giữ chân người dùng"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        >
          <div className="h-40 py-4">
            <AdminChart 
              data={userAnalyticsData.userRetention} 
              type="line" 
              height={150}
              color="#10b981"
            />
          </div>
        </AdminCard>
      </div>

      {/* So sánh với kỳ trước */}
      <AdminCard
        title="So sánh với kỳ trước"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chỉ số
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kỳ này
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kỳ trước
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thay đổi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Doanh thu</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1.452.000.000 ₫</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1.350.000.000 ₫</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    +7.5%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Lượt xem sản phẩm</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">48.250</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">42.120</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    +14.5%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Đơn hàng thành công</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">856</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">789</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    +8.5%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Đơn hàng hủy</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">42</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">36</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    +16.7%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Người dùng mới</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">325</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">286</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    +13.6%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AdminCard>
    </motion.div>
  );
};

export default AdminAnalyticsPage; 