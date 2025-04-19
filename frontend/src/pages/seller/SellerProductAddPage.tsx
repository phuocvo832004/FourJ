import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: FileList | null;
};

const categories = [
  { id: '1', name: 'Điện thoại' },
  { id: '2', name: 'Máy tính' },
  { id: '3', name: 'Thời trang' },
  { id: '4', name: 'Đồ gia dụng' },
  { id: '5', name: 'Thực phẩm' },
];

const SellerProductAddPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<ProductFormData>();
  
  const createProductMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post('/api/seller/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
      navigate('/seller/products');
    },
  });
  
  const onSubmit = (data: ProductFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('stock', data.stock.toString());
    formData.append('category', data.category);
    
    if (data.images) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i]);
      }
    }
    
    createProductMutation.mutate(formData);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const previewUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      previewUrls.push(url);
    }
    
    setImagePreview(previewUrls);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Thêm Sản Phẩm Mới</h1>
        
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
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh
            </label>
            <Controller
              name="images"
              control={control}
              rules={{ required: 'Hình ảnh là bắt buộc' }}
              render={({ field }) => (
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    field.onChange(e.target.files);
                    handleImageChange(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            />
            {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>}
            
            {imagePreview.length > 0 && (
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {imagePreview.map((src, index) => (
                  <div key={index} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
                    <img src={src} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createProductMutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {createProductMutation.isPending ? 'Đang xử lý...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProductAddPage; 