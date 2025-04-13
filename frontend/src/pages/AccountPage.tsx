import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/auth-hooks';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { ShieldCheckIcon, KeyIcon, UserCircleIcon, IdentificationIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Định nghĩa kiểu dữ liệu
interface UserProfile {
  id: string;
  auth0Id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface UserRoles {
  userId: string;
  roles: string[];
  permissions: string[];
}

// API Base URL
const API_BASE_URL = '/api/iam';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const AccountPage = () => {
  const { user, isAuthenticated, isLoading, getToken } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRoles | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    avatarUrl: ''
  });
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Thêm interceptor để tự động thêm token vào mọi request
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      // Clean up interceptor khi component unmount
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [getToken]);

  // Lấy thông tin người dùng từ backend
  const fetchUserProfile = async () => {
    try {
      setErrorMessage('');
      
      const response = await api.get('/users/me');
      console.log('Profile data:', response.data);
      
      setUserProfile(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        avatarUrl: response.data.avatarUrl || ''
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(`Không thể tải thông tin: ${error.response.status} - ${error.response.statusText}`);
      } else {
        setErrorMessage('Không thể tải thông tin tài khoản. Vui lòng thử lại sau.');
      }
    }
  };

  // Lấy thông tin quyền của người dùng
  const fetchUserRoles = async () => {
    try {
      const response = await api.get('/users/me/permissions');
      setUserRoles(response.data);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      // Không hiển thị lỗi này cho người dùng vì không quan trọng bằng thông tin cá nhân
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchUserProfile();
      fetchUserRoles();
    }
  }, [isAuthenticated, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Đảm bảo chỉ gửi các trường được định nghĩa trong UserUpdateDto
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        // Chỉ gửi avatarUrl nếu có thay đổi
        avatarUrl: formData.avatarUrl !== userProfile?.avatarUrl ? formData.avatarUrl : undefined
      };

      // Gọi API với URL chính xác dựa trên context-path trong backend
      const response = await api.put('/users/me', updateData);
      
      console.log('Update response:', response.data);
      setSuccessMessage('Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      // Cập nhật lại thông tin người dùng
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Hiển thị thông báo lỗi từ API nếu có
          const errorMsg = error.response.data?.message || 
                          `Lỗi ${error.response.status}: ${error.response.statusText}`;
          setErrorMessage(`Cập nhật thất bại: ${errorMsg}`);
        } else if (error.request) {
          // Không nhận được response
          setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
          // Lỗi cấu hình request
          setErrorMessage(`Lỗi cấu hình request: ${error.message}`);
        }
      } else {
        setErrorMessage('Cập nhật thông tin thất bại. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (!isAuthenticated) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600 mb-4">Vui lòng đăng nhập để xem thông tin tài khoản</p>
            <a href="/login" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
              Đăng nhập
            </a>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
            <Tab.List className="flex bg-gray-100 p-1">
              <Tab className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center
               ${selected ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Thông tin cá nhân
              </Tab>
              <Tab className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center
               ${selected ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                Quyền hạn & Vai trò
              </Tab>
              <Tab className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center
               ${selected ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                <KeyIcon className="w-5 h-5 mr-2" />
                Bảo mật
              </Tab>
              <Tab className={({ selected }) =>
                  `w-full py-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center
               ${selected ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                <IdentificationIcon className="w-5 h-5 mr-2" />
                Tài khoản Auth0
              </Tab>
            </Tab.List>

            <Tab.Panels>
              {/* Thông tin cá nhân */}
              <Tab.Panel className="p-6">
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                      {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                      {errorMessage}
                    </div>
                )}

                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
                    <div className="relative">
                      <img
                          src={userProfile?.avatarUrl || user?.picture || 'https://via.placeholder.com/150'}
                          alt="Avatar"
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                      {isEditing && (
                          <button
                              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                              title="Thay đổi ảnh đại diện"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </button>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold mt-4">{userProfile?.fullName || user?.name}</h2>
                    <p className="text-gray-500">{userProfile?.email || user?.email}</p>
                  </div>

                  <div className="md:w-2/3 md:pl-8">
                    {isEditing ? (
                        <form onSubmit={handleSubmit}>
                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                              Họ và tên
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                              Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={userProfile?.email || user?.email || ''}
                                disabled
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight bg-gray-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                          </div>

                          <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                              Số điện thoại
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                          </div>

                          <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                              Địa chỉ
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                          </div>

                          <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                            >
                              Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                            >
                              {isSubmitting && (
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                              )}
                              Lưu thông tin
                            </button>
                          </div>
                        </form>
                    ) : (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-gray-500">Họ và tên</p>
                              <p className="font-medium">{userProfile?.fullName || user?.name || 'Chưa cập nhật'}</p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium">{userProfile?.email || user?.email}</p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-500">Số điện thoại</p>
                              <p className="font-medium">{userProfile?.phone || 'Chưa cập nhật'}</p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-500">Ngày tham gia</p>
                              <p className="font-medium">
                                {userProfile?.createdAt
                                    ? new Date(userProfile.createdAt).toLocaleDateString('vi-VN')
                                    : 'Không có thông tin'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6">
                            <p className="text-sm text-gray-500">Địa chỉ</p>
                            <p className="font-medium">{userProfile?.address || 'Chưa cập nhật'}</p>
                          </div>

                          <div className="mt-8">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                              Chỉnh sửa thông tin
                            </button>
                          </div>
                        </div>
                    )}
                  </div>
                </div>
              </Tab.Panel>

              {/* Quyền hạn & Vai trò */}
              <Tab.Panel className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Vai trò và quyền hạn của bạn</h2>

                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Vai trò</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {userRoles?.roles && userRoles.roles.length > 0 ? (
                        userRoles.roles.map((role, index) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                              <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-3" />
                              <span className="font-medium capitalize">{role}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">Không có vai trò nào được gán</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Quyền hạn</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    {userRoles?.permissions && userRoles.permissions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {userRoles.permissions.map((permission, index) => (
                              <div key={index} className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm">{permission}</span>
                              </div>
                          ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Không có quyền hạn cụ thể</p>
                    )}
                  </div>
                </div>
              </Tab.Panel>

              {/* Bảo mật */}
              <Tab.Panel className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Bảo mật tài khoản</h2>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Thay đổi mật khẩu</h3>
                        <p className="text-gray-500 mt-1">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn</p>
                      </div>
                      <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                          onClick={() => {
                            window.location.href = `https://${user!.iss!.split('/')[2]}/account/password`;
                          }}
                      >
                        Thay đổi
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Xác thực hai yếu tố</h3>
                        <p className="text-gray-500 mt-1">Tăng cường bảo mật bằng xác thực hai yếu tố</p>
                      </div>
                      <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                          onClick={() => {
                            window.location.href = `https://${user!.iss!.split('/')[2]}/account/mfa`;
                          }}
                      >
                        Thiết lập
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Phiên đăng nhập hoạt động</h3>
                        <p className="text-gray-500 mt-1">Xem và quản lý các phiên đăng nhập của bạn</p>
                      </div>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
                        Xem
                      </button>
                    </div>
                  </div>
                </div>
              </Tab.Panel>

              {/* Tài khoản Auth0 */}
              <Tab.Panel className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Thông tin Auth0</h2>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">ID người dùng (Auth0)</p>
                      <p className="font-mono bg-gray-100 p-2 rounded mt-1 text-sm break-all">{user?.sub}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Email đã xác minh</p>
                      <p className="mt-1 flex items-center">
                        {user?.email_verified ? (
                            <span className="text-green-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Đã xác minh
                        </span>
                        ) : (
                            <span className="text-red-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          Chưa xác minh
                        </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Người cung cấp</p>
                      <p className="font-medium mt-1 capitalize">{(user?.sub || '').split('|')[0]}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Đăng nhập lần cuối</p>
                      <p className="font-medium mt-1">{new Date(user?.updated_at || '').toLocaleString('vi-VN')}</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => {
                          window.location.href = `https://${user!.iss!.split('/')[2]}/account`;
                        }}
                    >
                      Truy cập trang quản lý Auth0
                    </button>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
  );
};

export default AccountPage;