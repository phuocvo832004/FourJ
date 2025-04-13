import { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Giả lập gửi dữ liệu đi
    setTimeout(() => {
      // Giả lập thành công
      setLoading(false);
      setSubmitted(true);
      
      // Reset form sau khi gửi thành công
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tiêu đề trang */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">Liên hệ với chúng tôi</h1>
            <p className="text-gray-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              {/* Thông tin liên hệ */}
              <div className="bg-blue-600 text-white p-8 md:w-1/3">
                <h2 className="text-xl font-bold mb-6">Thông tin liên hệ</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium">Địa chỉ</h3>
                      <p className="mt-1 text-blue-100">123 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <h3 className="font-medium">Điện thoại</h3>
                      <p className="mt-1 text-blue-100">+84 28 3123 4567</p>
                      <p className="text-blue-100">Hotline: 1900 1234</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="mt-1 text-blue-100">info@ecommerce.com</p>
                      <p className="text-blue-100">support@ecommerce.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium">Giờ làm việc</h3>
                      <p className="mt-1 text-blue-100">Thứ Hai - Thứ Sáu: 8:00 - 17:30</p>
                      <p className="text-blue-100">Thứ Bảy: 8:00 - 12:00</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <h3 className="font-medium mb-4">Kết nối với chúng tôi</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="bg-white p-2 rounded-full text-blue-600 hover:bg-blue-50">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-white p-2 rounded-full text-blue-600 hover:bg-blue-50">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10zm4.893 7.932l-.018.051c-.678 2.03-1.941 4.108-4.107 6.236-2.166 2.128-4.16 3.245-6.098 3.726l-.051.013-.067-.056a7.842 7.842 0 01-2.276-3.392l-.013-.051.058-.066c.668-.67 1.832-1.3 2.973-1.85l.162-.078.169.01c.344.024.689.01 1.035-.014l.332-.025-.02-.335a9.033 9.033 0 01.031-1.227c.04-.374.105-.718.197-1.038l.03-.1.082-.158c.755-1.439 1.781-2.681 3.022-3.701l.139-.114.158-.118.182.067c.256.092.49.21.695.354.89.633 1.445 1.504 1.598 2.455l.015.15-.122.088z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-white p-2 rounded-full text-blue-600 hover:bg-blue-50">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Form liên hệ */}
              <div className="p-8 md:w-2/3">
                <h2 className="text-xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>
                
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    <h3 className="font-bold">Cảm ơn bạn đã liên hệ!</h3>
                    <p className="mt-2">Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.</p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Gửi tin nhắn khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="subject" className="block text-gray-700 mb-1">Chủ đề <span className="text-red-500">*</span></label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="">-- Chọn chủ đề --</option>
                        <option value="question">Câu hỏi chung</option>
                        <option value="support">Hỗ trợ kỹ thuật</option>
                        <option value="order">Về đơn hàng</option>
                        <option value="return">Trả hàng/Hoàn tiền</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="message" className="block text-gray-700 mb-1">Tin nhắn <span className="text-red-500">*</span></label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.message}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center">
                        <input
                          id="privacy"
                          type="checkbox"
                          required
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                          Tôi đã đọc và đồng ý với <a href="#" className="text-blue-600 hover:underline">chính sách bảo mật</a>
                        </label>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
          
          {/* Google Maps */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Vị trí của chúng tôi</h2>
            <div className="bg-gray-300 h-96 rounded-lg overflow-hidden">
              {/* Thay thế bằng iframe Google Maps thực tế */}
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <p className="text-gray-600">Bản đồ Google Maps sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 