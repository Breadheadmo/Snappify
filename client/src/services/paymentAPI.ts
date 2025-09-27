import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const CURRENCY = process.env.REACT_APP_CURRENCY || 'ZAR';
const CURRENCY_SYMBOL = process.env.REACT_APP_CURRENCY_SYMBOL || 'R';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details
    console.log(`Payment API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error: any) => {
    console.error('Payment API Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Payment API Response: ${response.status} ${response.config.url}`, {
      data: response.data,
      status: response.status
    });
    return response;
  },
  (error) => {
    console.error('Payment API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
      url: error.config?.url
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface PaymentInitializeData {
  orderId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface PaymentInitializeResponse {
  success: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    payment_id: string;
  };
}

export interface PaymentVerifyData {
  reference: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  data: {
    payment: {
      id: string;
      reference: string;
      status: string;
      amount: string;
      method: string;
      date: string;
    };
    order: {
      id: string;
      isPaid: boolean;
      status: string;
    };
    transaction: {
      id: string;
      status: string;
      gateway_response: string;
      channel: string;
      fees: number;
    };
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: Array<{
    id: string;
    reference: string;
    amount: string;
    status: string;
    method: string;
    date: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaymentDetailsResponse {
  success: boolean;
  data: any;
}

export interface RefundData {
  reason?: string;
  amount?: number;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  data: any;
}

// Utility functions
export const formatAmount = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
};

export const formatCurrency = (amount: number, currency: string = CURRENCY): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const convertToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

export const convertFromCents = (amount: number): number => {
  return amount / 100;
};

// Payment API functions
export const paymentAPI = {
  // Initialize payment transaction
  initializePayment: async (data: PaymentInitializeData): Promise<PaymentInitializeResponse> => {
    console.log('=== PaymentAPI: initializePayment ===');
    console.log('Request data:', data);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Full URL:', `${API_BASE_URL}/payments/initialize`);
    
    try {
      // Validate required data
      if (!data.orderId) {
        throw new Error('Order ID is required');
      }

      const response = await api.post('/payments/initialize', data);
      console.log('PaymentAPI: Success response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment initialization failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('PaymentAPI: Error occurred:', error);
      console.error('PaymentAPI: Error response:', error.response);
      console.error('PaymentAPI: Error config:', error.config);
      
      // Extract meaningful error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Payment initialization failed';
      
      throw new Error(errorMessage);
    }
  },

  // Verify payment transaction
  verifyPayment: async (data: PaymentVerifyData): Promise<PaymentVerifyResponse> => {
    console.log('=== PaymentAPI: verifyPayment ===');
    console.log('Request data:', data);

    try {
      if (!data.reference) {
        throw new Error('Payment reference is required');
      }

      const response = await api.post('/payments/verify', data);
      console.log('PaymentAPI: Verification success:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment verification failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('PaymentAPI: Verification error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Payment verification failed';
      
      throw new Error(errorMessage);
    }
  },

  // Get payment history for current user
  getPaymentHistory: async (page: number = 1, limit: number = 10): Promise<PaymentHistoryResponse> => {
    console.log('=== PaymentAPI: getPaymentHistory ===');
    console.log('Request params:', { page, limit });

    try {
      const response = await api.get(`/payments/history?page=${page}&limit=${limit}`);
      console.log('PaymentAPI: History success:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load payment history');
      }

      return response.data;
    } catch (error: any) {
      console.error('PaymentAPI: History error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to load payment history';
      
      throw new Error(errorMessage);
    }
  },

  // Get payment details by ID
  getPaymentById: async (paymentId: string): Promise<PaymentDetailsResponse> => {
    console.log('=== PaymentAPI: getPaymentById ===');
    console.log('Payment ID:', paymentId);

    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const response = await api.get(`/payments/${paymentId}`);
      console.log('PaymentAPI: Payment details success:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load payment details');
      }

      return response.data;
    } catch (error: any) {
      console.error('PaymentAPI: Payment details error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to load payment details';
      
      throw new Error(errorMessage);
    }
  },

  // Refund payment (Admin only)
  refundPayment: async (paymentId: string, data: RefundData): Promise<RefundResponse> => {
    console.log('=== PaymentAPI: refundPayment ===');
    console.log('Payment ID:', paymentId, 'Data:', data);

    try {
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      const response = await api.post(`/payments/${paymentId}/refund`, data);
      console.log('PaymentAPI: Refund success:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Payment refund failed');
      }

      return response.data;
    } catch (error: any) {
      console.error('PaymentAPI: Refund error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Payment refund failed';
      
      throw new Error(errorMessage);
    }
  },

  // Retry failed payment
  retryPayment: async (orderId: string): Promise<PaymentInitializeResponse> => {
    console.log('=== PaymentAPI: retryPayment ===');
    console.log('Order ID:', orderId);
    
    // Retry payment is essentially the same as initializing a new payment
    return await paymentAPI.initializePayment({ orderId });
  },

  // Get payment status
  getPaymentStatus: async (reference: string): Promise<PaymentVerifyResponse> => {
    console.log('=== PaymentAPI: getPaymentStatus ===');
    console.log('Reference:', reference);
    
    // Getting payment status is the same as verifying payment
    return await paymentAPI.verifyPayment({ reference });
  },
};

export default paymentAPI;
