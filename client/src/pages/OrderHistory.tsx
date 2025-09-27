import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../services/api';

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  total: number;
  items: Array<{
    product: {
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
}

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderApi.getOrders();
        console.log('Raw orders data:', data); // Debug log
        
        // Handle case where data might be undefined or not an array
        if (!data || !Array.isArray(data)) {
          console.warn('Invalid orders data received:', data);
          setOrders([]);
          return;
        }
        
        // Map backend data to frontend format with safety checks
        const formattedOrders = data.map((order: any) => ({
          _id: order._id || order.id || 'unknown',
          createdAt: order.createdAt || order.date || new Date().toISOString(),
          status: order.status || order.orderStatus || 'pending',
          total: order.totalPrice || order.total || 0,
          items: (order.orderItems || order.items || []).map((item: any) => ({
            product: {
              name: item.name || item.product?.name || 'Unknown Product',
              image: item.image || item.product?.image || 'https://via.placeholder.com/32?text=Product'
            },
            quantity: item.quantity || 1,
            price: item.price || item.product?.price || 0
          }))
        }));
        
        setOrders(formattedOrders);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to fetch orders');
        setOrders([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return <div className="p-8">Please log in to view your order history.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      {loading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500">No orders found.</div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div
              key={order._id}
              className="border rounded-lg p-4 shadow cursor-pointer hover:bg-gray-50 transition"
              onClick={() => window.location.href = `/orders/${order._id}`}
            >
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Order ID: {order._id}</span>
                <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mb-2">Status: <span className="font-medium">{order.status}</span></div>
              <div className="mb-2">Total: <span className="font-bold">R{(order.total || 0).toLocaleString()}</span></div>
              <div>
                <h4 className="font-semibold mb-2">Items:</h4>
                <ul className="list-disc list-inside">
                  {(order.items || []).map((item, idx) => (
                    <li key={idx} className="flex items-center mb-1">
                      <img 
                        src={item.product?.image || 'https://via.placeholder.com/32?text=Product'} 
                        alt={item.product?.name || 'Product'} 
                        className="w-8 h-8 rounded mr-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/32?text=Product';
                        }}
                      />
                      <span>{item.product?.name || 'Unknown Product'}</span>
                      <span className="ml-2 text-xs text-gray-500">x{item.quantity || 1}</span>
                      <span className="ml-4 text-xs text-gray-700">R{(item.price || 0).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
