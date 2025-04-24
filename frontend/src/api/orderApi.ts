import apiClient from './apiClient';
import { PageResponse } from '../types/api';

// API endpoints for orders
const orderEndpoints = {
  getAllOrdersAdmin: '/orders/admin',
  getOrderByIdAdmin: (id: string) => `/orders/admin/${id}`,
  getUserOrders: '/orders/my-orders',
  createOrder: '/orders',
  cancelOrder: (id: string) => `/orders/${id}/cancel`,
  updateOrderStatusAdmin: (id: string) => `/orders/admin/${id}/status`,
  getOrdersByDateRangeAdmin: '/orders/admin/by-date-range',
  getOrdersByUserAdmin: (userId: string) => `/orders/admin/user/${userId}`,
  getOrdersBySellerAdmin: (sellerId: string) => `/orders/admin/seller/${sellerId}`,
  getAdminOrderStats: '/orders/admin/stats',
  getAdminDashboardData: '/orders/admin/dashboard',
  getSellerOrders: '/orders/seller',
  getSellerOrderById: (id: string) => `/orders/seller/${id}`,
  updateOrderStatusSeller: (id: string) => `/orders/seller/${id}/status`,
  getSellerOrdersByDateRange: '/orders/seller/by-date-range',
  getSellerOrderStats: '/orders/seller/stats',
  getSellerDashboardData: '/orders/seller/dashboard',
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
  shippingAddress: ShippingAddressDto | string;
  paymentInfo?: PaymentInfoDto;
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
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export interface OrderStatisticsDto {
  totalOrders?: number;
  pendingOrders?: number;
  processingOrders?: number;
  shippedOrders?: number;
  deliveredOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  totalRevenue?: number;
  avgOrderValue?: number;
  completionRate?: number;
  cancellationRate?: number;
  orderCountByDay?: Record<string, number>;
  revenueByDay?: Record<string, number>;
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

// Order API functions
export const orderApi = {
  // Customer APIs
  getUserOrders: async (page = 0, size = 10) => {
    return apiClient.get<PageResponse<OrderDto>>(orderEndpoints.getUserOrders, { params: { page, size } });
  },

  getOrderById: async (id: string) => {
    return apiClient.get<OrderDto>(orderEndpoints.getOrderByIdAdmin(id));
  },

  getOrderByNumber: async (orderNumber: string) => {
    return apiClient.get<OrderDto>(orderEndpoints.getOrderByNumber(orderNumber));
  },

  createOrder: async (orderData: CreateOrderRequest) => {
    return apiClient.post<OrderDto>(orderEndpoints.createOrder, orderData);
  },

  cancelOrder: async (id: string) => {
    return apiClient.delete<void>(orderEndpoints.cancelOrder(id));
  },

  // Seller APIs
  getSellerOrders: async (page = 0, size = 10) => {
    return apiClient.get<PageResponse<OrderDto>>(orderEndpoints.getSellerOrders, { params: { page, size } });
  },

  getSellerOrderById: async (id: string) => {
    return apiClient.get<OrderDto>(orderEndpoints.getSellerOrderById(id));
  },

  updateOrderStatusSeller: async (id: string, statusData: UpdateOrderStatusRequest) => {
    return apiClient.put<OrderDto>(orderEndpoints.updateOrderStatusSeller(id), statusData);
  },

  getSellerOrdersByDateRange: async (params: DateRangeParams, page = 0, size = 10) => {
    return apiClient.get<PageResponse<OrderDto>>(orderEndpoints.getSellerOrdersByDateRange, { params: { ...params, page, size } });
  },

  getSellerOrderStats: async () => {
    return apiClient.get<OrderStatisticsDto>(orderEndpoints.getSellerOrderStats);
  },

  getSellerDashboardData: async () => {
    return apiClient.get<unknown>(orderEndpoints.getSellerDashboardData);
  },

  // Admin APIs
  getAllOrdersAdmin: async (page = 0, size = 10) => {
    return apiClient.get<PageResponse<OrderDto>>(orderEndpoints.getAllOrdersAdmin, { params: { page, size } });
  },

  getOrdersByDateRangeAdmin: async (params: DateRangeParams, page = 0, size = 10) => {
    return apiClient.get<PageResponse<OrderDto>>(orderEndpoints.getOrdersByDateRangeAdmin, { params: { ...params, page, size } });
  },

  getOrdersByUserAdmin: async (userId: string, page = 0, size = 10) => {
    return apiClient.get<PageResponse<OrderDto>>(orderEndpoints.getOrdersByUserAdmin(userId), { params: { page, size } });
  },

  getOrdersBySellerAdmin: async (sellerId: string, page = 0, size = 10) => {
    return apiClient.get<PageResponse<OrderDto>>(orderEndpoints.getOrdersBySellerAdmin(sellerId), { params: { page, size } });
  },

  getAdminOrderStats: async () => {
    return apiClient.get<OrderStatisticsDto>(orderEndpoints.getAdminOrderStats);
  },

  getAdminDashboardData: async () => {
    return apiClient.get<unknown>(orderEndpoints.getAdminDashboardData);
  },

  updateOrderStatusAdmin: async (id: string, statusData: UpdateOrderStatusRequest) => {
    return apiClient.put<OrderDto>(orderEndpoints.updateOrderStatusAdmin(id), statusData);
  }
};

export default orderApi; 