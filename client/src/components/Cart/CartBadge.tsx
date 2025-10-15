import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';

const CartBadge: React.FC = () => {
  const { state } = useCart();
  const { itemCount } = state;

  return (
    <Link
      to="/cart"
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      title="Shopping Cart"
    >
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartBadge;