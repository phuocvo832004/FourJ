import { useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { addItem, removeItem, updateQuantity, clearCart, toggleCart, setCartItems } from '../store/cartSlice';
import { CartItem } from '../types';
import { useAuth } from '../auth/auth-hooks';
import apiClient from '../api/apiClient';

export interface CartDto {
  id?: string;
  userId?: string;
  items: CartItem[];
  totalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { items, isOpen } = useAppSelector((state) => state.cart);
  const auth = useAuth();

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const getToken = useCallback(async () => {
    if (!auth.isAuthenticated) return null;
    try {
      return await auth.getToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }, [auth]);

  // Phương thức mới để lấy giỏ hàng từ API
  const fetchCart = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return null;

      const response = await apiClient.get('/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const cartData = response.data;
      // Cập nhật state Redux từ API
      dispatch(setCartItems(cartData.items || []));
      return cartData;
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      return null;
    }
  }, [dispatch, getToken]);

  const addToCart = useCallback(async (item: CartItem) => {
    try {
      const token = await getToken();
      if (!token) {
        // Nếu không có token, chỉ cập nhật state cục bộ
        dispatch(addItem(item));
        return;
      }

      const response = await apiClient.post('/cart/items', {
        productId: parseInt(item.id, 10),
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedCart = response.data;
      // Cập nhật state Redux từ API response
      dispatch(setCartItems(updatedCart.items || []));
      return updatedCart;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // Fallback: cập nhật state cục bộ
      dispatch(addItem(item));
    }
  }, [dispatch, getToken]);

  const removeFromCart = useCallback(async (id: string) => {
    try {
      const token = await getToken();
      if (!token) {
        // Nếu không có token, chỉ cập nhật state cục bộ
        dispatch(removeItem(id));
        return;
      }

      const response = await apiClient.delete(`/cart/items/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedCart = response.data;
      // Cập nhật state Redux từ API response
      dispatch(setCartItems(updatedCart.items || []));
      return updatedCart;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      // Fallback: cập nhật state cục bộ
      dispatch(removeItem(id));
    }
  }, [dispatch, getToken]);

  const updateItemQuantity = useCallback(async (id: string, quantity: number) => {
    try {
      const token = await getToken();
      if (!token) {
        // Nếu không có token, chỉ cập nhật state cục bộ
        dispatch(updateQuantity({ id, quantity }));
        return;
      }

      const response = await apiClient.put(`/cart/items/${id}`, { quantity }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedCart = response.data;
      // Cập nhật state Redux từ API response
      dispatch(setCartItems(updatedCart.items || []));
      return updatedCart;
    } catch (error) {
      console.error('Failed to update item quantity:', error);
      // Fallback: cập nhật state cục bộ
      dispatch(updateQuantity({ id, quantity }));
    }
  }, [dispatch, getToken]);

  const clearCartItems = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        // Nếu không có token, chỉ cập nhật state cục bộ
        dispatch(clearCart());
        return;
      }

      await apiClient.delete('/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Xóa items trong state Redux
      dispatch(clearCart());
    } catch (error) {
      console.error('Failed to clear cart:', error);
      // Fallback: cập nhật state cục bộ
      dispatch(clearCart());
    }
  }, [dispatch, getToken]);

  const toggleCartVisibility = () => {
    dispatch(toggleCart());
  };

  const restoreCart = useCallback(async (cartData: CartDto) => {
    try {
      const token = await getToken();
      if (!token) return;

      await apiClient.post('/cart/restore', cartData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Sau khi khôi phục, cập nhật lại giỏ hàng
      await fetchCart();
    } catch (error) {
      console.error('Failed to restore cart:', error);
    }
  }, [fetchCart, getToken]);

  return {
    items,
    isOpen,
    total,
    itemCount,
    addItem: addToCart,
    removeItem: removeFromCart,
    updateQuantity: updateItemQuantity,
    clearCart: clearCartItems,
    toggleCart: toggleCartVisibility,
    fetchCart,
    restoreCart,
  };
}; 