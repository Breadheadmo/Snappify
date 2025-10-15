import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';

const MiniCart: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, removeFromCart, updateQuantity } = useCart();
  const { items = [], itemCount = 0, total = 0 } = state || {};
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Shopping Cart"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({itemCount})
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Your cart is empty</p>
              <Link
                to="/products"
                onClick={() => setIsOpen(false)}
                className="inline-block mt-3 text-blue-600 hover:text-blue-800 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="max-h-64 overflow-y-auto">
                {items.slice(0, 3).map((item: any) => (
                  <div key={item.product.id} className="p-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product.image || 'https://via.placeholder.com/50x50?text=Product'}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          R{((item.product.price) / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id.toString(), Math.max(1, item.quantity - 1))}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium min-w-[1.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id.toString(), item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id.toString())}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {items.length > 3 && (
                  <div className="p-4 text-center text-sm text-gray-600">
                    +{items.length - 3} more items
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between text-lg font-semibold text-gray-900 mb-3">
                  <span>Total:</span>
                  <span>R{(total / 100).toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-gray-100 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniCart;