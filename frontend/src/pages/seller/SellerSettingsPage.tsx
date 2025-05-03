import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

type SellerProfile = {
  id: string;
  shopName: string;
  description: string;
  logo: string;
  coverImage: string;
  email: string;
  phone: string;
  address: string;
  taxCode: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  shippingSettings: {
    freeShippingThreshold: number;
    shippingFee: number;
  };
};

type ProfileFormData = Omit<SellerProfile, 'id' | 'logo' | 'coverImage'> & {
  logo: FileList | null;
  coverImage: FileList | null;
};

const SellerSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ProfileFormData>();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['sellerProfile'],
    queryFn: async () => {
      const response = await axios.get('/api/users/seller/profile');
      const data = response.data as SellerProfile;
      
      // Set form values
      setValue('shopName', data.shopName);
      setValue('description', data.description);
      setValue('email', data.email);
      setValue('phone', data.phone);
      setValue('address', data.address);
      setValue('taxCode', data.taxCode);
      setValue('socialLinks', data.socialLinks);
      setValue('shippingSettings', data.shippingSettings);
      
      // Set preview images
      setLogoPreview(data.logo);
      setCoverPreview(data.coverImage);
      
      return data;
    },
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.put('/api/users/seller/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProfile'] });
    },
  });
  
  const onSubmit = (data: ProfileFormData) => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('shopName', data.shopName);
    formData.append('description', data.description);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    formData.append('taxCode', data.taxCode);
    
    // Add social links
    formData.append('socialLinks[facebook]', data.socialLinks.facebook || '');
    formData.append('socialLinks[instagram]', data.socialLinks.instagram || '');
    formData.append('socialLinks[twitter]', data.socialLinks.twitter || '');
    
    // Add shipping settings
    formData.append('shippingSettings[freeShippingThreshold]', data.shippingSettings.freeShippingThreshold.toString());
    formData.append('shippingSettings[shippingFee]', data.shippingSettings.shippingFee.toString());
    
    // Add files if selected
    if (data.logo && data.logo.length > 0) {
      formData.append('logo', data.logo[0]);
    }
    
    if (data.coverImage && data.coverImage.length > 0) {
      formData.append('coverImage', data.coverImage[0]);
    }
    
    updateProfileMutation.mutate(formData);
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const previewUrl = URL.createObjectURL(files[0]);
    setLogoPreview(previewUrl);
  };
  
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const previewUrl = URL.createObjectURL(files[0]);
    setCoverPreview(previewUrl);
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="relative h-40 bg-gray-100">
          {coverPreview && (
            <img 
              src={coverPreview} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-3xl font-bold text-white">{profile?.shopName || 'Cài Đặt Cửa Hàng'}</h1>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông Tin Cửa Hàng</h2>
              </div>
              
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên cửa hàng
                </label>
                <input
                  id="shopName"
                  type="text"
                  {...register('shopName', { required: 'Tên cửa hàng là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.shopName && <p className="mt-1 text-sm text-red-600">{errors.shopName.message}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email liên hệ
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { 
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="text"
                  {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>
              
              <div>
                <label htmlFor="taxCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Mã số thuế
                </label>
                <input
                  id="taxCode"
                  type="text"
                  {...register('taxCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input
                  id="address"
                  type="text"
                  {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả cửa hàng
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', { required: 'Mô tả cửa hàng là bắt buộc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-4">Hình Ảnh</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo cửa hàng
                </label>
                <div className="flex items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden mr-4">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                  <div>
                    <Controller
                      name="logo"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleLogoChange(e);
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      )}
                    />
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG - Tối đa 2MB</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh bìa
                </label>
                <div className="flex items-center">
                  <div className="w-32 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                    {coverPreview ? (
                      <img 
                        src={coverPreview} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        Chưa có ảnh
                      </div>
                    )}
                  </div>
                  <div>
                    <Controller
                      name="coverImage"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            field.onChange(e.target.files);
                            handleCoverChange(e);
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      )}
                    />
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG - Tối đa 2MB. Kích thước tốt nhất: 1200x300px</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-4">Mạng Xã Hội</h2>
              </div>
              
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  id="facebook"
                  type="text"
                  placeholder="https://facebook.com/..."
                  {...register('socialLinks.facebook')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  id="instagram"
                  type="text"
                  placeholder="https://instagram.com/..."
                  {...register('socialLinks.instagram')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-4">Cài Đặt Vận Chuyển</h2>
              </div>
              
              <div>
                <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Phí vận chuyển (VNĐ)
                </label>
                <input
                  id="shippingFee"
                  type="number"
                  min="0"
                  step="1000"
                  {...register('shippingSettings.shippingFee', {
                    required: 'Phí vận chuyển là bắt buộc',
                    min: { value: 0, message: 'Phí vận chuyển không được âm' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.shippingSettings?.shippingFee && (
                  <p className="mt-1 text-sm text-red-600">{errors.shippingSettings.shippingFee.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                  Miễn phí vận chuyển cho đơn từ (VNĐ)
                </label>
                <input
                  id="freeShippingThreshold"
                  type="number"
                  min="0"
                  step="10000"
                  {...register('shippingSettings.freeShippingThreshold', {
                    required: 'Giá trị đơn hàng miễn phí vận chuyển là bắt buộc',
                    min: { value: 0, message: 'Giá trị không được âm' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.shippingSettings?.freeShippingThreshold && (
                  <p className="mt-1 text-sm text-red-600">{errors.shippingSettings.freeShippingThreshold.message}</p>
                )}
              </div>
              
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerSettingsPage; 