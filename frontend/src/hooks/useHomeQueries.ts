import { useQuery } from '@tanstack/react-query';
import { storageCache } from '../utils/storageCache';
import { Product, Category } from '../types';
import product1Image from '../assets/product-1.jpg';

// Keys cho React Query
export const HOME_QUERY_KEYS = {
  featuredProducts: 'featuredProducts',
  categories: 'categories',
  promotions: 'promotions',
  banners: 'banners'
};

// Định nghĩa kiểu dữ liệu cho Category API response
interface CategoryApiResponse {
  id: number | string;
  name: string;
  imageUrl?: string;
  [key: string]: string | number | boolean | undefined;
}

// Hook lấy sản phẩm nổi bật
export const useFeaturedProductsQuery = () => {
  return useQuery({
    queryKey: [HOME_QUERY_KEYS.featuredProducts],
    queryFn: async () => {
      // Thử lấy từ cache nếu có
      const cacheKey = 'home_featured_products';
      const cachedProducts = storageCache.get<Product[]>(cacheKey);
      
      if (cachedProducts) {
        console.log('Sử dụng sản phẩm nổi bật từ cache');
        return cachedProducts;
      }
      
      try {
        const response = await fetch('/api/products/featured');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch featured products: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lưu vào cache với thời gian 15 phút
        storageCache.set(cacheKey, data, 15 * 60 * 1000);
        
        return data;
      } catch (error) {
        console.error('Error fetching featured products:', error);
        
        // Fallback data nếu có lỗi
        const fallbackProducts = [
          {
            id: '1',
            name: 'Sản phẩm nổi bật 1',
            price: 99.99,
            description: 'Mô tả sản phẩm 1',
            image: product1Image,
            category: 'Điện tử',
            isNew: true
          },
          {
            id: '2',
            name: 'Sản phẩm nổi bật 2',
            price: 149.99,
            description: 'Mô tả sản phẩm 2',
            image: product1Image,
            category: 'Quần áo'
          },
          {
            id: '3',
            name: 'Sản phẩm nổi bật 3',
            price: 199.99,
            description: 'Mô tả sản phẩm 3',
            image: product1Image,
            category: 'Đồ gia dụng'
          },
          {
            id: '4',
            name: 'Sản phẩm nổi bật 4',
            price: 299.99,
            description: 'Mô tả sản phẩm 4',
            image: product1Image,
            category: 'Làm đẹp',
            isNew: true
          }
        ] as Product[];
        
        return fallbackProducts;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000, // 30 phút
  });
};

// Hook lấy danh mục cho trang chủ
export const useHomeCategoriesQuery = () => {
  return useQuery({
    queryKey: [HOME_QUERY_KEYS.categories],
    queryFn: async () => {
      // Thử lấy từ cache nếu có
      const cacheKey = 'home_categories';
      const cachedCategories = storageCache.get<Category[]>(cacheKey);
      
      if (cachedCategories && cachedCategories.length > 0) {
        console.log('Sử dụng danh mục từ cache');
        return cachedCategories;
      }
      
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map data từ API về đúng định dạng Category trong ứng dụng
        const mappedCategories = data.map((item: CategoryApiResponse) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl
        }));
        
        // Lưu vào cache với thời gian 1 giờ (danh mục thường ít thay đổi)
        if (mappedCategories && mappedCategories.length > 0) {
          console.log('Lưu danh mục vào cache', mappedCategories);
          storageCache.set(cacheKey, mappedCategories, 60 * 60 * 1000);
        }
        
        return mappedCategories;
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Fallback data nếu có lỗi
        const fallbackCategories = [
          { id: 1, name: 'Điện tử' },
          { id: 2, name: 'Quần áo' },
          { id: 3, name: 'Đồ gia dụng' },
          { id: 4, name: 'Làm đẹp' }
        ];
        
        // Lưu fallback data vào cache để tránh gọi API liên tục khi có lỗi
        storageCache.set(cacheKey, fallbackCategories, 5 * 60 * 1000); // 5 phút
        
        return fallbackCategories;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 phút
    gcTime: 120 * 60 * 1000, // 2 giờ
  });
};

// Hook lấy khuyến mãi đặc biệt
export const usePromotionsQuery = () => {
  return useQuery({
    queryKey: [HOME_QUERY_KEYS.promotions],
    queryFn: async () => {
      // Thử lấy từ cache nếu có
      const cacheKey = 'home_promotions';
      const cachedPromotions = storageCache.get(cacheKey);
      
      if (cachedPromotions) {
        console.log('Sử dụng khuyến mãi từ cache');
        return cachedPromotions;
      }
      
      try {
        const response = await fetch('/api/promotions/active');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch promotions: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lưu vào cache với thời gian 1 giờ
        storageCache.set(cacheKey, data, 60 * 60 * 1000);
        
        return data;
      } catch (error) {
        console.error('Error fetching promotions:', error);
        return []; // Return empty array if failed
      }
    },
    staleTime: 5 * 60 * 1000, // 5 phút (khuyến mãi có thể thay đổi nhanh)
    gcTime: 15 * 60 * 1000, // 15 phút
  });
};

// Hook lấy banner cho trang chủ
export const useBannersQuery = () => {
  return useQuery({
    queryKey: [HOME_QUERY_KEYS.banners],
    queryFn: async () => {
      // Thử lấy từ cache nếu có
      const cacheKey = 'home_banners';
      const cachedBanners = storageCache.get(cacheKey);
      
      if (cachedBanners) {
        console.log('Sử dụng banners từ cache');
        return cachedBanners;
      }
      
      try {
        const response = await fetch('/api/banners/active');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch banners: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lưu vào cache với thời gian 30 phút
        storageCache.set(cacheKey, data, 30 * 60 * 1000);
        
        return data;
      } catch (error) {
        console.error('Error fetching banners:', error);
        return []; // Return empty array if failed
      }
    },
    staleTime: 15 * 60 * 1000, // 15 phút
    gcTime: 60 * 60 * 1000, // 1 giờ
  });
}; 