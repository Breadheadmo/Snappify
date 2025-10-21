import { Package, Calendar, MapPin, Truck, ExternalLink, Copy, Check } from 'lucide-react';
import { Order, OrderStatus } from '../../types/Order';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface OrderTrackingCardProps {
  order: Order;
}

const OrderTrackingCard = ({ order }: OrderTrackingCardProps) => {
  const [copied, setCopied] = useState(false);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.PROCESSING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.CANCELLED:
      case OrderStatus.RETURNED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const copyTrackingNumber = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Order Number</p>
            <h3 className="text-2xl font-bold">{order.orderNumber}</h3>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Ordered: {formatDate(order.createdAt)}</span>
          </div>
          {order.estimatedDelivery && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Est. Delivery: {formatDate(order.estimatedDelivery)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tracking Information */}
        {order.trackingNumber && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary-600" />
                <h4 className="font-bold text-gray-900">Tracking Information</h4>
              </div>
              {order.carrier && (
                <span className="text-sm text-gray-600 font-medium">{order.carrier}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 text-lg font-mono font-bold text-gray-900 bg-white px-3 py-2 rounded border">
                {order.trackingNumber}
              </code>
              <button
                onClick={copyTrackingNumber}
                className="p-2 bg-white border rounded hover:bg-gray-50 transition-colors"
                title="Copy tracking number"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>

            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                Track on carrier website
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* Order Items */}
        <div className="mb-6">
          <h4 className="font-bold text-gray-900 mb-3">Order Items ({order.items.length})</h4>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900">R{item.subtotal.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h4 className="font-bold text-gray-900">Shipping Address</h4>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
            <p className="font-semibold mt-2">Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">R{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">R{order.shipping.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold">R{order.tax.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-semibold">-R{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>R{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link to={`/orders/${order.id}`}>
          <button className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-lg font-bold hover:from-primary-700 hover:to-primary-600 transition-all duration-300 hover:shadow-lg">
            View Full Details
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OrderTrackingCard;