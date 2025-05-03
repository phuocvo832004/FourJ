import { useMemo, useCallback, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { toggleCart, setCartItems } from '../store/cartSlice';
import { CartItem } from '../types';
import { useAuth } from '../auth/auth-hooks';
import cartApi, { CartDto } from '../api/cartApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartMutation, CART_QUERY_KEYS } from './useCartMutation';
import useDebounce from './useDebounce';

export type { CartDto };

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.cart);
  const localItems = useAppSelector((state) => state.cart.items);
  const { isAuthenticated, getToken } = useAuth();
  const queryClient = useQueryClient();
  const { 
    updateQuantityMutation, 
    addItemMutation, 
    removeItemMutation, 
    clearCartMutation 
  } = useCartMutation();

  const [pendingQuantityUpdates, setPendingQuantityUpdates] = useState<Record<string, number>>({});
  const debouncedQuantityUpdates = useDebounce(pendingQuantityUpdates, 500);

  const CART_CACHE_TIME = 30000; // 30 giây

  useEffect(() => {
    const performUpdates = async () => {
      const keys = Object.keys(debouncedQuantityUpdates);
      if (keys.length === 0) return;

      const updatesToProcess = { ...debouncedQuantityUpdates };
      setPendingQuantityUpdates({});

      for (const id of keys) {
        const quantity = updatesToProcess[id];
        if (isAuthenticated) {
          updateQuantityMutation.mutate({ itemId: id, quantity });
        }
      }
    };

    performUpdates();
  }, [debouncedQuantityUpdates, isAuthenticated, updateQuantityMutation]);

  const { data: cartData, refetch: refetchCart, isLoading: isCartLoading } = useQuery({
    queryKey: [CART_QUERY_KEYS.cart, isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) {
        console.log('User not authenticated, returning empty cart for query');
        return { id: '', userId: '', items: [], createdAt: '', updatedAt: '' } as CartDto;
      }

      const token = await getToken();
      if (!token) {
        console.log('No auth token, returning empty cart for query');
        return { id: '', userId: '', items: [], createdAt: '', updatedAt: '' } as CartDto;
      }

      try {
        const response = await cartApi.getCart();
        const fetchedCartData = response.data;
        
        const itemsWithIds = (fetchedCartData.items || []).map((item: CartItem) => ({
          ...item,
          cartItemId: String(item.cartItemId || item.id), 
        }));
        
        return {
          ...fetchedCartData,
          items: itemsWithIds
        } as CartDto;
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        return { id: '', userId: '', items: [], createdAt: '', updatedAt: '' } as CartDto;
      }
    },
    staleTime: CART_CACHE_TIME,
    enabled: true,
    placeholderData: { id: '', userId: '', items: localItems, createdAt: '', updatedAt: '' } as CartDto,
  });

  const addToCart = useCallback((item: CartItem) => {
    if (!isAuthenticated) {
      console.warn("Add to cart called when not authenticated. Cart might not be saved.");
      return;
    }
    
    addItemMutation.mutate(item);

  }, [isAuthenticated, addItemMutation]);

  const removeFromCart = useCallback((cartItemId: string) => {
    if (!isAuthenticated) {
      console.warn("Remove from cart called when not authenticated.");
      return;
    }
    
    if (!cartItemId) {
      console.error('Cannot remove item without a cartItemId');
      return;
    }
    
    removeItemMutation.mutate(cartItemId);

  }, [isAuthenticated, removeItemMutation]);

  const updateCartItemQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (!isAuthenticated) {
       console.warn("Update quantity called when not authenticated.");
       return;
    }
    
    if (!cartItemId) {
      console.error('Cannot update item quantity without a cartItemId');
      return;
    }

    queryClient.setQueryData<CartDto | undefined>([CART_QUERY_KEYS.cart, isAuthenticated], (oldData) => {
      if (!oldData || !oldData.items) return oldData;
      return {
        ...oldData,
        items: oldData.items.map(item => 
          item.cartItemId === cartItemId ? { ...item, quantity } : item
        )
      };
    });

    setPendingQuantityUpdates(prev => ({
      ...prev,
      [cartItemId]: quantity
    }));

  }, [isAuthenticated, queryClient]);

  const clearCartItems = useCallback(() => {
    if (!isAuthenticated) {
      console.warn("Clear cart called when not authenticated.");
      return;
    }
    
    clearCartMutation.mutate();

  }, [isAuthenticated, clearCartMutation]);

  const toggleCartVisibility = () => {
    dispatch(toggleCart());
  };

  const restoreCart = useCallback(async (cartToRestore: CartDto) => {
    if (!isAuthenticated) {
       console.warn("Restore cart called when not authenticated.");
       dispatch(setCartItems(cartToRestore.items || []));
       return;
    }
    try {
      await cartApi.restoreCart(cartToRestore);
      await queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEYS.cart, isAuthenticated] });
    } catch (error) {
      console.error('Failed to restore cart:', error);
    }
  }, [isAuthenticated, queryClient, dispatch]);

  const derivedItems = useMemo(() => 
    (isAuthenticated ? cartData?.items : localItems) ?? [],
    [isAuthenticated, cartData?.items, localItems]
  );

  const total = useMemo(() => {
    return derivedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [derivedItems]);

  const itemCount = useMemo(() => {
    return derivedItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [derivedItems]);

  return {
    items: derivedItems,
    isOpen,
    total,
    itemCount,
    isLoading: isCartLoading,
    addItem: addToCart,
    removeItem: removeFromCart,
    updateQuantity: updateCartItemQuantity,
    clearCart: clearCartItems,
    toggleCart: toggleCartVisibility,
    fetchCart: refetchCart,
    restoreCart,
  };
};

export default useCart; 