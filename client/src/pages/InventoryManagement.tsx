import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  countInStock: number;
}

const InventoryManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [outOfStock, setOutOfStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchInventory();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const fetchInventory = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const [lowRes, outRes] = await Promise.all([
      fetch('/api/inventory/low-stock', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch('/api/inventory/out-of-stock', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    ]);
    setLowStock(await lowRes.json());
    setOutOfStock(await outRes.json());
    setLoading(false);
  };

  const handleRestock = async (id: string) => {
    if (restockAmount <= 0) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/inventory/${id}/restock`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: restockAmount }),
    });
    setRestockId(null);
    setRestockAmount(0);
    fetchInventory();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      {loading ? (
        <div>Loading inventory...</div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-yellow-700">Low Stock Products</h2>
            {lowStock.length === 0 ? (
              <div className="text-gray-500">No low stock products.</div>
            ) : (
              <table className="min-w-full bg-white rounded shadow mb-4">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Product Name</th>
                    <th className="py-2 px-4">Stock</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p._id} className="border-b">
                      <td className="py-2 px-4">{p.name}</td>
                      <td className="py-2 px-4">{p.countInStock}</td>
                      <td className="py-2 px-4">
                        {restockId === p._id ? (
                          <>
                            <input
                              type="number"
                              min={1}
                              value={restockAmount}
                              onChange={e => setRestockAmount(Number(e.target.value))}
                              className="border rounded px-2 mr-2 w-20"
                              placeholder="Amount"
                            />
                            <button onClick={() => handleRestock(p._id)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Restock</button>
                            <button onClick={() => setRestockId(null)} className="bg-gray-300 px-2 py-1 rounded">Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => setRestockId(p._id)} className="bg-yellow-500 text-white px-2 py-1 rounded">Restock</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2 text-red-700">Out of Stock Products</h2>
            {outOfStock.length === 0 ? (
              <div className="text-gray-500">No out of stock products.</div>
            ) : (
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4">Product Name</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStock.map((p) => (
                    <tr key={p._id} className="border-b">
                      <td className="py-2 px-4">{p.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryManagement;
