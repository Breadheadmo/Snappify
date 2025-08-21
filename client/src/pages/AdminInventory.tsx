import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

interface Product {
  _id: string;
  id: number;
  name: string;
  price: number;
  category: string;
  brand: string;
  countInStock: number;
  inStock: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface InventoryUpdate {
  productId: string;
  currentStock: number;
  newStock: number;
}

const AdminInventory: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [bulkUpdates, setBulkUpdates] = useState<Map<string, number>>(new Map());
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchProducts();
    }
  }, [isAuthenticated, user]);

  // Redirect if not admin
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all products for inventory management
      const response = await fetch('/api/products?pageNumber=1&limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        console.error('Failed to fetch products');
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSingleStock = async (productId: string, newStock: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          countInStock: newStock
        })
      });

      if (response.ok) {
        // Update local state
        setProducts(prev => prev.map(p => 
          p._id === productId 
            ? { ...p, countInStock: newStock, inStock: newStock > 0 }
            : p
        ));
      } else {
        alert('Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const handleStockChange = (productId: string, newValue: number) => {
    setBulkUpdates(prev => {
      const updated = new Map(prev);
      if (newValue < 0) return updated;
      updated.set(productId, newValue);
      return updated;
    });
  };

  const applyBulkUpdates = async () => {
    if (bulkUpdates.size === 0) return;

    try {
      const token = localStorage.getItem('token');
      const updates = Array.from(bulkUpdates.entries());
      
      // Update products one by one (could be optimized with a bulk API endpoint)
      const promises = updates.map(([productId, newStock]) =>
        fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            countInStock: newStock
          })
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;

      if (successCount === updates.length) {
        // Update local state
        setProducts(prev => prev.map(product => {
          const newStock = bulkUpdates.get(product._id);
          return newStock !== undefined
            ? { ...product, countInStock: newStock, inStock: newStock > 0 }
            : product;
        }));

        setBulkUpdates(new Map());
        setShowBulkUpdate(false);
        alert(`Successfully updated ${successCount} products`);
      } else {
        alert(`Updated ${successCount} out of ${updates.length} products. Some updates failed.`);
      }
    } catch (error) {
      console.error('Error applying bulk updates:', error);
      alert('Failed to apply bulk updates');
    }
  };

  const generateLowStockReport = () => {
    const lowStockProducts = products.filter(p => p.countInStock <= lowStockThreshold && p.countInStock > 0);
    const outOfStockProducts = products.filter(p => p.countInStock === 0);
    
    return {
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      total: lowStockProducts.length + outOfStockProducts.length
    };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case 'low':
        return product.countInStock <= lowStockThreshold && product.countInStock > 0;
      case 'out':
        return product.countInStock === 0;
      default:
        return true;
    }
  });

  const getStockStatusColor = (countInStock: number) => {
    if (countInStock === 0) return 'bg-red-100 text-red-800';
    if (countInStock <= lowStockThreshold) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (countInStock: number) => {
    if (countInStock === 0) return 'Out of Stock';
    if (countInStock <= lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const report = generateLowStockReport();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/admin" className="text-blue-600 hover:text-blue-800">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBulkUpdate(!showBulkUpdate)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                {showBulkUpdate ? 'Cancel Bulk' : 'Bulk Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total Products</div>
            <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Low Stock Items</div>
            <div className="text-2xl font-bold text-yellow-600">{report.lowStock.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Out of Stock</div>
            <div className="text-2xl font-bold text-red-600">{report.outOfStock.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Needs Attention</div>
            <div className="text-2xl font-bold text-orange-600">{report.total}</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, brand, or category..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Stock Level
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'low' | 'out')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Products</option>
                <option value="low">Low Stock Only</option>
                <option value="out">Out of Stock Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {showBulkUpdate && bulkUpdates.size > 0 && (
              <div className="flex items-end">
                <button
                  onClick={applyBulkUpdates}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply Updates ({bulkUpdates.size})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {showBulkUpdate ? 'New Stock' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-md object-cover"
                            src={product.images[0]}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{product.countInStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(product.countInStock)}`}>
                        {getStockStatusText(product.countInStock)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {showBulkUpdate ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            defaultValue={product.countInStock}
                            onChange={(e) => handleStockChange(product._id, Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {bulkUpdates.has(product._id) && (
                            <span className="text-xs text-blue-600">Modified</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={product.countInStock}
                            onChange={(e) => updateSingleStock(product._id, Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No products found</div>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Quick Actions */}
        {(report.lowStock.length > 0 || report.outOfStock.length > 0) && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ Inventory Alerts</h3>
            <div className="space-y-2 text-sm text-yellow-700">
              {report.outOfStock.length > 0 && (
                <p>🔴 <strong>{report.outOfStock.length}</strong> products are completely out of stock</p>
              )}
              {report.lowStock.length > 0 && (
                <p>🟡 <strong>{report.lowStock.length}</strong> products are running low (≤{lowStockThreshold} items)</p>
              )}
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => setFilter('out')}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                View Out of Stock
              </button>
              <button
                onClick={() => setFilter('low')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 transition-colors"
              >
                View Low Stock
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInventory;
