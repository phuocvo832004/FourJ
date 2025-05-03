import { useMutation, useQueryClient } from '@tanstack/react-query';
import cartApi, { CartDto } from '../api/cartApi';
import { CartItem } from '../types';

// Khóa query cho giỏ hàng
export const CART_QUERY_KEYS = {
  cart: 'cart',
  cartItems: 'cartItems',
};

/**
 * Hook cung cấp các mutations tối ưu cho giỏ hàng
 * Sử dụng optimistic updates để cập nhật UI ngay lập tức
 */
export const useCartMutation = () => {
  const queryClient = useQueryClient();

  // Mutation để cập nhật số lượng sản phẩm (với optimistic update)
  const updateQuantityMutation = useMutation({
    mutationFn: (params: { itemId: string, quantity: number }) => {
      return cartApi.updateItemQuantity(params.itemId, params.quantity);
    },
    // Xử lý optimistic update trước khi thực hiện API call
    onMutate: async (variables) => {
      // Hủy các queries đang chạy để tránh ghi đè dữ liệu
      await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEYS.cart] });
      
      // Lưu trữ state hiện tại để có thể rollback nếu có lỗi
      const previousCart = queryClient.getQueryData<CartDto>([CART_QUERY_KEYS.cart]);
      
      // Cập nhật cache UI ngay lập tức (optimistic update)
      queryClient.setQueryData<CartDto>([CART_QUERY_KEYS.cart], (oldData) => {
        // Đảm bảo có dữ liệu cũ
        if (!oldData || !oldData.items) return oldData;
        
        // Cập nhật số lượng trong items
        const updatedItems = oldData.items.map((item: CartItem) => {
          if (item.id === variables.itemId || item.cartItemId === variables.itemId) {
            return { ...item, quantity: variables.quantity };
          }
          return item;
        });
        
        return { ...oldData, items: updatedItems };
      });
      
      // Trả về trạng thái cũ để có thể rollback
      return { previousCart };
    },
    // Rollback nếu có lỗi xảy ra
    onError: (error, _variables, context) => {
      console.error('Error updating cart item quantity:', error);
      // Khôi phục trạng thái trước mutation
      if (context?.previousCart) {
        queryClient.setQueryData([CART_QUERY_KEYS.cart], context.previousCart);
      }
    },
    // Làm mới dữ liệu sau khi mutation hoàn thành
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEYS.cart] });
    },
  });

  // Mutation để thêm sản phẩm vào giỏ hàng
  const addItemMutation = useMutation({
    mutationFn: (item: CartItem) => {
      return cartApi.addItem(item);
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEYS.cart] });
      const previousCart = queryClient.getQueryData<CartDto>([CART_QUERY_KEYS.cart]);
      
      queryClient.setQueryData<CartDto>([CART_QUERY_KEYS.cart], (oldData) => {
        if (!oldData) return { items: [newItem] } as CartDto;
        
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = oldData.items?.findIndex((item: CartItem) => 
          item.productId === newItem.productId
        );
        
        const updatedItems = [...(oldData.items || [])];
        
        if (existingItemIndex >= 0) {
          // Nếu sản phẩm đã tồn tại, tăng số lượng
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
          };
        } else {
          // Nếu chưa có, thêm mới
          updatedItems.push(newItem);
        }
        
        return { ...oldData, items: updatedItems };
      });
      
      return { previousCart };
    },
    onError: (error, _variables, context) => {
      console.error('Error adding item to cart:', error);
      if (context?.previousCart) {
        queryClient.setQueryData([CART_QUERY_KEYS.cart], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEYS.cart] });
    },
  });

  // Mutation để xóa sản phẩm khỏi giỏ hàng
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => {
      return cartApi.removeItem(itemId);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEYS.cart] });
      const previousCart = queryClient.getQueryData<CartDto>([CART_QUERY_KEYS.cart]);
      
      queryClient.setQueryData<CartDto>([CART_QUERY_KEYS.cart], (oldData) => {
        if (!oldData || !oldData.items) return oldData;
        
        const updatedItems = oldData.items.filter((item: CartItem) => 
          item.id !== itemId
        );
        
        return { ...oldData, items: updatedItems };
      });
      
      return { previousCart };
    },
    onError: (error, _variables, context) => {
      console.error('Error removing item from cart:', error);
      if (context?.previousCart) {
        queryClient.setQueryData([CART_QUERY_KEYS.cart], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEYS.cart] });
    },
  });

  // Mutation để xóa toàn bộ giỏ hàng
  const clearCartMutation = useMutation({
    mutationFn: () => {
      return cartApi.clearCart();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [CART_QUERY_KEYS.cart] });
      const previousCart = queryClient.getQueryData<CartDto>([CART_QUERY_KEYS.cart]);
      
      queryClient.setQueryData<CartDto>([CART_QUERY_KEYS.cart], (oldData) => {
        return oldData ? { ...oldData, items: [] } : oldData;
      });
      
      return { previousCart };
    },
    onError: (error, _variables, context) => {
      console.error('Error clearing cart:', error);
      if (context?.previousCart) {
        queryClient.setQueryData([CART_QUERY_KEYS.cart], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEYS.cart] });
    },
  });

  return {
    updateQuantityMutation,
    addItemMutation,
    removeItemMutation,
    clearCartMutation,
  };
}; 