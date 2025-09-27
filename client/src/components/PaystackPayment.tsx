import React, { useState, useEffect, useCallback } from 'react';
import { PaystackButton } from 'react-paystack';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface PaystackPaymentProps {
  amount: number;
  orderId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  onSuccess: (response: any) => void;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  amount,
  orderId,
  email,
  firstName,
  lastName,
  phone,
  onSuccess,
  onClose,
  className = '',
  children,
}) => {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
  const currency = process.env.REACT_APP_PAYSTACK_CURRENCY || 'NGN'; // Use Paystack currency from env
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  // Initialize payment with backend
  const initializePayment = useCallback(async (paymentData: any) => {
    console.log('=== API: initializePayment ===');
    const response = await fetch(`${apiUrl}/api/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initialize payment');
    }

    return response.json();
  }, [apiUrl]);

  // Verify payment with backend
  const verifyPaymentTransaction = useCallback(async (reference: string) => {
    console.log('=== API: verifyPaymentTransaction ===');
    const response = await fetch(`${apiUrl}/api/payments/verify/${reference}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    return response.json();
  }, [apiUrl]);

  // Initialize payment on component mount
  const initPayment = useCallback(async () => {
    console.log('=== PaystackPayment: initPayment ===');
    
    // Prevent multiple simultaneous initializations
    if (isInitializing || hasInitialized) {
      console.log('Already initializing or initialized, skipping...');
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const paymentRequestData = {
        orderId,
        email: email || user?.email,
        firstName: firstName || user?.username,
        lastName: lastName || '',
        phone: phone,
        amount: amount * 100, // Convert to kobo for Paystack
      };

      console.log('Payment request data:', paymentRequestData);
      setDebugInfo({ type: 'initialization', data: paymentRequestData });

      const data = await initializePayment(paymentRequestData);
      console.log('Payment initialization response:', data);

      setPaymentData(data);
      setHasInitialized(true);
      setDebugInfo({ type: 'success', data });
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setError(error?.message || 'Payment initialization failed');
      setDebugInfo({ type: 'error', error: error?.message || 'Unknown error' });
    } finally {
      setIsInitializing(false);
    }
  }, [orderId, email, user?.email, user?.username, firstName, lastName, phone, amount, initializePayment, isInitializing, hasInitialized]);

  useEffect(() => {
    console.log('=== PaystackPayment: useEffect ===');
    console.log('Public Key:', publicKey ? `${publicKey.substring(0, 10)}...` : 'NOT SET');
    console.log('Currency:', currency);
    console.log('API URL:', apiUrl);
    console.log('Has Initialized:', hasInitialized);
    console.log('Is Initializing:', isInitializing);

    if (!publicKey) {
      setError('Paystack public key not found in environment variables');
      return;
    }

    if (user && orderId && amount > 0 && !hasInitialized && !isInitializing) {
      initPayment();
    }
  }, [publicKey, user, orderId, amount, hasInitialized, isInitializing, initPayment]);

  // Retry payment initialization
  const handleRetryPayment = () => {
    console.log('=== PaystackPayment: handleRetryPayment ===');
    setRetryCount(prev => prev + 1);
    setError(null);
    setPaymentData(null);
    setDebugInfo(null);
    setHasInitialized(false); // Reset initialization flag

    // Start initialization after state reset
    setTimeout(() => {
      initPayment();
    }, 100);
  };

  // Paystack configuration
  const paystackConfig = paymentData && publicKey ? {
    reference: paymentData.reference,
    email: paymentData.email,
    amount: paymentData.amount,
    publicKey,
    currency: paymentData.currency || currency,
    metadata: paymentData.metadata || {},
    onSuccess: async (response: any) => {
      console.log('=== PaystackPayment: onSuccess ===');
      console.log('Paystack response:', response);

      try {
        // Verify the payment with our backend
        const verificationResult = await verifyPaymentTransaction(response.reference);
        console.log('Verification result:', verificationResult);

        // Call the success callback provided by parent component
        onSuccess(verificationResult);
      } catch (error: any) {
        console.error('Error verifying payment:', error);
        setError(
          error instanceof Error
            ? `Payment verification failed: ${error.message}`
            : 'Payment verification failed. Please contact support.'
        );
      }
    },
    onClose: () => {
      console.log('=== PaystackPayment: onClose ===');
      setError('Payment was cancelled');
      if (onClose) {
        onClose();
      }
    },
  } : null;

  // Handle loading, error, and button states
  if (isInitializing) {
    return (
      <div className={className}>
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <div className="mr-3">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-800">Initializing payment...</p>
              <p className="text-sm text-blue-600">Please wait while we prepare your payment.</p>
              {retryCount > 0 && <p className="text-xs text-blue-500">Attempt {retryCount + 1}</p>}
            </div>
          </div>
        </div>

        <button
          disabled
          className="w-full bg-gray-400 text-white font-bold py-4 px-6 rounded-lg opacity-70 cursor-not-allowed flex items-center justify-center"
        >
          Processing...
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Payment Error</p>
              <p className="text-sm text-red-600">{error}</p>
              {debugInfo && (
                <details className="mt-2 text-xs text-red-500">
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-1 bg-red-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>

        {retryCount < 3 ? (
          <button
            onClick={handleRetryPayment}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200"
          >
            Retry Payment {retryCount > 0 && `(${retryCount + 1}/3)`}
          </button>
        ) : (
          <div className="text-center">
            <p className="text-red-600 mb-4">Maximum payment attempts reached. Please try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className={className}>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm">Paystack is not properly configured. Please contact support.</p>
          </div>
        </div>

        <button
          disabled
          className="w-full bg-gray-400 text-white font-bold py-4 px-6 rounded-lg opacity-70 cursor-not-allowed"
        >
          Payment Unavailable
        </button>
      </div>
    );
  }

  if (!paystackConfig) {
    return (
      <div className={className}>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm">Payment not ready. Please wait...</p>
          </div>
        </div>

        <button
          onClick={handleRetryPayment}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200"
        >
          Initialize Payment
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="font-medium">Payment Information</p>
            <p className="text-sm">
              Amount: {`${currency} ${amount.toFixed(2)}`} • Order ID: {orderId}
            </p>
            <p className="text-sm mt-2">
              We use Paystack for secure payment processing. Click below to complete your payment.
            </p>
            {debugInfo && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer">Payment Details</summary>
                <pre className="mt-1 bg-blue-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>

      <PaystackButton
        {...paystackConfig}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {children || "Pay with Paystack"}
      </PaystackButton>
    </div>
  );
};

export default PaystackPayment;
