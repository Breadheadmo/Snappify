import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalUsers: number;
  lowStockProducts: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, user]);

  // Redirect if not admin
  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch various stats from different endpoints
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // You can implement these endpoints later or use mock data for now
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products', { headers }),
        fetch('/api/categories', { headers })
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      setStats({
        totalProducts: productsData.totalProducts || productsData.products?.length || 0,
        totalCategories: categoriesData.length || 0,
        totalOrders: 0, // Implement later
        totalUsers: 0, // Implement later
        lowStockProducts: 0, // Implement later
        totalRevenue: 0 // Implement later
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: number | string; icon: string; color: string }> = 
    ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-4xl ${color.replace('border-l-', 'text-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome, {user?.username}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon="📦"
            color="border-l-blue-500 text-blue-500"
          />
          <StatCard
            title="Categories"
            value={stats.totalCategories}
            icon="📋"
            color="border-l-green-500 text-green-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon="🛒"
            color="border-l-yellow-500 text-yellow-500"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockProducts}
            icon="⚠️"
            color="border-l-red-500 text-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Management</h3>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.href = '/admin/products/new'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add New Product
              </button>
              <button 
                onClick={() => window.location.href = '/admin/products'}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Manage Products
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Management</h3>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.href = '/admin/categories/new'}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                Add New Category
              </button>
              <button 
                onClick={() => window.location.href = '/admin/categories'}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Manage Categories
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Management</h3>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.href = '/admin/inventory'}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Manage Inventory
              </button>
              <button 
                onClick={() => window.location.href = '/admin/inventory/low-stock'}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Low Stock Alert
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-gray-600">
            <p>Recent activity will be displayed here...</p>
            <p className="text-sm mt-2">This section will show recent product additions, updates, and inventory changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
