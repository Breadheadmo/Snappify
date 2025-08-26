import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';
import { useCart } from '../contexts/CartContext';


const Cart: React.FC = () => {
  const { state, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    await removeFromCart(productId);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate loading before redirecting
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 1000);
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Loading your cart...</h1>
        </div>
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <ShoppingBag className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = state.total >= 80000 ? 0 : 15000; // in cents
  const totalWithShipping = state.total + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            You have {state.itemCount} item{state.itemCount !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {state.items.map((item) => (
                <div key={item.product.id} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/80x80?text=Product';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            <Link to={`/products/${item.product.id}`} className="hover:text-primary-600">
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{item.product.brand}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>SKU: {item.product.id}</span>
                            <span>Weight: {item.product.weight || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            R{((item.product.price * item.quantity) / 100).toFixed(2)}
                          </div>
                          {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              R{((item.product.originalPrice * item.quantity) / 100).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.product.id.toString(), item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 text-gray-900 font-medium min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id.toString(), item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                            disabled={!item.product.inStock}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product.id.toString())}
                          className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Actions */}
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => clearCart()}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear Cart
              </button>
              <Link
                to="/products"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span>R{(state.total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                    {shippingCost === 0 ? 'Free' : `R${(shippingCost / 100).toFixed(2)}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    Add R{((80000 - state.total) / 100).toFixed(2)} more for free shipping
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>R{(totalWithShipping / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              {/* Security Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Truck className="h-4 w-4" />
                  <span>Free shipping over R800</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Multiple payment options</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* TODO: Replace with backend API products or recommended products */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
