import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface TrackingStage {
  key: string;
  label: string;
  description: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier?: string;
  currentStage: string;
  estimatedDelivery?: string;
  trackingUrl?: string;
  orderStatus: string;
  isDelivered: boolean;
  deliveredAt?: string;
  deliveredTo?: string;
  createdAt: string;
  totalItems?: number;
  totalPrice?: number;
  deliveryLocation?: {
    city: string;
    country: string;
  };
  shippingAddress?: any;
}

const trackingStages: TrackingStage[] = [
  { key: 'processing', label: 'Processing', description: 'Order is being prepared' },
  { key: 'confirmed', label: 'Confirmed', description: 'Order has been confirmed' },
  { key: 'preparing', label: 'Preparing', description: 'Items are being packed' },
  { key: 'shipped', label: 'Shipped', description: 'Package has left our facility' },
  { key: 'in_transit', label: 'In Transit', description: 'Package is on its way' },
  { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Package is out for delivery' },
  { key: 'delivered', label: 'Delivered', description: 'Package has been delivered' }
];

const OrderTracking: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tracking/${trackingNumber}`);
        const data = await response.json();

        if (data.success) {
          setTrackingInfo(data.data);
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

  const getCurrentStageIndex = (currentStage: string): number => {
    return trackingStages.findIndex(stage => stage.key === currentStage);
  };

  const formatDate = (dateString: string): string => {
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
  if (!trackingInfo) return <ErrorMessage message="No tracking information found" />;

  const currentStageIndex = getCurrentStageIndex(trackingInfo.currentStage);

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
                Tracking Number: <span className="font-semibold">{trackingInfo.trackingNumber}</span>
              </p>
            </div>
            {trackingInfo.trackingUrl && (
              <a
                href={trackingInfo.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Track on {trackingInfo.carrier}
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
              <p className="font-semibold">{formatDate(trackingInfo.createdAt)}</p>
            </div>
            {trackingInfo.totalItems && (
              <div>
                <p className="text-sm text-gray-600">Items</p>
                <p className="font-semibold">{trackingInfo.totalItems} item(s)</p>
              </div>
            )}
            {trackingInfo.totalPrice && (
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold">R {trackingInfo.totalPrice.toFixed(2)}</p>
              </div>
            )}
          </div>
          
          {trackingInfo.deliveryLocation && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Delivery Location</p>
              <p className="font-semibold">
                {trackingInfo.deliveryLocation.city}, {trackingInfo.deliveryLocation.country}
              </p>
            </div>
          )}

          {trackingInfo.estimatedDelivery && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Estimated Delivery</p>
              <p className="font-semibold text-green-600">
                {formatDate(trackingInfo.estimatedDelivery)}
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
                
                return (
                  <div key={stage.key} className="relative flex items-center">
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
                        {stage.label}
                        {isCurrent && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                        {stage.description}
                      </p>
                      {stage.key === 'delivered' && trackingInfo.deliveredAt && isCompleted && (
                        <p className="text-sm text-green-600 mt-1">
                          Delivered on {formatDate(trackingInfo.deliveredAt)}
                          {trackingInfo.deliveredTo && ` to ${trackingInfo.deliveredTo}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
              <p className="text-gray-600 mt-1">
                {trackingStages[currentStageIndex]?.description || 'Processing your order'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              trackingInfo.isDelivered 
                ? 'bg-green-100 text-green-800'
                : currentStageIndex >= 3
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {trackingInfo.isDelivered ? 'Delivered' : trackingStages[currentStageIndex]?.label || 'Processing'}
            </div>
          </div>
          
          {trackingInfo.carrier && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Carrier: <span className="font-semibold text-gray-900">{trackingInfo.carrier}</span>
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
