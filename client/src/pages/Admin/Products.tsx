import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
  Upload,
  Download,
  ArrowLeft,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  countInStock: number;
  inStock: boolean;
  images: string[];
  description: string;
  createdAt: string;
}

const AdminProducts: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [user, navigate, currentPage, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`/api/admin/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

     const data = await response.json();

// ✅ ADD: Debug logging to see raw database values
console.log('🔍 DEBUG: Raw API Response:', data);
console.log('🔍 DEBUG: First Product:', data.products?.[0]);
console.log('🔍 DEBUG: First Product Price:', data.products?.[0]?.price);

setProducts(data.products || []);
setTotalPages(data.totalPages || 1);

if (data.products?.length > 0) {
  showNotification(`Loaded ${data.products.length} products successfully`, 'success');
}
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      showNotification('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter(p => p._id !== productId));
      showNotification('Product deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('Failed to delete product', 'error');
    }
  };

  const handleClearAllProducts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL products? This action cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/products/clear-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear products');
      }

      setProducts([]);
      showNotification('All products cleared successfully', 'success');
    } catch (error) {
      console.error('Error clearing products:', error);
      showNotification('Failed to clear all products', 'error');
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ countInStock: newStock })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      // Update local state
      setProducts(products.map(p => 
        p._id === productId 
          ? { ...p, countInStock: newStock, inStock: newStock > 0 }
          : p
      ));
      
      showNotification('Stock updated successfully', 'success');
    } catch (error) {
      console.error('Error updating stock:', error);
      showNotification('Failed to update stock', 'error');
    }
  };

  const handleExportProducts = () => {
    try {
      const csvContent = [
        ['Name', 'Brand', 'Category', 'Price (ZAR)', 'Stock', 'Status'],
        ...products.map(p => [
  p.name,
  p.brand,
  p.category,
  formatZAR(p.price, true), // ✅ CONVERT FROM USD
  p.countInStock.toString(),
  p.inStock ? 'In Stock' : 'Out of Stock'
])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showNotification('Products exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export products', 'error');
    }
  };

  // ✅ ENHANCED ZAR FORMATTER WITH USD CONVERSION
const formatZAR = (amount: number, convertFromUSD: boolean = true): string => {
  const USD_TO_ZAR = 18.5; // Current conversion rate (1 USD = 18.5 ZAR)
  
  // Convert USD to ZAR if needed
  const finalAmount = convertFromUSD ? amount * USD_TO_ZAR : amount;
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(finalAmount);
};

  // Statistics calculations
  const stats = {
  total: products.length,
  inStock: products.filter(p => p.inStock && p.countInStock > 0).length,
  lowStock: products.filter(p => p.inStock && p.countInStock > 0 && p.countInStock <= 10).length,
  outOfStock: products.filter(p => !p.inStock || p.countInStock === 0).length,
  totalValue: products.reduce((sum, p) => sum + ((p.price * 18.5) * p.countInStock), 0) // ✅ CONVERT TO ZAR
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-sm text-gray-600">Manage your product inventory</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClearAllProducts}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Products
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-xl font-bold text-gray-900">{formatZAR(stats.totalValue, false)}</p> {/* ✅ Already converted */} 
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Search & Filter Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Headphones & Headsets">Headphones & Headsets</option>
              <option value="Phone Protection">Phone Protection</option>
              <option value="Mobile Accessories">Mobile Accessories</option>
              <option value="Audio & Sound">Audio & Sound</option>
              <option value="Electronics">Electronics</option>
            </select>
            <button
              onClick={handleExportProducts}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setCurrentPage(1);
                showNotification('Filters cleared', 'info');
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="text-blue-600 hover:text-blue-800"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No products found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Add your first product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price (ZAR)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0">
                            <img
                              className="h-16 w-16 rounded-lg object-cover"
                              src={product.images[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      
                      {/* ✅ ENHANCED ZAR PRICE FORMATTING */}
                      <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm font-bold text-gray-900">
    {formatZAR(product.price, true)} {/* ✅ CONVERT FROM USD */}
  </div>
  {product.originalPrice && product.originalPrice > product.price && (
    <div className="text-xs text-gray-500 line-through">
      {formatZAR(product.originalPrice, true)} {/* ✅ CONVERT FROM USD */}
    </div>
  )}
</td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={product.countInStock}
                          onChange={(e) => handleUpdateStock(product._id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.inStock && product.countInStock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.inStock && product.countInStock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock && product.countInStock > 10
                            ? 'In Stock'
                            : product.inStock && product.countInStock > 0
                            ? 'Low Stock'
                            : 'Out of Stock'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => navigate(`/products/${product._id}`)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Product"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
