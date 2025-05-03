import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, OrderDto } from '../api/orderApi';
import { storageCache } from '../utils/storageCache';

// Khóa query cho các endpoint liên quan đến đơn hàng
export const ORDER_QUERY_KEYS = {
  userOrders: 'userOrders',
  orderDetail: 'orderDetail',
  sellerOrders: 'sellerOrders',
  adminOrders: 'adminOrders',
  sellerStats: 'sellerOrderStats',
  adminStats: 'adminOrderStats',
  dashboardStats: 'dashboardStats',
};

// Hook lấy đơn hàng của người dùng với React Query
export const useUserOrdersQuery = (page = 0, size = 10) => {
  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.userOrders, { page, size }],
    queryFn: async () => {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để xem lịch sử đơn hàng');
      }
      
      // Gọi API nếu không có cache
      const response = await orderApi.getUserOrders(page, size);
      let result = {
        orders: [] as OrderDto[],
        totalPages: 1
      };
      
      // Xử lý response tùy thuộc vào định dạng API trả về
      if (Array.isArray(response.data)) {
        result = {
          orders: response.data,
          totalPages: 1
        };
      } else if (response.data && response.data.content) {
        result = {
          orders: response.data.content || [],
          totalPages: response.data.totalPages || 1
        };
      }
      
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 10 * 60 * 1000, // 10 phút
    retry: 1,
  });
};

// Hook lấy chi tiết đơn hàng với React Query
export const useOrderDetailQuery = (orderId?: string) => {
  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.orderDetail, orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required');
      }
      
      // Thử lấy từ cache nếu có
      const cacheKey = `order_detail_${orderId}`;
      const cachedOrder = storageCache.get<OrderDto>(cacheKey);
      
      if (cachedOrder) {
        console.log('Sử dụng chi tiết đơn hàng từ cache');
        return cachedOrder;
      }
      
      // Gọi API nếu không có cache
      const response = await orderApi.getOrderById(orderId);
      
      // Lưu vào cache với thời gian 10 phút
      storageCache.set(cacheKey, response.data, 10 * 60 * 1000);
      
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 15 * 60 * 1000, // 15 phút
    enabled: !!orderId,
  });
};

// Hook hủy đơn hàng với useMutation
export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => orderApi.cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      // Cập nhật cache sau khi hủy đơn hàng thành công
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.orderDetail, orderId] });
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.userOrders] });
      
      // Xóa cache
      storageCache.remove(`order_detail_${orderId}`);
      storageCache.clear('orders_user_page');
    },
  });
};

// Hook lấy thống kê đơn hàng của người bán
export const useSellerStatsQuery = () => {
  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.sellerStats],
    queryFn: async () => {
      // Thử lấy từ cache nếu có
      const cacheKey = 'seller_order_stats';
      const cachedStats = storageCache.get(cacheKey);
      
      if (cachedStats) {
        console.log('Sử dụng thống kê đơn hàng từ cache');
        return cachedStats;
      }
      
      // Gọi API nếu không có cache
      const response = await orderApi.getSellerOrderStats();
      
      // Lưu vào cache với thời gian 30 phút
      storageCache.set(cacheKey, response.data, 30 * 60 * 1000);
      
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 phút
    gcTime: 60 * 60 * 1000, // 1 giờ
  });
}; 