import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id || item.productId === action.payload.productId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ 
          ...action.payload, 
          quantity: action.payload.quantity || 1,
          cartItemId: action.payload.cartItemId || action.payload.id
        });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        item => !(item.id === action.payload || item.cartItemId === action.payload)
      );
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(
        item => item.id === action.payload.id || item.cartItemId === action.payload.id
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload.map(item => ({
        ...item,
        cartItemId: item.cartItemId || String(item.id)
      }));
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, toggleCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer; 