// ...existing code...
import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
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

const LOCAL_KEY = 'cart'; // keep same key used elsewhere

const CartContext = createContext<{
  state: CartState;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
  refreshCart: () => Promise<void>;
  mergeLocalCartToServer: (options?: { apiUrl?: string; token?: string }) => Promise<void>;
  setCartFromServer: (items: CartItem[]) => void;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  console.log('🔄 Cart reducer action:', action.type, action);

  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.payload.id);
      console.log('🔍 Existing item found:', !!existingItem);

      if (existingItem) {
        const newQuantity = existingItem.quantity + (action.quantity || 1);
        console.log(`📈 Updating quantity from ${existingItem.quantity} to ${newQuantity}`);

        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: newQuantity }
            : item
        );

        const newTotal = updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

        console.log(`📊 Updated totals: ${newItemCount} items, $${newTotal.toFixed(2)}`);

        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount
        };
      } else {
        const newItem: CartItem = {
          product: action.payload,
          quantity: action.quantity || 1
        };

        console.log(`➕ Adding new item: ${newItem.product.name} (qty: ${newItem.quantity})`);

        const newItems = [...state.items, newItem];
        const newTotal = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        console.log(`📊 New totals: ${newItemCount} items, $${newTotal.toFixed(2)}`);

        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount
        };
      }
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.product.id.toString() !== action.payload.toString());

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.product.id.toString() === action.payload.productId.toString()
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
    console.log('🔄 Loading cart...');
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      if (isAuthenticated) {
        // Fetch cart from API if user is authenticated
        console.log('📡 Loading cart from API for authenticated user');
        const cartData = await cartApi.getCart();
        console.log('📦 Cart data from API:', cartData);
        const formattedItems = formatCartItems(cartData.items);
        console.log('✅ Formatted cart items:', formattedItems);
        dispatch({ type: 'LOAD_CART', payload: formattedItems });
      } else {
        // Use localStorage for guest users
        console.log('💾 Loading cart from localStorage for guest user');
        const savedCart = localStorage.getItem(LOCAL_KEY);
        console.log('📥 Raw localStorage cart:', savedCart);
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            console.log('✅ Parsed cart from localStorage:', parsedCart);
            dispatch({ type: 'LOAD_CART', payload: parsedCart });
          } catch (error) {
            console.error('❌ Error parsing cart from localStorage:', error);
            dispatch({ type: 'LOAD_CART', payload: [] });
          }
        } else {
          console.log('📭 No cart found in localStorage');
          dispatch({ type: 'LOAD_CART', payload: [] });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching cart data:', error);
      // For unauthenticated users, fall back to localStorage
      if (!isAuthenticated) {
        try {
          const savedCart = localStorage.getItem(LOCAL_KEY);
          const parsedCart = savedCart ? JSON.parse(savedCart) : [];
          console.log('🔄 Fallback to localStorage:', parsedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } catch (e) {
          console.log('🔄 Fallback to empty cart');
          dispatch({ type: 'LOAD_CART', payload: [] });
        }
      } else {
        console.log('🔄 Error loading authenticated cart, using empty cart');
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    }
  };

  // Load cart on mount and when auth state changes
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Save cart to localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated && !state.loading) {
      console.log('💾 Saving cart to localStorage for guest user:', state.items);
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(state.items));
        console.log('✅ Cart saved to localStorage');
      } catch (err) {
        console.error('❌ Failed to save cart to localStorage', err);
      }
    }
  }, [state.items, isAuthenticated, state.loading]);

  // Function to refresh the cart (e.g., after login/logout)
  const refreshCart = async () => {
    await loadCart();
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      console.log(`🛒 Adding ${quantity} of product "${product.name}" (ID: ${product.id}) to cart`);
      console.log('🔐 Authenticated:', isAuthenticated);

      if (isAuthenticated) {
        // For authenticated users, call API first, then update UI based on response
        console.log(`📡 Calling API to add product ${product.id} to cart`);
        const response = await cartApi.addToCart(product.id.toString(), quantity);
        console.log('✅ Cart API response:', response);

        // Refresh cart from server to get the correct state
        await loadCart();
      } else {
        // For guest users, update local state immediately
        console.log('👤 Guest user - updating local cart state');
        dispatch({ type: 'ADD_ITEM', payload: product, quantity });
        console.log('✅ Local cart updated for guest user');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);

      // If there's an error and user is authenticated, reload cart from server
      if (isAuthenticated) {
        console.log('🔄 Reloading cart from server due to error');
        await loadCart();
      } else {
        // For guest users, still try to add to local state as fallback
        console.log('🔄 Fallback: Adding to local state for guest user');
        dispatch({ type: 'ADD_ITEM', payload: product, quantity });
      }

      // Don't re-throw the error for guest users, only for authenticated users
      if (isAuthenticated) {
        throw error;
      }
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
      // clear local storage as well
      try { localStorage.removeItem(LOCAL_KEY); } catch {}
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Reload cart to get correct state in case of error
      await loadCart();
    }
  };

  const mergeLocalCartToServer = useCallback(async (options?: { apiUrl?: string; token?: string }) => {
    // Read local cart (items format: CartItem[])
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return;
    let localItems: CartItem[];
    try {
      localItems = JSON.parse(raw) as CartItem[];
    } catch (err) {
      console.error('❌ Failed parsing local cart for merge:', err);
      return;
    }
    if (!localItems || localItems.length === 0) return;

    // Try cartApi.mergeCart if available
    try {
      if (cartApi && typeof (cartApi as any).mergeCart === 'function') {
        const merged = await (cartApi as any).mergeCart(localItems);
        console.log('📦 Merged cart response from API:', merged);
        // If server returns cart items, load them
        if (merged && Array.isArray(merged.items)) {
          const formatted = formatCartItems(merged.items);
          dispatch({ type: 'LOAD_CART', payload: formatted });
          try { localStorage.removeItem(LOCAL_KEY); } catch {}
        } else {
          // refresh from server
          await loadCart();
          try { localStorage.removeItem(LOCAL_KEY); } catch {}
        }
        return;
      }

      // Fallback: call /cart/merge endpoint directly if REACT_APP_API_URL provided
      const apiUrl = options?.apiUrl ?? process.env.REACT_APP_API_URL;
      if (!apiUrl) return;
      const resp = await fetch(`${apiUrl.replace(/\/$/, '')}/cart/merge`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
        },
        body: JSON.stringify({ items: localItems.map(it => ({ productId: it.product.id, quantity: it.quantity })) }),
      });
      if (!resp.ok) {
        console.warn('⚠️ Merge request failed:', resp.status);
        return;
      }
      const result = await resp.json();
      if (result && Array.isArray(result.items)) {
        const formatted = formatCartItems(result.items);
        dispatch({ type: 'LOAD_CART', payload: formatted });
        try { localStorage.removeItem(LOCAL_KEY); } catch {}
      } else {
        await loadCart();
        try { localStorage.removeItem(LOCAL_KEY); } catch {}
      }
    } catch (err) {
      console.error('❌ Error merging local cart to server:', err);
    }
  }, [loadCart]);

  const setCartFromServer = useCallback((items: CartItem[]) => {
    dispatch({ type: 'LOAD_CART', payload: items });
    try { localStorage.removeItem(LOCAL_KEY); } catch {}
  }, []);

  const isInCart = (productId: string): boolean => {
    return state.items.some(item => item.product.id.toString() === productId.toString());
  };

  const getCartItem = (productId: string): CartItem | undefined => {
    return state.items.find(item => item.product.id.toString() === productId.toString());
  };

  const value = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem,
    refreshCart,
    mergeLocalCartToServer,
    setCartFromServer
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