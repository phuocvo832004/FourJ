import { useMemo, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { addItem, removeItem, updateQuantity, clearCart, toggleCart, setCartItems } from '../store/cartSlice';
import { CartItem } from '../types';
import { useAuth } from '../auth/auth-hooks';
import cartApi, { CartDto } from '../api/cartApi';

export type { CartDto };

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { items, isOpen } = useAppSelector((state) => state.cart);
  const { isAuthenticated, getToken } = useAuth();

  // Cache để tránh fetch liên tục
  const cartFetchTimeRef = useRef<number | null>(null);
  const CART_CACHE_TIME = 30000; // 30 giây

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  /**
   * Lấy dữ liệu giỏ hàng từ server
   * @param options Tùy chọn fetch
   * @returns Promise với dữ liệu giỏ hàng
   */
  const fetchCart = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force || false;
    const now = Date.now();

    // Nếu không phải force fetch và đã fetch gần đây, sử dụng cache
    if (!force && cartFetchTimeRef.current && now - cartFetchTimeRef.current < CART_CACHE_TIME) {
      console.log('Returning cached cart data');
      return new Promise<{ items: CartItem[] }>(resolve => {
        resolve({ items });
      });
    }

    // User chưa đăng nhập, sử dụng cart trong local state
    if (!isAuthenticated) {
      console.log('User not authenticated, using local cart');
      return { items };
    }

    try {
      // Lấy token để xác thực
      const token = await getToken();
      
      if (!token) {
        console.log('No auth token, using local cart');
        return { items };
      }

      // Fetch giỏ hàng từ server
      const response = await cartApi.getCart();
      cartFetchTimeRef.current = Date.now();
      
      const cartData = response.data;
      // Đảm bảo mỗi item có cartItemId và id phù hợp
      const itemsWithIds = (cartData.items || []).map((item: CartItem & {id?: string}) => ({
        ...item,
        cartItemId: String(item.id),
      }));
      
      // Cập nhật state
      dispatch(setCartItems(itemsWithIds));
      
      return cartData;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Return local cart on error
      return { items };
    }
  }, [dispatch, isAuthenticated, getToken, items]);

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  const addToCart = useCallback(async (item: CartItem) => {
    // Dispatch action cho local state trước
    dispatch(addItem(item));
    
    // Nếu chưa đăng nhập, chỉ cập nhật local state
    if (!isAuthenticated) {
      return { items: [...items, item] };
    }
    
    try {
      // Gọi API để thêm vào giỏ hàng
      const response = await cartApi.addItem(item);
      
      // Cập nhật state với dữ liệu từ server
      const updatedCart = response.data;
      
      dispatch(setCartItems(updatedCart.items || []));
      
      // Refresh cart sau khi thêm sản phẩm
      fetchCart({ force: true }).catch(err => {
        console.error('Failed to refresh cart after adding item:', err);
      });
      
      return updatedCart;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      return { items };
    }
  }, [dispatch, isAuthenticated, items, fetchCart]);

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  const removeFromCart = useCallback(async (id: string) => {
    // Dispatch action cho local state trước
    dispatch(removeItem(id));
    
    // Nếu chưa đăng nhập, chỉ cập nhật local state
    if (!isAuthenticated) {
      return {
        items: items.filter(item => item.cartItemId !== id)
      };
    }
    
    try {
      // Tìm item trong state hiện tại
      const itemToRemove = items.find(item => item.cartItemId === id);
      
      if (!itemToRemove) {
        console.warn(`Item with id ${id} not found in cart`);
        return { items };
      }
      
      // Lấy id thực từ server
      const cartItemId = itemToRemove.id;
      
      const response = await cartApi.removeItem(cartItemId);
      
      // Cập nhật state với dữ liệu từ server
      const updatedCart = response.data;
      
      dispatch(setCartItems(updatedCart.items || []));
      return updatedCart;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      return { items: items.filter(item => item.cartItemId !== id) };
    }
  }, [dispatch, isAuthenticated, items]);

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  const updateCartItemQuantity = useCallback(async (id: string, quantity: number) => {
    // Dispatch action cho local state trước
    dispatch(updateQuantity({ id, quantity }));
    
    // Nếu chưa đăng nhập, chỉ cập nhật local state
    if (!isAuthenticated) {
      return {
        items: items.map(item => 
          item.cartItemId === id ? { ...item, quantity } : item
        )
      };
    }
    
    try {
      // Tìm item trong state hiện tại
      const itemToUpdate = items.find(item => item.cartItemId === id);
      
      if (!itemToUpdate) {
        console.warn(`Item with id ${id} not found in cart`);
        return { items };
      }
      
      // Lấy id thực từ server
      const cartItemId = itemToUpdate.id;
      
      const response = await cartApi.updateItemQuantity(cartItemId, quantity);
      
      // Cập nhật state với dữ liệu từ server
      const updatedCart = response.data;
      
      dispatch(setCartItems(updatedCart.items || []));
      return updatedCart;
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      return { items };
    }
  }, [dispatch, isAuthenticated, items]);

  /**
   * Xóa toàn bộ giỏ hàng
   */
  const clearCartItems = useCallback(async () => {
    // Dispatch action cho local state trước
    dispatch(clearCart());
    
    // Nếu chưa đăng nhập, chỉ cập nhật local state
    if (!isAuthenticated) {
      return;
    }
    
    try {
      await cartApi.clearCart();
      dispatch(clearCart());
    } catch (error) {
      console.error('Failed to clear cart:', error);
      // Reset local state dù có lỗi
      dispatch(clearCart());
    }
  }, [dispatch, isAuthenticated]);

  /**
   * Hiển thị/ẩn giỏ hàng
   */
  const toggleCartVisibility = () => {
    dispatch(toggleCart());
  };

  /**
   * Khôi phục giỏ hàng từ dữ liệu cũ
   */
  const restoreCart = useCallback(async (cartData: CartDto) => {
    try {
      // Gọi API để khôi phục giỏ hàng
      await cartApi.restoreCart(cartData);
      
      // Refresh cart sau khi khôi phục
      await fetchCart();
    } catch (error) {
      console.error('Failed to restore cart:', error);
    }
  }, [fetchCart]);

  return {
    items,
    isOpen,
    total,
    itemCount,
    addItem: addToCart,
    removeItem: removeFromCart,
    updateQuantity: updateCartItemQuantity,
    clearCart: clearCartItems,
    toggleCart: toggleCartVisibility,
    fetchCart,
    restoreCart,
  };
};

export default useCart; 