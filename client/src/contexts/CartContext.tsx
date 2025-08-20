import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import type { Product, CartItem } from '../types/Product';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean };

const CartContext = createContext<{
  state: CartState;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
  refreshCart: () => Promise<void>;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.payload.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + (action.quantity || 1);
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: newQuantity }
            : item
        );
        
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        };
      } else {
        const newItem: CartItem = {
          product: action.payload,
          quantity: action.quantity || 1
        };
        
        const newItems = [...state.items, newItem];
        
        return {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0)
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.product.id !== Number(action.payload));
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.product.id === Number(action.payload.productId)
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };
    }
    
    case 'LOAD_CART': {
      const items = action.payload;
      
      return {
        ...state,
        items,
        total: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        loading: false
      };
    }
    
    case 'SET_LOADING': {
      return {
        ...state,
        loading: action.payload
      };
    }
    
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: true
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Convert API cart format to our frontend format
  const formatCartItems = (apiItems: any[]): CartItem[] => {
    return apiItems.map(item => ({
      product: {
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        inStock: item.inStock,
        countInStock: item.countInStock,
        // Add required properties to avoid TypeScript errors
        rating: 0,
        reviews: 0,
        category: '',
        brand: '',
        description: '',
        features: [],
        specifications: {},
        tags: [],
        weight: '',
        dimensions: '',
        warranty: '',
        returnPolicy: '',
        shippingInfo: ''
      },
      quantity: item.quantity
    }));
  };

  // Load cart from API or localStorage
  const loadCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (isAuthenticated) {
        // Fetch cart from API if user is authenticated
        const cartData = await cartApi.getCart();
        const formattedItems = formatCartItems(cartData.items);
        dispatch({ type: 'LOAD_CART', payload: formattedItems });
      } else {
        // Use localStorage for guest users
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            dispatch({ type: 'LOAD_CART', payload: parsedCart });
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            dispatch({ type: 'LOAD_CART', payload: [] });
          }
        } else {
          dispatch({ type: 'LOAD_CART', payload: [] });
        }
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  };

  // Load cart on mount and when auth state changes
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated && !state.loading) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items, isAuthenticated, state.loading]);

  // Function to refresh the cart (e.g., after login/logout)
  const refreshCart = async () => {
    await loadCart();
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    // Optimistically update the UI
    dispatch({ type: 'ADD_ITEM', payload: product, quantity });
    
    try {
      if (isAuthenticated) {
        // Call API to add to cart if user is authenticated
        const response = await cartApi.addToCart(product.id.toString(), quantity);
        console.log('Cart response:', response);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Reload cart to get correct state in case of error
      await loadCart();
    }
  };

  const removeFromCart = async (productId: string) => {
    // Optimistically update the UI
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    
    try {
      if (isAuthenticated) {
        // Call API to remove from cart if user is authenticated
        await cartApi.removeFromCart(productId);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Reload cart to get correct state in case of error
      await loadCart();
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    // Optimistically update the UI
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    
    try {
      if (isAuthenticated) {
        // Call API to update cart if user is authenticated
        await cartApi.updateCartItem(productId, quantity);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      // Reload cart to get correct state in case of error
      await loadCart();
    }
  };

  const clearCart = async () => {
    // Optimistically update the UI
    dispatch({ type: 'CLEAR_CART' });
    
    try {
      if (isAuthenticated) {
        // Call API to clear cart if user is authenticated
        await cartApi.clearCart();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Reload cart to get correct state in case of error
      await loadCart();
    }
  };

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.product.id === Number(productId));
  };

  const getCartItem = (productId: string): CartItem | undefined => {
    return state.items.find(item => item.product.id === Number(productId));
  };

  const value = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
