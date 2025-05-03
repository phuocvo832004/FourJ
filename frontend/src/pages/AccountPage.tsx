import  { useState, useEffect, lazy, Suspense, memo } from 'react';
import { useAuth } from '../auth/auth-hooks';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { KeyIcon, UserCircleIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

// API Base URL
const API_BASE_URL = '/api/iam';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Component con cho tabs - được tách riêng để lazy loading
const ProfileTab = lazy(() => import('../components/account/ProfileTab'));
const SecurityTab = lazy(() => import('../components/account/SecurityTab'));
const Auth0Tab = lazy(() => import('../components/account/Auth0Tab'));

// Component loading
const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
));

// Thông báo - được tối ưu với memo để tránh re-render không cần thiết
const Notification = memo(({ type, message }: { type: 'success' | 'error', message: string }) => {
  if (!message) return null;
  
  return (
    <div className={`mb-4 p-3 ${type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} rounded-md`}>
      {message}
    </div>
  );
});

// Kiểu dữ liệu cho update profile
interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

const AccountPage = () => {
  const { user, isAuthenticated, isLoading, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const queryClient = useQueryClient();

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

  // Sử dụng React Query để fetch dữ liệu
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const response = await api.get('/users/me');
        return response.data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && !isLoading
  });

  // Xử lý lỗi khi không lấy được userProfile
  useEffect(() => {
    if (!profileLoading && !userProfile) {
      setErrorMessage('Không thể tải thông tin tài khoản. Vui lòng thử lại sau.');
    }
  }, [profileLoading, userProfile]);

  // Sử dụng useMutation cho việc cập nhật profile
  const updateProfileMutation = useMutation<unknown, unknown, UpdateProfileData>({
    mutationFn: async (updateData: UpdateProfileData) => {
      const response = await api.put('/users/me', updateData);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('Cập nhật thông tin thành công!');
      // Invalidate và refetch dữ liệu
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorMsg = error.response.data?.message || 
                         `Lỗi ${error.response.status}: ${error.response.statusText}`;
          setErrorMessage(`Cập nhật thất bại: ${errorMsg}`);
        } else if (error.request) {
          setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
          setErrorMessage(`Lỗi cấu hình request: ${error.message}`);
        }
      } else {
        setErrorMessage('Cập nhật thông tin thất bại. Vui lòng thử lại.');
      }
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
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

  // Props chung cho các tab
  const commonProps = {
    userProfile: userProfile || null,
    user: user || { name: '', email: '', picture: '' },
    setSuccessMessage,
    setErrorMessage,
    updateProfileMutation
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tài khoản của tôi</h1>

      <Notification type="success" message={successMessage} />
      <Notification type="error" message={errorMessage} />

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
            <Suspense fallback={<LoadingSpinner />}>
              <Tab.Panel className="p-6">
                {profileLoading ? <LoadingSpinner /> : <ProfileTab {...commonProps} />}
              </Tab.Panel>
              <Tab.Panel className="p-6">
                <SecurityTab user={user} />
              </Tab.Panel>
              <Tab.Panel className="p-6">
                <Auth0Tab user={user} />
              </Tab.Panel>
            </Suspense>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default AccountPage;