import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import product1Image from '../assets/product-1.jpg';
import { useCategoriesQuery, useFeaturedProductsByCategoryQuery } from '../hooks/useCategoryQueries';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const CategoriesPage: React.FC = () => {
  // Sử dụng React Query để lấy danh mục
  const { data: categories = [], isLoading, error } = useCategoriesQuery();
  
  // Lấy danh sách ID danh mục để prefetch sản phẩm nổi bật
  const categoryIds = useMemo(() => 
    categories.map(category => category.id), 
    [categories]
  );
  
  // Prefetch sản phẩm nổi bật cho từng danh mục
  // Hiện tại chỉ lấy cho danh mục đầu tiên để minh họa
  const { data: featuredProducts = [] } = useFeaturedProductsByCategoryQuery(
    categoryIds[0]
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error instanceof Error ? error.message : 'Không thể tải danh mục'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Shop by Category</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/products?category=${category.name.toLowerCase()}`}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative h-64 rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h2 className="text-white text-2xl font-semibold">
                  {category.name}
                </h2>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Featured Products by Category */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Featured Products by Category</h2>
        {categories.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <Link
                to={`/products?category=${category.name.toLowerCase()}`}
                className="text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Sản phẩm nổi bật sẽ được thêm vào đây */}
              {category.id === categoryIds[0] && featuredProducts.length > 0 ? (
                featuredProducts.map((product: FeaturedProduct) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img 
                      src={product.image || product1Image} 
                      alt={product.name}
                      className="w-full h-48 object-cover" 
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-blue-600 font-semibold mt-1">
                        {product.price.toLocaleString()} VND
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 py-4 text-center text-gray-500">
                  Không có sản phẩm nổi bật
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage; 