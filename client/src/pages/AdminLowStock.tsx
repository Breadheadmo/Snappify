import React, { useEffect, useState } from 'react';
import { productApi } from '../services/api';

const AdminLowStock: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const result = await productApi.getProducts();
        const lowStock = result.products.filter((p: any) => p.countInStock <= 5);
        setLowStockProducts(lowStock);
      } catch (error) {
        setLowStockProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Low Stock Alert</h2>
      {loading ? (
        <div>Loading...</div>
      ) : lowStockProducts.length === 0 ? (
        <div className="text-green-600">No products are low in stock.</div>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Stock</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map((product: any) => (
              <tr key={product.id || product._id}>
                <td className="border px-4 py-2">{product.name}</td>
                <td className="border px-4 py-2 text-red-600 font-bold">{product.countInStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminLowStock;
