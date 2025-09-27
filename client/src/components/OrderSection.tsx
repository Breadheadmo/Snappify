import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronDown, ChevronUp, Package, Truck, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface OrderItem {
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const OrderSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Use the API service to fetch orders
        const ordersData = await api.orders.getOrders();
        console.log('Fetched orders in OrderSection:', ordersData);
        
        // Ensure ordersData is an array before setting it
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        } else {
          console.warn('Orders data is not an array:', ordersData);
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again later.');
        setOrders([]); // Ensure orders is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderIds(prev => 
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Package className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <Package className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>{error}</p>
        <button 
          className="mt-4 text-primary-600 hover:text-primary-700"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>You haven't placed any orders yet</p>
        <Link 
          to="/products" 
          className="inline-block mt-4 text-primary-600 hover:text-primary-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.isArray(orders) && orders.map((order) => (
        <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Order Header */}
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm text-gray-500 mr-2">Order #</span>
                <span className="text-sm font-medium">{order.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {order.date ? new Date(order.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Date not available'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end mt-3 sm:mt-0">
              <span className="text-sm text-gray-500 mb-1">Total Amount</span>
              <span className="text-lg font-bold text-gray-900">R{(order.total || 0).toLocaleString()}</span>
              <button
                onClick={() => toggleOrderExpand(order.id)}
                className="mt-2 text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
              >
                {expandedOrderIds.includes(order.id) ? (
                  <>
                    <span>Hide Details</span>
                    <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Show Details</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order Details (Expanded) */}
          {expandedOrderIds.includes(order.id) && (
            <div className="p-4 sm:p-6">
              {/* Items List */}
              <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="space-y-3 mb-6">
                {(order.items || []).map((item, idx) => {
                  if (!item || !item.product) {
                    return null; // Skip invalid items
                  }
                  return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex-shrink-0 mr-3">
                        <img 
                          src={item.product.image || 'https://via.placeholder.com/48?text=Product'} 
                          alt={item.product.name || 'Product'}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/48?text=Product';
                          }}
                        />
                      </div>
                      <div>
                        <Link 
                          to={`/products/${item.product.id || ''}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600"
                        >
                          {item.product.name || 'Unknown Product'}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      R{((item.product?.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                  );
                })}
              </div>

              {/* Shipping & Tracking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Shipping Address</h4>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || 'Name not available'}</p>
                    <p>{order.shippingAddress?.addressLine1 || 'Address not available'}</p>
                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress?.city || 'City'}, {order.shippingAddress?.postalCode || 'Postal Code'}</p>
                    <p>{order.shippingAddress?.country || 'Country'}</p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Tracking Information</h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <p className="text-gray-600">Tracking Number:</p>
                      <p className="font-medium text-gray-900">{order.trackingNumber}</p>
                      <a 
                        href={`#track-${order.trackingNumber}`} 
                        className="text-primary-600 hover:text-primary-700 mt-2 inline-block"
                        onClick={(e) => e.preventDefault()}
                      >
                        Track Package
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                {order.status === 'pending' || order.status === 'processing' ? (
                  <button 
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => {
                      // In a real app, this would make an API call to cancel the order
                      alert('Order cancellation would be implemented here');
                    }}
                  >
                    Cancel Order
                  </button>
                ) : null}
                <button 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    // In a real app, this would generate and download an invoice
                    alert('Invoice download would be implemented here');
                  }}
                >
                  Download Invoice
                </button>
                <button 
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => {
                    // In a real app, this would redirect to a help/support page
                    alert('Help/support would be implemented here');
                  }}
                >
                  Need Help?
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderSection;
