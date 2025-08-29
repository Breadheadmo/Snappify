import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface Order {
  _id: string;
  user: { username: string };
  orderItems: any[];
  status: string;
  isDelivered: boolean;
  deliveredAt?: string;
  trackingNumber?: string;
  totalPrice: number;
  createdAt: string;
}

const AdminOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/orders/${selectedOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, trackingNumber }),
    });
    setSelectedOrder(null);
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">User</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Created</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b">
                <td className="py-2 px-4">{order._id}</td>
                <td className="py-2 px-4">{order.user?.username}</td>
                <td className="py-2 px-4">{order.status}</td>
                <td className="py-2 px-4">${order.totalPrice.toFixed(2)}</td>
                <td className="py-2 px-4">{new Date(order.createdAt).toLocaleString()}</td>
                <td className="py-2 px-4">
                  <button onClick={() => handleSelectOrder(order)} className="bg-blue-500 text-white px-2 py-1 rounded">View / Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="mb-2"><strong>Order ID:</strong> {selectedOrder._id}</div>
            <div className="mb-2"><strong>User:</strong> {selectedOrder.user?.username}</div>
            <div className="mb-2"><strong>Status:</strong> {selectedOrder.status}</div>
            <div className="mb-2"><strong>Total:</strong> ${selectedOrder.totalPrice.toFixed(2)}</div>
            <div className="mb-2"><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
            <div className="mb-2"><strong>Delivered:</strong> {selectedOrder.isDelivered ? `Yes (${new Date(selectedOrder.deliveredAt || '').toLocaleString()})` : 'No'}</div>
            <div className="mb-2"><strong>Tracking Number:</strong> {selectedOrder.trackingNumber || 'N/A'}</div>
            <div className="mb-4">
              <strong>Order Items:</strong>
              <ul className="list-disc ml-6">
                {selectedOrder.orderItems.map((item, idx) => (
                  <li key={idx}>{item.name} x {item.quantity}</li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Update Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 w-full mb-2">
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <input
                type="text"
                placeholder="Tracking Number (optional)"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdateStatus} className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
              <button onClick={() => setSelectedOrder(null)} className="bg-gray-300 px-4 py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
