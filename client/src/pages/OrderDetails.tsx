import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string}>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderApi.getOrderById(orderId!);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    if (user && orderId) fetchOrder();
  }, [user, orderId]);

  if (!user) {
    return <div className="p-8">Please log in to view order details.</div>;
  }

  if (loading) {
    return <div className="p-8">Loading order details...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="p-8">Order not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded">Back</button>
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>
      <div className="mb-2 font-semibold">Order ID: {order._id}</div>
      <div className="mb-2">Date: {new Date(order.createdAt).toLocaleString()}</div>
      <div className="mb-2">Status: <span className="font-medium">{order.status}</span></div>
      <div className="mb-2">Total: <span className="font-bold">R{order.totalPrice?.toLocaleString()}</span></div>
      <div className="mb-4">Shipping Address: <span className="text-gray-700">{order.shippingAddress?.fullName}, {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.country}, {order.shippingAddress?.postalCode}</span></div>
      <div className="mb-4">Payment Method: <span className="text-gray-700">{order.paymentMethod}</span></div>
      <div className="mb-4">Shipping Method: <span className="text-gray-700">{order.shippingMethod?.name} ({order.shippingMethod?.description})</span></div>
      <div>
        <h4 className="font-semibold mb-2">Items:</h4>
        <ul className="list-disc list-inside">
          {order.orderItems?.map((item: any, idx: number) => (
            <li key={idx} className="flex items-center mb-1">
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded mr-2" />
              <span>{item.name}</span>
              <span className="ml-2 text-xs text-gray-500">x{item.quantity}</span>
              <span className="ml-4 text-xs text-gray-700">R{item.price.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderDetails;
