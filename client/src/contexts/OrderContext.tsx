import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus } from '../types/Order';
import orderService from '../services/orderService';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  trackByNumber: (trackingNumber: string) => Promise<void>;
  createOrder: (orderData: any) => Promise<Order>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  clearError: () => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get auth context to check if user is logged in
  const { user, isAuthenticated } = useAuth();

  /**
   * Fetch all orders for the logged-in user
   */
  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await orderService.getMyOrders();
      setOrders(fetchedOrders);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch a single order by ID
   */
  const fetchOrderById = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const order = await orderService.getOrderById(orderId);
      setCurrentOrder(order);
    } catch (err: any) {
      setError(err.message);
      setCurrentOrder(null);
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Track order by tracking number (public)
   */
  const trackByNumber = async (trackingNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      const order = await orderService.trackByNumber(trackingNumber);
      setCurrentOrder(order);
    } catch (err: any) {
      setError(err.message);
      setCurrentOrder(null);
      console.error('Error tracking order:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new order
   */
  const createOrder = async (orderData: any): Promise<Order> => {
    try {
      setLoading(true);
      setError(null);
      const newOrder = await orderService.createOrder(orderData);
      
      // Add new order to orders list
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      setCurrentOrder(newOrder);
      
      return newOrder;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel an order
   */
  const cancelOrder = async (orderId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const cancelledOrder = await orderService.cancelOrder(orderId, reason);
      
      // Update orders list
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? cancelledOrder : order
        )
      );
      
      // Update current order if it's the one being cancelled
      if (currentOrder?.id === orderId) {
        setCurrentOrder(cancelledOrder);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh orders (force reload)
   */
  const refreshOrders = async () => {
    await fetchOrders();
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch orders when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]);
      setCurrentOrder(null);
    }
  }, [isAuthenticated]);

  const value: OrderContextType = {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    trackByNumber,
    createOrder,
    cancelOrder,
    clearError,
    refreshOrders
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

/**
 * Custom hook to use Order Context
 */
export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;