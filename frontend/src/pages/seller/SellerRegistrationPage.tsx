import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SellerApplicationForm } from '../../types';
import { useAuth } from '../../auth/auth-hooks';
import apiClient from '../../api/apiClient';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';

const SellerRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<SellerApplicationForm>({
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    email: '',
    businessRegistrationNumber: '',
    taxId: '',
    bankAccount: {
      accountNumber: '',
      accountName: '',
      bankName: '',
    },
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);

  // Sử dụng biến môi trường từ Vite
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxggv6rnr';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'upload-preset';

  // Kiểm tra nếu người dùng chưa đăng nhập thì chuyển đến trang đăng nhập
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Lưu đường dẫn hiện tại để quay lại sau khi đăng nhập
      localStorage.setItem('redirect_after_login', window.location.pathname);
      login();
    }
  }, [isLoading, isAuthenticated, login]);

  // Kiểm tra và tạo user profile nếu cần
  const checkUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra xem profile đã tồn tại chưa
      const profileResponse = await apiClient.get('/users/profile/me');
      console.log('User profile exists:', profileResponse.data);
      
    } catch (profileError) {
      console.log('User profile not found, creating...', profileError);
      
      // Nếu không có profile, tạo mới
      try {
        // Lấy thông tin từ Auth0 user object
        const profileData = {
          name: user?.name || '',
          email: user?.email || '',
          profilePicture: user?.picture || ''
        };
        
        // Tạo profile mới
        await apiClient.post('/users/profile/me', profileData);
        console.log('User profile created successfully');
        
      } catch (createError) {
        console.error('Error creating user profile:', createError);
        const createErrorObj = createError as { response?: { data?: { message?: string } }, message?: string };
        setError(`Không thể tạo hồ sơ người dùng: ${createErrorObj.response?.data?.message || createErrorObj.message || 'Lỗi không xác định'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setError]);

  // Kiểm tra và đảm bảo user profile đã được tạo
  useEffect(() => {
    if (isAuthenticated && user && !profileChecked) {
      setProfileChecked(true);
      checkUserProfile();
    }
  }, [isAuthenticated, user, profileChecked, checkUserProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof SellerApplicationForm] as Record<string, string>,
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload ảnh lên Cloudinary ngay khi chọn
      try {
        setUploadingLogo(true);
        setError(null);
        
        const response = await uploadImageToCloudinary(
          file,
          CLOUDINARY_UPLOAD_PRESET,
          CLOUDINARY_CLOUD_NAME
        );
        
        // Lưu URL của ảnh đã upload
        setLogoUrl(response.secure_url);
        console.log('Logo đã được upload:', response.secure_url);
      } catch (uploadError) {
        console.error('Lỗi khi upload logo:', uploadError);
        setError('Không thể upload logo. Vui lòng thử lại.');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Kiểm tra xem đã upload logo hay chưa
    if (logoFile && !logoUrl) {
      setError('Vui lòng đợi logo được tải lên hoàn tất');
      setLoading(false);
      return;
    }

    try {
      // Chuẩn bị dữ liệu để gửi đi, sử dụng logoUrl thay vì file và map các trường cho đúng với backend
      const requestData = {
        storeName: formData.name, // Map 'name' thành 'storeName' như backend yêu cầu
        description: formData.description,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        businessRegistrationNumber: formData.businessRegistrationNumber,
        taxId: formData.taxId,
        bankAccount: formData.bankAccount,
        logo: logoUrl // Sử dụng URL đã upload lên Cloudinary
      };

      console.log('Sending seller registration data:', requestData);
      
      // Gửi request đến API
      await apiClient.post('/users/seller/register', requestData);

      // Navigate to pending approval page
      navigate('/seller/pending');
    } catch (error: unknown) {
      console.error('Error submitting seller application:', error);
      // Xử lý lỗi từ apiClient
      const errorObj = error as { response?: { data?: { message?: string } }, errorMessage?: string, message?: string };
      const errorMessage = errorObj.response?.data?.message || errorObj.errorMessage || errorObj.message || 'Đã xảy ra lỗi khi đăng ký';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị trạng thái đang tải khi kiểm tra xác thực
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6">Đăng ký trở thành người bán</h1>
        <p className="mb-8 text-gray-600">
          Hãy cung cấp thông tin chi tiết về cửa hàng của bạn để bắt đầu bán hàng trên nền tảng của chúng tôi.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên cửa hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Logo cửa hàng
              </label>
              <input
                type="file"
                id="logo"
                name="logo"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingLogo}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {uploadingLogo && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-blue-500"></div>
                  Đang tải logo lên...
                </div>
              )}
              {logoPreview && (
                <div className="mt-2">
                  <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-cover" />
                  {logoUrl && (
                    <p className="text-xs text-green-600 mt-1">Đã tải lên thành công</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả cửa hàng <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="businessRegistrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Mã số đăng ký kinh doanh
              </label>
              <input
                type="text"
                id="businessRegistrationNumber"
                name="businessRegistrationNumber"
                value={formData.businessRegistrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                Mã số thuế
              </label>
              <input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Thông tin tài khoản ngân hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="bankAccount.accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  id="bankAccount.accountNumber"
                  name="bankAccount.accountNumber"
                  value={formData.bankAccount?.accountNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bankAccount.accountName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chủ tài khoản
                </label>
                <input
                  type="text"
                  id="bankAccount.accountName"
                  name="bankAccount.accountName"
                  value={formData.bankAccount?.accountName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="bankAccount.bankName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên ngân hàng
                </label>
                <input
                  type="text"
                  id="bankAccount.bankName"
                  name="bankAccount.bankName"
                  value={formData.bankAccount?.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Thông tin bắt buộc
            </p>
            <button
              type="submit"
              disabled={loading || uploadingLogo}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SellerRegistrationPage; 