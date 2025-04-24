import apiClient from './apiClient';
import { CartItem } from '../types';

// Interface định nghĩa cấu trúc dữ liệu giỏ hàng
export interface CartDto {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa các endpoint cart
const cartEndpoints = {
  getCart: '/carts',
  addItem: '/carts/items',
  updateItem: (itemId: string) => `/carts/items/${itemId}`,
  removeItem: (itemId: string) => `/carts/items/${itemId}`,
  clearCart: '/carts',
  restoreCart: '/carts/restore'
};

// API cart functions
const cartApi = {
  // Lấy giỏ hàng hiện tại
  getCart: async () => {
    const timestamp = new Date().getTime(); // Thêm timestamp để tránh cache
    return apiClient.get<CartDto>(`${cartEndpoints.getCart}?t=${timestamp}`);
  },

  // Thêm sản phẩm vào giỏ hàng
  addItem: async (item: CartItem) => {
    return apiClient.post<CartDto>(cartEndpoints.addItem, {
      productId: item.productId,
      quantity: item.quantity
    });
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateItemQuantity: async (itemId: string, quantity: number) => {
    return apiClient.put<CartDto>(cartEndpoints.updateItem(itemId), { quantity });
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeItem: async (itemId: string) => {
    return apiClient.delete<CartDto>(cartEndpoints.removeItem(itemId));
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    return apiClient.delete<void>(cartEndpoints.clearCart);
  },

  // Khôi phục giỏ hàng
  restoreCart: async (cartData: CartDto) => {
    return apiClient.post<CartDto>(cartEndpoints.restoreCart, cartData);
  }
};

export default cartApi; 