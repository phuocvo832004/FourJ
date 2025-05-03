// src/types/order.ts
// import { PageResponse } from './api'; // Xóa import không dùng

// ---- Order Service DTOs ----

// DTO chi tiết cho Item trong đơn hàng
// Trả về từ GET /orders/{id}, GET /orders/admin/{id}, ...
export interface OrderItemDto {
  productId: number;
  productName: string; // Tên sản phẩm tại thời điểm đặt hàng
  price: number; // Giá sản phẩm tại thời điểm đặt hàng
  quantity: number;
  imageUrl?: string; // Lấy từ Product service?
}

// DTO cho địa chỉ giao hàng
// Có thể là một object riêng hoặc chỉ là string tùy backend
export interface ShippingAddressDto {
  fullName: string; // Tên người nhận
  phoneNumber: string; // SĐT người nhận
  addressLine1: string; // Số nhà, tên đường
  ward?: string; // Phường/Xã
  district?: string; // Quận/Huyện
  city: string; // Tỉnh/Thành phố
  postalCode?: string; // Mã bưu điện
  country?: string; // Quốc gia (mặc định VN?)
}

// DTO cho thông tin thanh toán
export interface PaymentInfoDto {
  id?: number; // ID bản ghi thanh toán nếu có
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'PAYOS'; // Enum các phương thức
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'; // Enum trạng thái
  transactionId?: string; // ID giao dịch từ cổng thanh toán/ngân hàng
  paymentLinkId?: string; // Link thanh toán (nếu có, ví dụ PayOS)
  checkoutUrl?: string; // Link thanh toán (nếu có, ví dụ PayOS)
  payOsOrderCode?: string; // Mã đơn hàng của PayOS
  paymentDate?: string; // Thời gian thanh toán thành công
  amount?: number; // Số tiền thanh toán (có thể khác totalAmount nếu có voucher)
}

// DTO chính cho Đơn hàng
// Trả về từ các API GET orders
export interface OrderDto {
  id: number;
  orderNumber: string; // Mã đơn hàng
  userId: string; // ID của người mua
  sellerId?: string; // ID của người bán (nếu đơn hàng thuộc về 1 seller)
  items: OrderItemDto[];
  totalAmount: number; // Tổng giá trị đơn hàng (chưa gồm ship, giảm giá?)
  shippingFee?: number; // Phí vận chuyển
  discountAmount?: number; // Số tiền giảm giá
  finalAmount?: number; // Số tiền cuối cùng phải trả
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED'; // Enum trạng thái chi tiết hơn
  shippingAddress: ShippingAddressDto | string; // Backend trả về object hay string?
  paymentInfo?: PaymentInfoDto;
  notes?: string; // Ghi chú của khách hàng
  cancellationReason?: string; // Lý do hủy (nếu có)
  trackingNumber?: string; // Mã vận đơn
  shippingCarrier?: string; // Đơn vị vận chuyển
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string; // Thời gian xác nhận
  processingAt?: string; // Thời gian bắt đầu xử lý
  shippedAt?: string; // Thời gian giao hàng
  deliveredAt?: string; // Thời gian nhận hàng thành công
  completedAt?: string; // Thời gian hoàn thành (sau khi hết hạn đổi trả?)
  cancelledAt?: string; // Thời gian hủy
}

// DTO cho tạo đơn hàng (POST /orders)
export interface CreateOrderRequest {
  // Frontend cần gửi lên những gì?
  items: Array<{ // Chỉ cần productId và quantity? Hay cả price?
    productId: number;
    quantity: number;
    // price?: number; // Backend nên tự lấy giá mới nhất
  }>;
  // Địa chỉ nên là object để backend dễ xử lý
  shippingAddress: ShippingAddressDto;
  paymentMethod: 'COD' | 'PAYOS'; // Chỉ cho phép các phương thức hợp lệ khi tạo?
  notes?: string;
  voucherCode?: string; // Nếu có áp dụng voucher
}

// DTO cho cập nhật trạng thái đơn hàng (PUT /orders/{id}/status, ...)
export interface UpdateOrderStatusRequest {
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'; // Các trạng thái admin/seller có thể cập nhật
  trackingNumber?: string; // Cập nhật khi chuyển sang SHIPPING
  shippingCarrier?: string; // Cập nhật khi chuyển sang SHIPPING
  cancellationReason?: string; // Khi chuyển sang CANCELLED
  notes?: string; // Ghi chú nội bộ
}

// DTO cho thống kê đơn hàng (GET /orders/admin/stats, /orders/seller/stats)
export interface OrderStatisticsDto {
  totalOrders?: number;
  pendingOrders?: number; // Các trạng thái nào được tính là pending?
  processingOrders?: number;
  shippingOrders?: number; // Trạng thái shipping
  deliveredOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  totalRevenue?: number; // Doanh thu từ đơn hàng đã completed?
  avgOrderValue?: number;
  // Thêm các trường khác nếu có
}

// DTO cho lấy đơn hàng theo khoảng ngày
export interface DateRangeParams {
  startDate: string; // Format 'YYYY-MM-DD'
  endDate: string; // Format 'YYYY-MM-DD'
}

// DTO cho Dashboard Data (GET /orders/admin/dashboard, /orders/seller/dashboard)
// Cấu trúc rất tùy thuộc vào backend trả về những gì
export interface DashboardDataDto {
  totalRevenue?: number;
  totalOrders?: number;
  newCustomers?: number;
  pendingOrders?: number;
  recentOrders?: OrderDto[]; // Danh sách đơn hàng gần đây
  revenueChartData?: { date: string; revenue: number }[]; // Dữ liệu biểu đồ doanh thu
  orderStatusDistribution?: Record<string, number>; // Phân phối trạng thái đơn hàng
  // ... các dữ liệu khác cho dashboard
} 