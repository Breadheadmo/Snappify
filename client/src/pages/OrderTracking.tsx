import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Order, OrderStatus } from '../types/Order';  // ADD THIS IMPORT

// Remove your old TrackingStage interface and use this mapping
const statusToStageMapping: Record<OrderStatus, { label: string; description: string }> = {
  [OrderStatus.PENDING]: { label: 'Processing', description: 'Order is being prepared' },
  [OrderStatus.CONFIRMED]: { label: 'Confirmed', description: 'Order has been confirmed' },
  [OrderStatus.PROCESSING]: { label: 'Preparing', description: 'Items are being packed' },
  [OrderStatus.SHIPPED]: { label: 'Shipped', description: 'Package has left our facility' },
  [OrderStatus.OUT_FOR_DELIVERY]: { label: 'Out for Delivery', description: 'Package is out for delivery' },
  [OrderStatus.DELIVERED]: { label: 'Delivered', description: 'Package has been delivered' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', description: 'Order was cancelled' },
  [OrderStatus.RETURNED]: { label: 'Returned', description: 'Order was returned' },
  [OrderStatus.REFUNDED]: { label: 'Refunded', description: 'Order was refunded' },
};

const trackingStages: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED
];

const OrderTracking: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);  // Changed from trackingInfo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tracking/${trackingNumber}`);
        const data = await response.json();

        if (data.success) {
          setOrder(data.data);  // Changed from setTrackingInfo
        } else {
          setError('Tracking number not found');
        }
      } catch (err) {
        setError('Failed to fetch tracking information');
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchTrackingInfo();
    }
  }, [trackingNumber]);

  const getCurrentStageIndex = (currentStatus: OrderStatus): number => {
    return trackingStages.findIndex(stage => stage === currentStatus);
  };

  const formatDate = (dateString: string | Date): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!order) return <ErrorMessage message="No tracking information found" />;

  const currentStageIndex = getCurrentStageIndex(order.status);
  const isDelivered = order.status === OrderStatus.DELIVERED;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Track Your Order
              </h1>
              <p className="text-gray-600 mt-1">
                Order Number: <span className="font-semibold">{order.orderNumber}</span>
              </p>
              {order.trackingNumber && (
                <p className="text-gray-600 mt-1">
                  Tracking Number: <span className="font-semibold">{order.trackingNumber}</span>
                </p>
              )}
            </div>
            {order.trackingUrl && order.carrier && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Track on {order.carrier}
              </a>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-semibold">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Items</p>
              <p className="font-semibold">{order.items.length} item(s)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-semibold">R {order.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">Delivery Location</p>
            <p className="font-semibold">
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>
          </div>

          {order.estimatedDelivery && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Estimated Delivery</p>
              <p className="font-semibold text-green-600">
                {formatDate(order.estimatedDelivery)}
              </p>
            </div>
          )}
        </div>

        {/* Tracking Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tracking Progress</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div 
              className="absolute left-6 top-0 w-0.5 bg-blue-600 transition-all duration-500"
              style={{ height: `${(currentStageIndex / (trackingStages.length - 1)) * 100}%` }}
            ></div>

            {/* Tracking Stages */}
            <div className="space-y-6">
              {trackingStages.map((stage, index) => {
                const isCompleted = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const stageInfo = statusToStageMapping[stage];
                
                return (
                  <div key={stage} className="relative flex items-center">
                    {/* Circle */}
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="ml-4 flex-1">
                      <div className={`font-semibold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {stageInfo.label}
                        {isCurrent && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                        {stageInfo.description}
                      </p>
                      {stage === OrderStatus.DELIVERED && order.deliveredAt && isCompleted && (
                        <p className="text-sm text-green-600 mt-1">
                          Delivered on {formatDate(order.deliveredAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tracking Events History */}
        {order.trackingEvents && order.trackingEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking History</h2>
            <div className="space-y-3">
              {order.trackingEvents.slice().reverse().map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{event.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{formatDate(event.timestamp)}</span>
                      {event.location && (
                        <>
                          <span>•</span>
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
              <p className="text-gray-600 mt-1">
                {statusToStageMapping[order.status]?.description || 'Processing your order'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isDelivered 
                ? 'bg-green-100 text-green-800'
                : currentStageIndex >= 3
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {statusToStageMapping[order.status]?.label || 'Processing'}
            </div>
          </div>
          
          {order.carrier && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Carrier: <span className="font-semibold text-gray-900">{order.carrier}</span>
              </p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
