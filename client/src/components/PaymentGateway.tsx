import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PaymentGatewayProps {
  orderId: string;
  amount: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  onSuccess: (reference: any) => void;
  onClose?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  orderId,
  amount,
  email,
  firstName,
  lastName,
  phone,
  onSuccess,
  onClose,
  disabled = false,
  className = '',
  children,
}) => {
  const { user } = useAuth();

  const handlePayment = async () => {
    try {
      // This is a placeholder for actual payment implementation
      // In a real implementation, you would call your payment API here
      
      // Simulate a successful payment after 2 seconds
      setTimeout(() => {
        // Create a mock payment reference
        const mockReference = {
          reference: `mock_${Date.now()}`,
          status: 'success',
          transaction_date: new Date().toISOString(),
        };
        
        // Call the success callback with the mock reference
        onSuccess(mockReference);
      }, 2000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

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
              Amount: {`R${amount.toFixed(2)}`} • Order ID: {orderId}
            </p>
            <p className="text-sm mt-2 text-red-600">
              Note: This is a placeholder payment component. In production, integrate with your preferred payment gateway.
            </p>
          </div>
        </div>
      </div>
      
      <button
        onClick={handlePayment}
        disabled={disabled}
        className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children || "Proceed to Payment"}
      </button>
    </div>
  );
};

export default PaymentGateway;
