import React from 'react';
import { CheckCircle, Truck, Clock, XCircle, Package, RefreshCw, Home } from 'lucide-react';
import { OrderStatus } from '../../types/Order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const statusConfig = {
    [OrderStatus.PENDING]: {
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Pending'
    },
    [OrderStatus.CONFIRMED]: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Confirmed'
    },
    [OrderStatus.PROCESSING]: {
      icon: RefreshCw,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Processing'
    },
    [OrderStatus.SHIPPED]: {
      icon: Truck,
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      label: 'Shipped'
    },
    [OrderStatus.OUT_FOR_DELIVERY]: {
      icon: Home,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      label: 'Out for Delivery'
    },
    [OrderStatus.DELIVERED]: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Delivered'
    },
    [OrderStatus.CANCELLED]: {
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'Cancelled'
    },
    [OrderStatus.RETURNED]: {
      icon: RefreshCw,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      label: 'Returned'
    },
    [OrderStatus.REFUNDED]: {
      icon: RefreshCw,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      label: 'Refunded'
    }
  };

  const config = statusConfig[status] || statusConfig[OrderStatus.PENDING];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;