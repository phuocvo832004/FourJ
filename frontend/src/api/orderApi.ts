import apiClient from './apiClient';

// API endpoints for orders
const orderEndpoints = {
  getAllOrders: '/orders/admin',
  getOrderById: (id: string) => `/orders/${id}`,
  getUserOrders: '/orders/my-orders',
  createOrder: '/orders',
  cancelOrder: (id: string) => `/orders/${id}/cancel`,
  updateOrderStatus: (id: string) => `/orders/${id}/status`,
  getOrdersByStatus: (status: string) => `/orders/admin/status/${status}`,
  getSellerOrders: '/orders/seller',
  getSellerOrdersByStatus: (status: string) => `/orders/seller/status/${status}`,
  getSellerOrderStatistics: '/orders/seller/statistics',
  getAdminOrderStatistics: '/orders/admin/statistics',
  getDashboardStatistics: '/orders/admin/dashboard',
  getOrderByNumber: (orderNumber: string) => `/orders/number/${orderNumber}`
};

// Order types
export interface OrderDto {
  id: number;
  orderNumber: string;
  userId: string;
  status: string;
  totalAmount: number;
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  paymentInfo: PaymentInfoDto;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface ShippingAddressDto {
  address: string;
}

export interface PaymentInfoDto {
  id?: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  paymentLinkId?: string;
  checkoutUrl?: string;
  payOsOrderCode?: string;
  paymentDate?: string;
}

export interface CreateOrderRequest {
  items: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  paymentMethod: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface OrderStatisticsDto {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  completionRate: number;
  cancellationRate: number;
  orderCountByDay: Record<string, number>;
  revenueByDay: Record<string, number>;
}

// Order API functions
export const orderApi = {
  // Customer APIs
  getUserOrders: async () => {
    return apiClient.get(orderEndpoints.getUserOrders);
  },

  getOrderById: async (id: string) => {
    return apiClient.get(orderEndpoints.getOrderById(id));
  },

  getOrderByNumber: async (orderNumber: string) => {
    return apiClient.get(orderEndpoints.getOrderByNumber(orderNumber));
  },

  createOrder: async (orderData: CreateOrderRequest) => {
    return apiClient.post(orderEndpoints.createOrder, orderData);
  },

  cancelOrder: async (id: string) => {
    return apiClient.post(orderEndpoints.cancelOrder(id));
  },

  // Seller APIs
  getSellerOrders: async (page = 0, size = 10) => {
    return apiClient.get(orderEndpoints.getSellerOrders, {
      params: { page, size }
    });
  },

  getSellerOrdersByStatus: async (status: string, page = 0, size = 10) => {
    return apiClient.get(orderEndpoints.getSellerOrdersByStatus(status), {
      params: { page, size }
    });
  },

  getSellerOrderStatistics: async () => {
    return apiClient.get(orderEndpoints.getSellerOrderStatistics);
  },

  // Admin APIs
  getAllOrders: async (page = 0, size = 10) => {
    return apiClient.get(orderEndpoints.getAllOrders, {
      params: { page, size }
    });
  },

  getOrdersByStatus: async (status: string, page = 0, size = 10) => {
    return apiClient.get(orderEndpoints.getOrdersByStatus(status), {
      params: { page, size }
    });
  },

  getAdminOrderStatistics: async () => {
    return apiClient.get(orderEndpoints.getAdminOrderStatistics);
  },

  getDashboardStatistics: async (startDate: string, endDate: string) => {
    return apiClient.get(orderEndpoints.getDashboardStatistics, {
      params: { startDate, endDate }
    });
  },

  updateOrderStatus: async (id: string, statusData: UpdateOrderStatusRequest) => {
    return apiClient.put(orderEndpoints.updateOrderStatus(id), statusData);
  }
};

export default orderApi; 