import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MapPin, Truck, Calendar, Package } from 'lucide-react';
import type { Order } from '../../types/Order';
import { normalizeOrder } from '../../types/Order';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order: rawOrder }) => {
  const navigate = useNavigate();
  
  // ✅ Normalize order to ensure compatibility
  const order = normalizeOrder(rawOrder);

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Helper to get product info (handles both formats)
  const getProductInfo = (item: any) => {
    if (item.product) {
      return {
        name: item.product.name,
        image: item.product.image,
        price: item.price,
        total: item.total || item.subtotal || (item.price * item.quantity)
      };
    }
    // Legacy format
    return {
      name: item.productName,
      image: item.productImage,
      price: item.price,
      total: item.subtotal
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
      {/* Order Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                Order #{order.orderNumber || order.id.substring(0, 8).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {formatDate(order.date || order.createdAt)}
              </p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} size="md" />
        </div>
      </div>

      {/* Order Items */}
      <div className="px-6 py-4 bg-white">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Order Items ({order.items.length})
        </h4>
        <div className="space-y-3">
          {order.items.slice(0, 3).map((item, index) => {
            const productInfo = getProductInfo(item);
            
            return (
              <div 
                key={index} 
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={productInfo.image}
                  alt={productInfo.name}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64?text=Product';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate hover:text-blue-600 cursor-pointer transition-colors">
                    {productInfo.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Quantity: <span className="font-semibold">{item.quantity}</span> × R{productInfo.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">
                    R{productInfo.total.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    per item: R{productInfo.price.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
          {order.items.length > 3 && (
            <div className="text-center py-2 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-semibold">
                +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Footer */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 text-sm">
            {order.trackingNumber && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Truck className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">Tracking:</span>
                <span className="font-semibold text-gray-900">{order.trackingNumber}</span>
              </div>
            )}
            {order.shippingAddress && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.country}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right bg-white px-4 py-2 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                R{order.total.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => navigate(`/orders/${order.id}`)}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Eye className="h-5 w-5" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;