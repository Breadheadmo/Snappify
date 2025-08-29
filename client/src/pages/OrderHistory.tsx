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
        // Map backend orderItems to frontend items format
        const formattedOrders = data.map((order: any) => ({
          _id: order._id,
          createdAt: order.createdAt,
          status: order.status,
          total: order.totalPrice,
          items: order.orderItems.map((item: any) => ({
            product: {
              name: item.name,
              image: item.image
            },
            quantity: item.quantity,
            price: item.price
          }))
        }));
        setOrders(formattedOrders);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
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
              <div className="mb-2">Total: <span className="font-bold">R{order.total.toLocaleString()}</span></div>
              <div>
                <h4 className="font-semibold mb-2">Items:</h4>
                <ul className="list-disc list-inside">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-center mb-1">
                      <img src={item.product.image} alt={item.product.name} className="w-8 h-8 rounded mr-2" />
                      <span>{item.product.name}</span>
                      <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
                      <span className="ml-4 text-xs text-gray-700">R{item.price.toLocaleString()}</span>
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
