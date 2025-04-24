import { useState, useEffect, useCallback } from 'react';
import { orderApi, OrderDto, OrderStatisticsDto } from '../api/orderApi';

// Interface cho lỗi API
interface ApiError extends Error {
  errorMessage?: string;
  response?: {
    status?: number;
  };
}

// Interface cho dashboard statistics
interface DashboardStatistics {
  totalOrders: number;
  totalRevenue: number;
  recentOrders: OrderDto[];
  [key: string]: unknown;
}

// Hook để lấy danh sách đơn hàng của người dùng
export const useUserOrders = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Kiểm tra token trong localStorage trước khi gửi request
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('Auth token không tồn tại trong localStorage');
        setError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
        setLoading(false);
        
        // Chuyển hướng đến trang đăng nhập
        localStorage.setItem('redirect_after_login', window.location.href);
        window.location.href = '/login';
        return;
      }
      
      // Log để debug
      console.log('Gửi request với authorization header, token length:', token.length);
      
      const response = await orderApi.getUserOrders();
      
      // Giả định backend trả về mảng đơn hàng trực tiếp, không có phân trang
      if (Array.isArray(response.data)) {
        setOrders(response.data);
        setTotalPages(1); // Không có phân trang
      } 
      // Nếu backend trả về dạng có phân trang (để tương thích ngược)
      else if (response.data && response.data.content) {
        setOrders(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
      // Trường hợp khác
      else {
        setOrders([]);
        setTotalPages(1);
      }
      
      setError(null);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error fetching user orders:', apiError);
      
      // Xử lý lỗi 401 - Unauthorized
      if (apiError.response?.status === 401) {
        console.log('Token không hợp lệ hoặc đã hết hạn, chuyển hướng đến trang đăng nhập');
        localStorage.setItem('redirect_after_login', window.location.href);
        window.location.href = '/login';
        return;
      }
      
      setError(apiError.errorMessage || 'Không thể tải đơn hàng. Vui lòng thử lại sau.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, totalPages, refetch: fetchOrders };
};

// Hook để lấy chi tiết đơn hàng
export const useOrderDetail = (orderId: string) => {
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const response = await orderApi.getOrderById(orderId);
      setOrder(response.data);
      setError(null);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error fetching order details:', apiError);
      
      // Xử lý lỗi 401 - Unauthorized
      if (apiError.response?.status === 401) {
        console.log('Token không hợp lệ hoặc đã hết hạn, chuyển hướng đến trang đăng nhập');
        localStorage.setItem('redirect_after_login', window.location.href);
        window.location.href = '/login';
        return;
      }
      
      setError(apiError.errorMessage || 'Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const cancelOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      await orderApi.cancelOrder(orderId);
      // Fetch lại đơn hàng sau khi hủy
      await fetchOrder();
      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error cancelling order:', apiError);
      setError(apiError.errorMessage || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { order, loading, error, refetch: fetchOrder, cancelOrder };
};

// Hook cho thống kê đơn hàng của người bán
export const useSellerOrderStatistics = () => {
  const [statistics, setStatistics] = useState<OrderStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderApi.getSellerOrderStats();
      setStatistics(response.data);
      setError(null);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error fetching seller statistics:', apiError);
      setError(apiError.errorMessage || 'Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
};

// Hook cho thống kê đơn hàng của admin
export const useAdminOrderStatistics = () => {
  const [statistics, setStatistics] = useState<OrderStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAdminOrderStats();
      setStatistics(response.data);
      setError(null);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error fetching admin statistics:', apiError);
      setError(apiError.errorMessage || 'Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
};

// Hook cho đơn hàng của người bán
export const useSellerOrders = (page = 0, size = 10, status?: string) => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderApi.getSellerOrders(page, size);
      
      let filteredOrders = response.data.content || [];
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }

      setOrders(filteredOrders);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error fetching seller orders:', apiError);
      setError(apiError.errorMessage || 'Không thể tải đơn hàng. Vui lòng thử lại sau.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, size, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, totalPages, refetch: fetchOrders };
};

// Hook cho đơn hàng của admin
export const useAdminOrders = (page = 0, size = 10, status?: string) => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAllOrdersAdmin(page, size);
      
      let filteredOrders = response.data.content || [];
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }

      setOrders(filteredOrders);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error fetching admin orders:', apiError);
      setError(apiError.errorMessage || 'Không thể tải đơn hàng. Vui lòng thử lại sau.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, size, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderApi.updateOrderStatusAdmin(orderId, { status });
      await fetchOrders();
      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error updating order status:', apiError);
      setError(apiError.errorMessage || 'Không thể cập nhật trạng thái đơn hàng.');
      return false;
    }
  };

  return { orders, loading, error, totalPages, refetch: fetchOrders, updateOrderStatus };
};

// Hook cho thống kê tổng quan dashboard
export const useDashboardStatistics = (startDate: string, endDate: string) => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAdminDashboardData();
      setStatistics(response.data as DashboardStatistics | null);
      setError(null);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Error fetching dashboard statistics:', apiError);
      setError(apiError.errorMessage || 'Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      setStatistics(null);
    } finally {
      setLoading(false);
    }
    console.log('startDate:', startDate, 'endDate:', endDate);
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
}; 