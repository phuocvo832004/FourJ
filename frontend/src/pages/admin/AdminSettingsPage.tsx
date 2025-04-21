import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AdminCard from '../../components/ui/AdminCard';

const AdminSettingsPage: React.FC = () => {
  // State cho các cài đặt hệ thống
  const [settings, setSettings] = useState({
    siteName: 'FourJ Shop',
    siteDescription: 'Hệ thống bán hàng điện tử chuyên nghiệp',
    contactEmail: 'support@fourj.com',
    supportPhone: '1900 1234',
    address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
    enableRegistration: true,
    enableCheckout: true,
    maintenanceMode: false,
    taxRate: 10,
    shippingFee: 30000,
    freeShippingThreshold: 500000,
    itemsPerPage: 12,
    currencySymbol: '₫',
    languages: ['vi', 'en'],
    defaultLanguage: 'vi',
    timeZone: 'Asia/Ho_Chi_Minh',
    emailNotifications: true,
    smsNotifications: false,
  });

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setSettings({ ...settings, [name]: checked });
    } else if (type === 'number') {
      setSettings({ ...settings, [name]: parseFloat(value) });
    } else {
      setSettings({ ...settings, [name]: value });
    }
  };

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ở đây sẽ gửi dữ liệu cài đặt lên server
    alert('Đã lưu cài đặt thành công!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Cài đặt hệ thống</h1>
        <div className="mt-4 md:mt-0">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Lưu cài đặt
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <AdminCard
          title="Thông tin cơ bản"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                Tên hệ thống
              </label>
              <input
                type="text"
                name="siteName"
                id="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email liên hệ
              </label>
              <input
                type="email"
                name="contactEmail"
                id="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="supportPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại hỗ trợ
              </label>
              <input
                type="text"
                name="supportPhone"
                id="supportPhone"
                value={settings.supportPhone}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả hệ thống
              </label>
              <textarea
                name="siteDescription"
                id="siteDescription"
                rows={3}
                value={settings.siteDescription}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={settings.address}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </AdminCard>

        {/* Cài đặt giao dịch */}
        <AdminCard
          title="Cài đặt giao dịch"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-1">
                Thuế suất (%)
              </label>
              <input
                type="number"
                name="taxRate"
                id="taxRate"
                value={settings.taxRate}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700 mb-1">
                Phí vận chuyển ({settings.currencySymbol})
              </label>
              <input
                type="number"
                name="shippingFee"
                id="shippingFee"
                value={settings.shippingFee}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                Miễn phí vận chuyển từ ({settings.currencySymbol})
              </label>
              <input
                type="number"
                name="freeShippingThreshold"
                id="freeShippingThreshold"
                value={settings.freeShippingThreshold}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
                Số sản phẩm trên mỗi trang
              </label>
              <input
                type="number"
                name="itemsPerPage"
                id="itemsPerPage"
                value={settings.itemsPerPage}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 mb-1">
                Ký hiệu tiền tệ
              </label>
              <input
                type="text"
                name="currencySymbol"
                id="currencySymbol"
                value={settings.currencySymbol}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                Ngôn ngữ mặc định
              </label>
              <select
                name="defaultLanguage"
                id="defaultLanguage"
                value={settings.defaultLanguage}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">Tiếng Anh</option>
              </select>
            </div>
          </div>
        </AdminCard>

        {/* Thiết lập hệ thống */}
        <AdminCard
          title="Thiết lập hệ thống"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enableRegistration"
                id="enableRegistration"
                checked={settings.enableRegistration}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="enableRegistration" className="ml-2 block text-sm text-gray-700">
                Cho phép đăng ký tài khoản mới
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="enableCheckout"
                id="enableCheckout"
                checked={settings.enableCheckout}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="enableCheckout" className="ml-2 block text-sm text-gray-700">
                Cho phép thanh toán đơn hàng
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="maintenanceMode"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                Bật chế độ bảo trì
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="emailNotifications"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                Gửi thông báo qua email
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="smsNotifications"
                id="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                Gửi thông báo qua SMS
              </label>
            </div>
            
            <div>
              <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 mb-1">
                Múi giờ
              </label>
              <select
                name="timeZone"
                id="timeZone"
                value={settings.timeZone}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="Asia/Ho_Chi_Minh">Hồ Chí Minh (GMT+7)</option>
                <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                <option value="Asia/Singapore">Singapore (GMT+8)</option>
                <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
              </select>
            </div>
          </div>
        </AdminCard>

        {/* Cài đặt nâng cao */}
        <AdminCard
          title="Cài đặt nâng cao"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
          footer={
            <div className="text-sm text-gray-500">
              Các cài đặt nâng cao có thể ảnh hưởng đến hoạt động của hệ thống. Hãy cẩn thận khi thay đổi.
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-6">
            <div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Xóa cache hệ thống
              </button>
            </div>
            
            <div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Khởi động lại server
              </button>
            </div>
            
            <div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Khôi phục cài đặt mặc định
              </button>
            </div>
          </div>
        </AdminCard>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Lưu tất cả thay đổi
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminSettingsPage; 