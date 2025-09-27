import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import PaystackPayment from '../components/PaystackPayment';
import { createFieldState, updateFieldState, isFormValid } from '../utils/validation';
import { CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

// These interfaces will be used when connecting to a real API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ShippingDetails {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PaymentDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

const Checkout: React.FC = () => {
  const { state: cartState, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Shipping form fields
  const [shippingFields, setShippingFields] = useState({
    fullName: createFieldState(user?.username || ''),
    addressLine1: createFieldState(),
    addressLine2: createFieldState(),
    city: createFieldState(),
    postalCode: createFieldState(),
    country: createFieldState('South Africa'),
    phoneNumber: createFieldState()
  });
  
  // Payment form fields
  const [paymentFields, setPaymentFields] = useState({
    cardNumber: createFieldState(),
    cardholderName: createFieldState(),
    expiryDate: createFieldState(),
    cvv: createFieldState()
  });
  
  // Shipping options
  const [shippingOption, setShippingOption] = useState('standard');
  const shippingOptions = [
    { id: 'standard', name: 'Standard Delivery', price: 50, description: '3-5 business days' },
    { id: 'express', name: 'Express Delivery', price: 100, description: '1-2 business days' },
    { id: 'same-day', name: 'Same Day Delivery', price: 200, description: 'Delivered today (order before 10am)' }
  ];
  
  // Calculate totals
  const subtotal = cartState.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const selectedShipping = shippingOptions.find(option => option.id === shippingOption) || shippingOptions[0];
  const shippingCost = selectedShipping.price;
  const tax = Math.round(subtotal * 0.15); // 15% VAT
  const total = subtotal + shippingCost + tax;
  
  const updateShippingField = (field: keyof typeof shippingFields, value: string) => {
    setShippingFields(prev => ({
      ...prev,
      [field]: updateFieldState(prev[field], value, (val) => val.trim().length > 0 ? null : 'This field is required')
    }));
  };
  
  const updatePaymentField = (field: keyof typeof paymentFields, value: string) => {
    const validators: Record<string, (val: string) => string | null> = {
      cardNumber: (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        if (digitsOnly.length !== 16) return 'Card number must be 16 digits';
        return null;
      },
      cardholderName: (val) => val.trim().length > 0 ? null : 'Cardholder name is required',
      expiryDate: (val) => {
        const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!regex.test(val)) return 'Format must be MM/YY';
        
        const [month, year] = val.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const today = new Date();
        
        if (expiryDate < today) return 'Card has expired';
        return null;
      },
      cvv: (val) => {
        const digitsOnly = val.replace(/\D/g, '');
        if (digitsOnly.length !== 3) return 'CVV must be 3 digits';
        return null;
      }
    };
    
    setPaymentFields(prev => ({
      ...prev,
      [field]: updateFieldState(prev[field], value, validators[field])
    }));
  };
  
  const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    const groups = [];
    
    for (let i = 0; i < digitsOnly.length; i += 4) {
      groups.push(digitsOnly.slice(i, i + 4));
    }
    
    return groups.join(' ').slice(0, 19); // Limit to 16 digits (with spaces)
  };
  
  const formatExpiryDate = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    
    if (digitsOnly.length >= 3) {
      return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}`;
    } else if (digitsOnly.length === 2) {
      return `${digitsOnly}/`;
    }
    
    return digitsOnly;
  };
  
  const handleNextStep = () => {
    if (currentStep === 'shipping') {
      // Mark all shipping fields as touched
      const touchedShippingFields = Object.keys(shippingFields).reduce((acc, key) => {
        const fieldKey = key as keyof typeof shippingFields;
        return {
          ...acc,
          [fieldKey]: {
            ...shippingFields[fieldKey],
            touched: true
          }
        };
      }, {} as typeof shippingFields);
      
      setShippingFields(touchedShippingFields);
      
      // Check if shipping form is valid
      if (!isFormValid(touchedShippingFields)) {
        setError('Please fill out all required fields');
        return;
      }
      
      // Create order and then move to payment
      handlePlaceOrder();
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    }
  };
  
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError('');
    try {
      // Prepare order data
      const shippingDetails = {
        fullName: shippingFields.fullName.value,
        addressLine1: shippingFields.addressLine1.value,
        addressLine2: shippingFields.addressLine2.value,
        city: shippingFields.city.value,
        postalCode: shippingFields.postalCode.value,
        country: shippingFields.country.value,
        phoneNumber: shippingFields.phoneNumber.value
      };
      
      // Prepare orderItems for backend
      const orderItems = cartState.items.map(item => ({
        product: String(item.product._id || item.product.id),
        name: item.product.name,
        quantity: item.quantity,
        image: item.product.image,
        price: item.product.price
      }));

      // Prepare shippingMethod for backend
      const shippingMethod = {
        name: selectedShipping.name,
        price: selectedShipping.price,
        description: selectedShipping.description
      };

      // Call backend checkout API to create order
      const response = await import('../services/api').then(mod =>
        mod.cartApi.checkout(
          orderItems,
          shippingDetails,
          'Paystack', // paymentMethod
          shippingMethod,
          tax,
          shippingCost,
          subtotal,
          total
        )
      );
      
      const newOrderId = response.orderId || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setOrderId(newOrderId);
      
      // Now proceed to payment step
      setCurrentStep('payment');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating your order');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePaymentSuccess = async (paymentResult: any) => {
    try {
      console.log('Payment successful:', paymentResult);
      
      // Clear cart after successful payment
      clearCart();
      
      // Refresh products after order to update stock
      try {
        await import('../contexts/SearchContext').then(mod => mod.useSearch().searchProducts());
      } catch (e) {
        console.warn('Could not refresh products:', e);
      }
      
      // Move to confirmation step
      setCurrentStep('confirmation');
      setOrderComplete(true);
    } catch (err) {
      console.error('Error processing payment success:', err);
      setError('Payment was successful but there was an error processing your order. Please contact support.');
    }
  };
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    }
  }, [isAuthenticated, navigate]);
  
  // Redirect to cart if cart is empty
  React.useEffect(() => {
    // Only redirect to cart if cart is empty AND not already in checkout flow
    if (cartState.itemCount === 0 && currentStep !== 'confirmation' && !orderComplete) {
      navigate('/cart');
    }
  }, [cartState.itemCount, navigate, orderComplete, currentStep]);
  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Checkout Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center ${currentStep === 'shipping' || currentStep === 'payment' || currentStep === 'confirmation' ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-current">
                  <Truck className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Shipping</span>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                <div className={`h-full bg-primary-600 transition-all ${currentStep === 'payment' || currentStep === 'confirmation' ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center ${currentStep === 'payment' || currentStep === 'confirmation' ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-current">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Payment</span>
              </div>
              <div className="flex-1 h-0.5 mx-4 bg-gray-200">
                <div className={`h-full bg-primary-600 transition-all ${currentStep === 'confirmation' ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center ${currentStep === 'confirmation' ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-current">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="ml-2 text-sm font-medium">Confirmation</span>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
          
          {/* Checkout Forms */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {currentStep === 'shipping' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Information</h2>
                
                <div className="space-y-4">
                  <FormInput
                    id="fullName"
                    label="Full Name"
                    type="text"
                    placeholder="Enter your full name"
                    fieldState={shippingFields.fullName}
                    onChange={(value) => updateShippingField('fullName', value)}
                  />
                  
                  <FormInput
                    id="addressLine1"
                    label="Address Line 1"
                    type="text"
                    placeholder="Street address or P.O. Box"
                    fieldState={shippingFields.addressLine1}
                    onChange={(value) => updateShippingField('addressLine1', value)}
                  />
                  
                  <FormInput
                    id="addressLine2"
                    label="Address Line 2"
                    type="text"
                    placeholder="Apt, suite, unit, building, floor, etc. (optional)"
                    fieldState={shippingFields.addressLine2}
                    onChange={(value) => updateShippingField('addressLine2', value)}
                    required={false}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      id="city"
                      label="City"
                      type="text"
                      placeholder="Enter your city"
                      fieldState={shippingFields.city}
                      onChange={(value) => updateShippingField('city', value)}
                    />
                    
                    <FormInput
                      id="postalCode"
                      label="Postal Code"
                      type="text"
                      placeholder="Enter your postal code"
                      fieldState={shippingFields.postalCode}
                      onChange={(value) => updateShippingField('postalCode', value)}
                    />
                  </div>
                  
                  <FormSelect
                    id="country"
                    label="Country"
                    fieldState={shippingFields.country}
                    onChange={(value) => updateShippingField('country', value)}
                    options={[
                      { value: 'South Africa', label: 'South Africa' },
                      { value: 'Namibia', label: 'Namibia' },
                      { value: 'Botswana', label: 'Botswana' },
                      { value: 'Zimbabwe', label: 'Zimbabwe' },
                      { value: 'Mozambique', label: 'Mozambique' }
                    ]}
                  />
                  
                  <FormInput
                    id="phoneNumber"
                    label="Phone Number"
                    type="tel"
                    placeholder="For delivery updates"
                    fieldState={shippingFields.phoneNumber}
                    onChange={(value) => updateShippingField('phoneNumber', value)}
                  />
                  
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Shipping Method</h3>
                    <div className="space-y-3">
                      {shippingOptions.map(option => (
                        <div 
                          key={option.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            shippingOption === option.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200'
                          }`}
                          onClick={() => setShippingOption(option.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                                shippingOption === option.id ? 'bg-primary-600' : 'border border-gray-300'
                              }`}></div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{option.name}</h4>
                                <p className="text-xs text-gray-500">{option.description}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold">R{option.price.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 'payment' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Information</h2>
                <div className="mb-6">
                  <PaystackPayment
                    orderId={orderId || ''}
                    amount={total}
                    email={user?.email}
                    firstName={user?.username}
                    lastName={""}
                    phone={shippingFields.phoneNumber.value}
                    onSuccess={handlePaymentSuccess}
                    onClose={() => setError('Payment was cancelled')}
                  />
                </div>
              </div>
            )}
            
            {currentStep === 'confirmation' && (
              <div className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h2>
                <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
                
                <div className="bg-gray-50 p-4 rounded-lg inline-block mb-6">
                  <p className="text-sm text-gray-600">Order Reference:</p>
                  <p className="text-lg font-medium text-gray-900">{orderId}</p>
                </div>
                
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation email to your registered email address.
                  You can track your order status in your profile under "Orders".
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Orders
                  </button>
                </div>
              </div>
            )}
            
            {/* Order Summary */}
            {(currentStep === 'shipping' || currentStep === 'payment') && (
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  {cartState.items.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                          {item.quantity}
                        </span>
                        <span className="text-sm text-gray-600">{item.product.name}</span>
                      </div>
                      <span className="text-sm font-medium">R{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">R{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">R{shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (15% VAT)</span>
                    <span className="font-medium">R{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>R{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            {(currentStep === 'shipping' || currentStep === 'payment') && (
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="flex justify-between">
                  {currentStep === 'payment' ? (
                    <button
                      onClick={handlePreviousStep}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div>{/* Empty div to maintain flex spacing */}</div>
                  )}

                  <button
                    onClick={handleNextStep}
                    disabled={isProcessing || (currentStep === 'shipping' && Object.values(shippingFields).some(field => !field.value.trim()))}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : currentStep === 'shipping' ? (
                      'Continue to Payment'
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
