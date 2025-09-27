import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  paymentAPI,
  PaymentInitializeData,
  PaymentVerifyData,
  PaymentInitializeResponse,
  PaymentVerifyResponse,
  PaymentHistoryResponse,
  formatAmount,
  convertFromCents,
} from '../services/paymentAPI';

interface PaymentState {
  isInitializing: boolean;
  isVerifying: boolean;
  isLoadingHistory: boolean;
  currentPayment: any | null;
  paymentHistory: any[];
  error: string | null;
  lastPaymentReference: string | null;
  paymentAttempts: number;
  maxAttempts: number;
}

interface PaymentContextType extends PaymentState {
  initializePayment: (data: PaymentInitializeData) => Promise<any>;
  verifyPayment: (reference: string) => Promise<any>;
  loadPaymentHistory: (page?: number, limit?: number) => Promise<void>;
  retryPayment: (orderId: string) => Promise<any>;
  getPaymentStatus: (reference: string) => Promise<any>;
  clearPaymentError: () => void;
  clearCurrentPayment: () => void;
  resetPaymentAttempts: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [state, setState] = useState<PaymentState>({
    isInitializing: false,
    isVerifying: false,
    isLoadingHistory: false,
    currentPayment: null,
    paymentHistory: [],
    error: null,
    lastPaymentReference: null,
    paymentAttempts: 0,
    maxAttempts: 3,
  });

  // Initialize payment transaction
  const initializePayment = useCallback(async (data: PaymentInitializeData) => {
    console.log('=== PaymentContext: initializePayment ===');
    console.log('Data:', data);
    
    setState(prev => ({ 
      ...prev, 
      isInitializing: true, 
      error: null,
      paymentAttempts: prev.paymentAttempts + 1
    }));

    try {
      // Check if max attempts reached
      if (state.paymentAttempts >= state.maxAttempts) {
        throw new Error('Maximum payment attempts reached. Please try again later.');
      }

      const response: PaymentInitializeResponse = await paymentAPI.initializePayment(data);
      
      console.log('PaymentContext: Initialization successful:', response);

      setState(prev => ({
        ...prev,
        isInitializing: false,
        currentPayment: response.data,
        lastPaymentReference: response.data.reference,
        error: null,
      }));

      return response.data;
    } catch (error: any) {
      console.error('PaymentContext: Initialization failed:', error);
      const errorMessage = error.message || 'Payment initialization failed';
      
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  }, [state.paymentAttempts, state.maxAttempts]);

  // Verify payment transaction
  const verifyPayment = useCallback(async (reference: string) => {
    console.log('=== PaymentContext: verifyPayment ===');
    console.log('Reference:', reference);
    
    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const response: PaymentVerifyResponse = await paymentAPI.verifyPayment({ reference });
      
      console.log('PaymentContext: Verification successful:', response);

      setState(prev => ({
        ...prev,
        isVerifying: false,
        currentPayment: {
          ...prev.currentPayment,
          ...response.data.payment,
          verified: true,
          transaction: response.data.transaction,
          order: response.data.order,
        },
        error: null,
      }));

      return response.data;
    } catch (error: any) {
      console.error('PaymentContext: Verification failed:', error);
      const errorMessage = error.message || 'Payment verification failed';
      
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: errorMessage,
      }));
      
      throw error;
    }
  }, []);

  // Load payment history
  const loadPaymentHistory = useCallback(async (page: number = 1, limit: number = 10) => {
    console.log('=== PaymentContext: loadPaymentHistory ===');
    console.log('Page:', page, 'Limit:', limit);
    
    setState(prev => ({ ...prev, isLoadingHistory: true, error: null }));

    try {
      const response: PaymentHistoryResponse = await paymentAPI.getPaymentHistory(page, limit);
      
      console.log('PaymentContext: History loaded:', response);

      setState(prev => ({
        ...prev,
        isLoadingHistory: false,
        paymentHistory: response.data,
        error: null,
      }));
    } catch (error: any) {
      console.error('PaymentContext: History loading failed:', error);
      const errorMessage = error.message || 'Failed to load payment history';
      
      setState(prev => ({
        ...prev,
        isLoadingHistory: false,
        error: errorMessage,
      }));
    }
  }, []);

  // Retry payment
  const retryPayment = useCallback(async (orderId: string) => {
    console.log('=== PaymentContext: retryPayment ===');
    console.log('Order ID:', orderId);
    
    try {
      // Reset payment attempts for retry
      setState(prev => ({ ...prev, paymentAttempts: 0 }));
      
      return await initializePayment({ orderId });
    } catch (error: any) {
      console.error('PaymentContext: Retry failed:', error);
      throw error;
    }
  }, [initializePayment]);

  // Get payment status
  const getPaymentStatus = useCallback(async (reference: string) => {
    console.log('=== PaymentContext: getPaymentStatus ===');
    console.log('Reference:', reference);
    
    try {
      return await paymentAPI.getPaymentStatus(reference);
    } catch (error: any) {
      console.error('PaymentContext: Status check failed:', error);
      throw error;
    }
  }, []);

  // Clear payment error
  const clearPaymentError = useCallback(() => {
    console.log('PaymentContext: Clearing payment error');
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear current payment
  const clearCurrentPayment = useCallback(() => {
    console.log('PaymentContext: Clearing current payment');
    setState(prev => ({ 
      ...prev, 
      currentPayment: null, 
      lastPaymentReference: null,
      error: null 
    }));
  }, []);

  // Reset payment attempts
  const resetPaymentAttempts = useCallback(() => {
    console.log('PaymentContext: Resetting payment attempts');
    setState(prev => ({ ...prev, paymentAttempts: 0 }));
  }, []);

  // Auto-clear errors after 30 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        clearPaymentError();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [state.error, clearPaymentError]);

  // Auto-reload payment history on mount
  useEffect(() => {
    loadPaymentHistory();
  }, [loadPaymentHistory]);

  const contextValue: PaymentContextType = {
    ...state,
    initializePayment,
    verifyPayment,
    loadPaymentHistory,
    retryPayment,
    getPaymentStatus,
    clearPaymentError,
    clearCurrentPayment,
    resetPaymentAttempts,
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook to use payment context
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// Export payment utilities for use in components
export const PaymentUtils = {
  formatAmount,
  convertFromCents,
  
  // Get status color for UI
  getStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'green';
      case 'pending':
      case 'processing':
        return 'yellow';
      case 'failed':
      case 'cancelled':
        return 'red';
      case 'abandoned':
        return 'gray';
      default:
        return 'gray';
    }
  },
  
  // Get status text for UI
  getStatusText: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'abandoned':
        return 'Abandoned';
      default:
        return 'Unknown';
    }
  },
  
  // Check if payment can be retried
  canRetryPayment: (status: string, attempts: number, maxAttempts: number): boolean => {
    const retryableStatuses = ['failed', 'abandoned', 'cancelled'];
    return retryableStatuses.includes(status.toLowerCase()) && attempts < maxAttempts;
  },
};

export default PaymentContext;
