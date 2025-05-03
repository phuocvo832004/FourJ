import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SellerPendingPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 text-blue-600 rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Đơn đăng ký của bạn đang được xét duyệt</h1>
          <p className="text-lg text-gray-600 mb-6">
            Cảm ơn bạn đã đăng ký làm người bán trên nền tảng của chúng tôi. Đơn đăng ký của bạn đang được xem xét.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Các bước tiếp theo</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">Xét duyệt đơn đăng ký:</span> Chúng tôi sẽ xem xét thông tin bạn đã cung cấp để đảm bảo tính đầy đủ và chính xác.
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">Xác minh thông tin:</span> Trong một số trường hợp, chúng tôi có thể liên hệ để xác minh thêm thông tin.
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">Thông báo kết quả:</span> Bạn sẽ nhận được email thông báo khi đơn đăng ký được phê duyệt hoặc cần bổ sung thông tin.
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="ml-3 text-gray-700">
                <span className="font-medium">Bắt đầu bán hàng:</span> Sau khi được phê duyệt, bạn có thể đăng nhập và bắt đầu quản lý cửa hàng của mình.
              </p>
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Thời gian xét duyệt thông thường là 1-3 ngày làm việc. Cảm ơn bạn đã kiên nhẫn chờ đợi.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Quay lại trang chủ
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SellerPendingPage; 