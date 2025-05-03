import { useQuery } from '@tanstack/react-query';
import { Category } from '../types';
import { storageCache } from '../utils/storageCache';
import product1Image from '../assets/product-1.jpg';

// Khóa query cho các endpoint liên quan đến danh mục
export const CATEGORY_QUERY_KEYS = {
  allCategories: 'allCategories',
  categoryDetail: 'categoryDetail',
  featuredProducts: 'featuredProducts',
};

// Interface cho dữ liệu danh mục từ API
interface ApiCategory {
  id: number;
  name: string;
  imageUrl?: string;
}

// Hook lấy tất cả danh mục với React Query và cache
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.allCategories],
    queryFn: async () => {
      // Thử lấy từ cache nếu có
      const cacheKey = 'all_categories';
      const cachedCategories = storageCache.get<Category[]>(cacheKey);
      
      if (cachedCategories) {
        console.log('Sử dụng danh mục từ cache');
        return cachedCategories;
      }
      
      // Gọi API nếu không có cache
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map API response to Category type
        const mappedCategories: Category[] = data.map((item: ApiCategory) => ({
          id: item.id.toString(),
          name: item.name,
          image: item.imageUrl || product1Image
        }));
        
        // Lưu vào cache với thời gian 1 giờ (danh mục thường ít thay đổi)
        storageCache.set(cacheKey, mappedCategories, 60 * 60 * 1000);
        
        return mappedCategories;
      } catch (error) {
        console.error('Error fetching categories:', error);
        
        // Trả về danh mục mẫu nếu API lỗi
        const fallbackCategories: Category[] = [
          { id: '1', name: 'Electronics', image: product1Image },
          { id: '2', name: 'Fashion', image: product1Image },
          { id: '3', name: 'Home & Living', image: product1Image },
          { id: '4', name: 'Sports', image: product1Image },
        ];
        
        return fallbackCategories;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 phút
    gcTime: 120 * 60 * 1000, // 2 giờ
  });
};

// Hook lấy sản phẩm nổi bật theo danh mục
export const useFeaturedProductsByCategoryQuery = (categoryId?: string) => {
  return useQuery({
    queryKey: [CATEGORY_QUERY_KEYS.featuredProducts, categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      // Thử lấy từ cache nếu có
      const cacheKey = `featured_products_category_${categoryId}`;
      const cachedProducts = storageCache.get(cacheKey);
      
      if (cachedProducts) {
        console.log('Sử dụng sản phẩm nổi bật từ cache');
        return cachedProducts;
      }
      
      try {
        // Giả sử có API lấy sản phẩm nổi bật theo danh mục
        const response = await fetch(`/api/products/featured?categoryId=${categoryId}&limit=4`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch featured products: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lưu vào cache với thời gian 15 phút
        storageCache.set(cacheKey, data, 15 * 60 * 1000);
        
        return data;
      } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000, // 30 phút
    enabled: !!categoryId,
  });
}; 