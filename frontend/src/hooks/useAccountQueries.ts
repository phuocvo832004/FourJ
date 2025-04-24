import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageCache } from '../utils/storageCache';

// Query keys cho trang account
export const ACCOUNT_QUERY_KEYS = {
  profile: 'userProfile',
  orders: 'userOrders',
  favorites: 'userFavorites',
  addresses: 'userAddresses',
  notifications: 'userNotifications'
};

// Interfaces
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  memberSince?: string;
}

interface Address {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

// Interface OrderSummary được sử dụng trong useOrderHistoryQuery
// Đối tượng trả về sẽ có dạng mảng OrderSummary
export interface OrderSummary {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

// Hook lấy thông tin profile người dùng
export const useUserProfileQuery = () => {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.profile],
    queryFn: async () => {
      // Thử lấy từ cache trước
      const cacheKey = 'user_profile';
      const cachedProfile = storageCache.get<UserProfile>(cacheKey);
      
      if (cachedProfile) {
        console.log('Sử dụng profile từ cache');
        return cachedProfile;
      }
      
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }
        
        const profile = await response.json();
        
        // Tính thời gian là thành viên
        if (profile.createdAt) {
          const createdDate = new Date(profile.createdAt);
          const currentDate = new Date();
          const yearDiff = currentDate.getFullYear() - createdDate.getFullYear();
          
          // Sửa lỗi linter: Đảm bảo các phép tính toán là với kiểu number
          const dayDiff = Math.floor(
            (currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          profile.memberSince = yearDiff > 0 
            ? `${yearDiff} năm` 
            : `${dayDiff} ngày`;
        }
        
        // Lưu vào cache với thời gian 30 phút
        storageCache.set(cacheKey, profile, 30 * 60 * 1000);
        
        return profile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 30 * 60 * 1000, // 30 phút
  });
};

// Hook cập nhật thông tin profile
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedProfile: Partial<UserProfile>) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedProfile)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Cập nhật cache và invalidate query
      queryClient.setQueryData([ACCOUNT_QUERY_KEYS.profile], data);
      
      // Cập nhật storage cache
      const cacheKey = 'user_profile';
      storageCache.set(cacheKey, data, 30 * 60 * 1000);
    }
  });
};

// Hook lấy danh sách địa chỉ
export const useUserAddressesQuery = () => {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.addresses],
    queryFn: async () => {
      // Thử lấy từ cache trước
      const cacheKey = 'user_addresses';
      const cachedAddresses = storageCache.get<Address[]>(cacheKey);
      
      if (cachedAddresses) {
        console.log('Sử dụng địa chỉ từ cache');
        return cachedAddresses;
      }
      
      try {
        const response = await fetch('/api/user/addresses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch addresses: ${response.status}`);
        }
        
        const addresses = await response.json();
        
        // Lưu vào cache với thời gian 1 giờ
        storageCache.set(cacheKey, addresses, 60 * 60 * 1000);
        
        return addresses;
      } catch (error) {
        console.error('Error fetching addresses:', error);
        return [];
      }
    },
    staleTime: 30 * 60 * 1000, // 30 phút
    gcTime: 120 * 60 * 1000, // 2 giờ
  });
};

// Hook lấy lịch sử đơn hàng
export const useOrderHistoryQuery = (page = 1, limit = 5) => {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.orders, page, limit],
    queryFn: async () => {
      // Thử lấy từ cache trước
      const cacheKey = `user_orders_${page}_${limit}`;
      const cachedOrders = storageCache.get(cacheKey);
      
      if (cachedOrders) {
        console.log('Sử dụng đơn hàng từ cache');
        return cachedOrders;
      }
      
      try {
        const response = await fetch(
          `/api/user/orders?page=${page}&limit=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lưu vào cache với thời gian 15 phút
        storageCache.set(cacheKey, data, 15 * 60 * 1000);
        
        return data;
      } catch (error) {
        console.error('Error fetching order history:', error);
        return { 
          orders: [] as OrderSummary[],
          totalPages: 0,
          currentPage: page
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 30 * 60 * 1000, // 30 phút
  });
};

// Hook lấy chi tiết đơn hàng
export const useOrderDetailsQuery = (orderId: string) => {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.orders, orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }
      
      // Thử lấy từ cache trước
      const cacheKey = `order_details_${orderId}`;
      const cachedOrder = storageCache.get(cacheKey);
      
      if (cachedOrder) {
        console.log('Sử dụng chi tiết đơn hàng từ cache');
        return cachedOrder;
      }
      
      try {
        const response = await fetch(`/api/user/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch order details: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lưu vào cache với thời gian 1 giờ
        storageCache.set(cacheKey, data, 60 * 60 * 1000);
        
        return data;
      } catch (error) {
        console.error(`Error fetching order details for ${orderId}:`, error);
        throw error;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 phút
    gcTime: 60 * 60 * 1000, // 1 giờ
    enabled: !!orderId
  });
};

// Hook lấy sản phẩm yêu thích
export const useFavoritesQuery = () => {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.favorites],
    queryFn: async () => {
      // Thử lấy từ cache trước
      const cacheKey = 'user_favorites';
      const cachedFavorites = storageCache.get(cacheKey);
      
      if (cachedFavorites) {
        console.log('Sử dụng yêu thích từ cache');
        return cachedFavorites;
      }
      
      try {
        const response = await fetch('/api/user/favorites', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch favorites: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lưu vào cache với thời gian 5 phút
        storageCache.set(cacheKey, data, 5 * 60 * 1000);
        
        return data;
      } catch (error) {
        console.error('Error fetching favorites:', error);
        return { products: [], total: 0 };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 phút (yêu thích có thể thay đổi thường xuyên)
    gcTime: 10 * 60 * 1000, // 10 phút
  });
}; 