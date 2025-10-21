import React from 'react';
import { OrderStatus } from '../../types/Order';

interface OrderFiltersProps {
  activeFilter: OrderStatus | 'all';
  onFilterChange: (filter: OrderStatus | 'all') => void;
  orderCounts?: Record<string, number>;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ 
  activeFilter, 
  onFilterChange,
  orderCounts 
}) => {
  const filters: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: 'All Orders' },
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.CONFIRMED, label: 'Confirmed' },
    { value: OrderStatus.PROCESSING, label: 'Processing' },
    { value: OrderStatus.SHIPPED, label: 'Shipped' },
    { value: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery' },
    { value: OrderStatus.DELIVERED, label: 'Delivered' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' },
    { value: OrderStatus.RETURNED, label: 'Returned' },
    { value: OrderStatus.REFUNDED, label: 'Refunded' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2 overflow-x-auto scrollbar-hide">
      {filters.map(filter => {
        const count = orderCounts?.[filter.value];
        
        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeFilter === filter.value
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
            }`}
          >
            {filter.label}
            {count !== undefined && count > 0 && (
              <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                activeFilter === filter.value
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default OrderFilters;