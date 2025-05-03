import React, { useState, memo } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { UseMutationResult } from '@tanstack/react-query';

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

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

interface ProfileTabProps {
  userProfile: UserProfile | null | undefined;
  user: User;
  updateProfileMutation: UseMutationResult<unknown, unknown, UpdateProfileData, unknown>;
  setSuccessMessage: (message: string) => void;
  setErrorMessage: (message: string) => void;
}

const ProfileTab = memo(({ userProfile, user, updateProfileMutation, setSuccessMessage, setErrorMessage }: ProfileTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userProfile?.fullName || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    avatarUrl: userProfile?.avatarUrl || ''
  });

  // Cập nhật formData khi userProfile thay đổi
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        avatarUrl: userProfile.avatarUrl || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Đảm bảo chỉ gửi các trường được định nghĩa trong UserUpdateDto
    const updateData: UpdateProfileData = {
      fullName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      // Chỉ gửi avatarUrl nếu có thay đổi
      avatarUrl: formData.avatarUrl !== userProfile?.avatarUrl ? formData.avatarUrl : undefined
    };

    updateProfileMutation.mutate(updateData, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/3 mb-6 md:mb-0 flex flex-col items-center">
        <div className="relative">
          <img
            src={userProfile?.avatarUrl || user?.picture || 'https://via.placeholder.com/150'}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            loading="lazy" // Lazy loading cho hình ảnh
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
                disabled={updateProfileMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                {updateProfileMutation.isPending && (
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
  );
});

export default ProfileTab; 