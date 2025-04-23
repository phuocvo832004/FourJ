import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import MultiImageUpload from '../../components/MultiImageUpload';
import { CloudinaryUploadResponse } from '../../utils/cloudinaryUpload';

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: CloudinaryUploadResponse[];
};

const categories = [
  { id: '1', name: 'Điện thoại' },
  { id: '2', name: 'Máy tính' },
  { id: '3', name: 'Thời trang' },
  { id: '4', name: 'Đồ gia dụng' },
  { id: '5', name: 'Thực phẩm' },
];

const SellerProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<CloudinaryUploadResponse[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Sử dụng biến môi trường từ Vite
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>();
  
  // Thiết lập images mặc định khi component được tạo
  React.useEffect(() => {
    setValue('images', uploadedImages);
  }, [uploadedImages, setValue]);
  
  // Fetch product data
  const { isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await axios.get(`/api/seller/products/${id}`);
      const product = response.data;
      
      // Thiết lập ảnh hiện có (giả sử backend trả về định dạng CloudinaryUploadResponse)
      if (product.images && product.images.length > 0) {
        setUploadedImages(product.images);
      }
      
      // Reset form với dữ liệu lấy được
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        images: product.images
      });
      
      return product;
    },
  });
  
  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Giả sử API của bạn đã được cập nhật để nhận CloudinaryUploadResponse thay vì File
      const response = await axios.put(`/api/seller/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate('/seller/products');
    },
  });
  
  const onSubmit = (data: ProductFormData) => {
    // Kiểm tra xem đã có ảnh được tải lên chưa
    if (!uploadedImages.length) {
      setUploadError('Vui lòng tải lên ít nhất một hình ảnh');
      return;
    }
    
    // Gán danh sách ảnh đã upload vào dữ liệu form
    data.images = uploadedImages;
    
    // Gửi dữ liệu JSON thay vì FormData vì hình ảnh đã được upload trực tiếp lên Cloudinary
    updateProductMutation.mutate(data);
  };
  
  const handleImagesUploaded = (newImages: CloudinaryUploadResponse[]) => {
    setUploadedImages(prev => [...prev, ...newImages]);
    setUploadError(null);
  };
  
  const handleUploadError = (error: string) => {
    setUploadError(error);
    // Tự động xóa thông báo lỗi sau 5 giây
    setTimeout(() => setUploadError(null), 5000);
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
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center py-4">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h1>
            <p className="text-gray-600">Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.</p>
            <button
              onClick={() => navigate('/seller/products')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh Sửa Sản Phẩm</h1>
        
        {uploadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">{uploadError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', { required: 'Mô tả sản phẩm là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Giá (VNĐ)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="1000"
                {...register('price', { 
                  required: 'Giá là bắt buộc', 
                  min: { value: 1000, message: 'Giá phải lớn hơn 1.000đ' } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>
            
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                {...register('stock', { 
                  required: 'Số lượng là bắt buộc', 
                  min: { value: 0, message: 'Số lượng phải lớn hơn hoặc bằng 0' } 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              id="category"
              {...register('category', { required: 'Danh mục là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh sản phẩm
            </label>
            <MultiImageUpload
              onImagesUploaded={handleImagesUploaded}
              onError={handleUploadError}
              cloudName={CLOUDINARY_CLOUD_NAME}
              uploadPreset={CLOUDINARY_UPLOAD_PRESET}
              maxFiles={10}
              initialImages={uploadedImages}
            />
            {uploadedImages.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">Vui lòng tải lên ít nhất một hình ảnh cho sản phẩm</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isPending}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                updateProductMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {updateProductMutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProductEditPage; 