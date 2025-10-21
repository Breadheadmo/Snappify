import React from 'react';
import { Package, ShoppingBag, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OrderStatus } from '../../types/Order';

interface OrderEmptyStateProps {
  filter: OrderStatus | 'all';
}

const OrderEmptyState: React.FC<OrderEmptyStateProps> = ({ filter }) => {
  const navigate = useNavigate();

  const messages: Record<OrderStatus | 'all', { title: string; description: string; icon: any }> = {
    all: {
      title: 'No orders yet',
      description: 'Start shopping to see your orders here',
      icon: Inbox
    },
    [OrderStatus.PENDING]: {
      title: 'No pending orders',
      description: 'You don\'t have any orders waiting for confirmation',
      icon: Package
    },
    [OrderStatus.CONFIRMED]: {
      title: 'No confirmed orders',
      description: 'You don\'t have any confirmed orders',
      icon: Package
    },
    [OrderStatus.PROCESSING]: {
      title: 'No processing orders',
      description: 'You don\'t have any orders being processed',
      icon: Package
    },
    [OrderStatus.SHIPPED]: {
      title: 'No shipped orders',
      description: 'You don\'t have any orders in transit',
      icon: Package
    },
    [OrderStatus.OUT_FOR_DELIVERY]: {
      title: 'No orders out for delivery',
      description: 'You don\'t have any orders out for delivery',
      icon: Package
    },
    [OrderStatus.DELIVERED]: {
      title: 'No delivered orders',
      description: 'You don\'t have any delivered orders',
      icon: Package
    },
    [OrderStatus.CANCELLED]: {
      title: 'No cancelled orders',
      description: 'You don\'t have any cancelled orders',
      icon: Package
    },
    [OrderStatus.RETURNED]: {
      title: 'No returned orders',
      description: 'You don\'t have any returned orders',
      icon: Package
    },
    [OrderStatus.REFUNDED]: {
      title: 'No refunded orders',
      description: 'You don\'t have any refunded orders',
      icon: Package
    }
  };

  const message = messages[filter] || messages.all;
  const Icon = message.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-100 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
          <Icon className="h-16 w-16 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {message.title}
        </h3>
        <p className="text-gray-600 mb-8 text-lg">
          {message.description}
        </p>
        {filter === 'all' && (
          <button
            onClick={() => navigate('/products')}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ShoppingBag className="h-6 w-6" />
            Start Shopping
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderEmptyState;