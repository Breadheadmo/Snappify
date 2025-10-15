import React, { useState } from 'react';
import { Package, Search, MapPin, Clock, CheckCircle, Truck } from 'lucide-react';

const TrackOrder: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/track/${trackingNumber}`);
      if (!response.ok) throw new Error('Order not found');
      const data = await response.json();
      setTrackingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to track order');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'in transit':
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-gray-100 via-white to-gray-100 rounded-full relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <MapPin className="w-8 h-8 text-black relative z-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your tracking number to see the current status of your order</p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your tracking number"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Tracking...' : 'Track Order'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </form>
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="border-b pb-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                {getStatusIcon(trackingData.status)}
              </div>
              <p className="text-sm text-gray-600">Tracking Number: <span className="font-medium">{trackingData.trackingNumber}</span></p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{trackingData.status}</p>
              </div>

              {trackingData.estimatedDelivery && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}

              {trackingData.currentLocation && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Location</p>
                  <p className="text-lg font-semibold text-gray-900">{trackingData.currentLocation}</p>
                </div>
              )}

              {trackingData.updates && trackingData.updates.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-900 mb-4">Tracking History</p>
                  <div className="space-y-3">
                    {trackingData.updates.map((update: any, index: number) => (
                      <div key={index} className="flex gap-3 pb-3 border-b last:border-b-0">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{update.status}</p>
                          <p className="text-xs text-gray-600">{update.location}</p>
                          <p className="text-xs text-gray-500">{new Date(update.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-700">
            Need help with your order?{' '}
            <a href="/contact" className="text-blue-600 font-medium hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;