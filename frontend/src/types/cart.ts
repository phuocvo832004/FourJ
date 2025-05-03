// src/types/cart.ts

// DTO cho một item trong giỏ hàng (trong CartDto trả về)
export interface CartItemDto {
  id: string; // ID của cart item (khác product ID)
  productId: number;
  productName: string;
  price: number; // Giá tại thời điểm thêm vào giỏ? Hay giá hiện tại?
  quantity: number;
  imageUrl?: string;
  // Có thể có thêm các thông tin khác của sản phẩm nếu cần hiển thị
}

// DTO cho giỏ hàng (GET /api/carts)
export interface CartDto {
  id: string; // ID của giỏ hàng
  userId?: string; // ID của user (nếu đã đăng nhập)
  items: CartItemDto[];
  totalItems?: number; // Tổng số lượng sản phẩm (tính cả quantity)
  subtotal?: number; // Tổng giá trị các sản phẩm
  createdAt?: string;
  updatedAt?: string;
  // Có thể có thông tin về voucher đang áp dụng tạm thời?
}

// DTO để thêm item vào giỏ hàng (POST /api/carts/items)
export interface AddCartItemRequest {
  productId: number;
  quantity: number;
  // Có cần gửi thêm thông tin gì khác không?
}

// DTO để cập nhật item trong giỏ hàng (PUT /api/carts/items/{itemId})
export interface UpdateCartItemRequest {
  quantity: number;
} 