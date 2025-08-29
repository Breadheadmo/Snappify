
import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalUsers: 0,
    lowStockProducts: 0,
    totalRevenue: 0
  });
  const [recentOrderedItems, setRecentOrderedItems] = useState<any[]>([]);
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

      // Fetch products, categories, orders, inventory, users
      const [productsRes, categoriesRes, ordersRes, inventoryRes, usersRes] = await Promise.all([
        fetch('/api/products', { headers }),
        fetch('/api/categories', { headers }),
        fetch('/api/orders', { headers }),
        fetch('/api/reports/inventory', { headers }),
        fetch('/api/reports/users', { headers })
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const ordersData = await ordersRes.json();
      const inventoryData = await inventoryRes.json();
      const usersData = await usersRes.json();

      // ordersData may be paginated, so use ordersData.orders if present
      const orders = ordersData.orders || ordersData;
      const totalOrders = Array.isArray(orders) ? orders.length : 0;
      const totalRevenue = Array.isArray(orders)
        ? orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
        : 0;

      setStats({
        totalProducts: productsData.totalProducts || productsData.products?.length || 0,
        totalCategories: categoriesData.length || 0,
        totalOrders,
        totalUsers: usersData.totalUsers || 0,
        lowStockProducts: inventoryData.lowStock?.length || 0,
        totalRevenue
      });

      // Collect recent ordered items (last 10 orders)
      const recentItems: any[] = [];
      const ordersList = Array.isArray(orders) ? orders : [];
      ordersList.slice(0, 10).forEach((order: any) => {
        order.orderItems.forEach((item: any) => {
          recentItems.push({
            orderId: order._id,
            productName: item.name,
            quantity: item.quantity
          });
        });
      });
      setRecentOrderedItems(recentItems);
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
        <div className="text-4xl">
          {icon}
        </div>
      </div>
    </div>
  );

  // Debug: log stats and recentOrderedItems to check for invalid children
  console.log('stats:', stats);
  console.log('recentOrderedItems:', recentOrderedItems);

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

  // Chart data for dashboard
  // Ensure all chart data are numbers, not objects
  const safeNumber = (val: any) => (typeof val === 'number' ? val : Number(val) || 0);
  const barData = {
    labels: ['Products', 'Categories', 'Orders', 'Users', 'Low Stock'],
    datasets: [
      {
        label: 'Dashboard Stats',
        data: [
          safeNumber(stats.totalProducts),
          safeNumber(stats.totalCategories),
          safeNumber(stats.totalOrders),
          safeNumber(stats.totalUsers),
          safeNumber(stats.lowStockProducts)
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
      },
    ],
  };

  const doughnutData = {
    labels: ['Products', 'Categories', 'Orders', 'Users', 'Low Stock'],
    datasets: [
      {
        label: 'Dashboard Stats',
        data: [
          safeNumber(stats.totalProducts),
          safeNumber(stats.totalCategories),
          safeNumber(stats.totalOrders),
          safeNumber(stats.totalUsers),
          safeNumber(stats.lowStockProducts)
        ],
        backgroundColor: [
          '#36A2EB', '#4BC0C0', '#FFCE56', '#9966FF', '#FF6384'
        ],
      },
    ],
  };

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
            icon={"📦"}
            color="border-l-blue-500 text-blue-500"
          />
          <StatCard
            title="Categories"
            value={stats.totalCategories}
            icon={"📋"}
            color="border-l-green-500 text-green-500"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={"🛒"}
            color="border-l-yellow-500 text-yellow-500"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockProducts}
            icon={"⚠️"}
            color="border-l-red-500 text-red-500"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={"👤"}
            color="border-l-purple-500 text-purple-500"
          />
          </div>

        {/* Dashboard Charts (temporarily commented out due to runtime errors) */}
        {/*
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview (Bar Chart)</h3>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview (Doughnut Chart)</h3>
            <Doughnut data={doughnutData} />
          </div>
        </div>
        */}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Management</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/admin/orders')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Manage Orders
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/admin/users')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
              >
                Manage Users
              </button>
            </div>
          </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Management</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/admin/products/new')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add New Product
                </button>
                <button 
                  onClick={() => navigate('/admin/products')}
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
                  onClick={() => navigate('/admin/categories/new')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add New Category
                </button>
                <button 
                  onClick={() => navigate('/admin/categories')}
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
                  onClick={() => navigate('/admin/inventory')}
                  className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Manage Inventory
                </button>
                <button 
                  onClick={() => navigate('/admin/inventory/low-stock')}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Low Stock Alert
                </button>
              </div>
            </div>
          </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Ordered Items</h3>
          {recentOrderedItems.length === 0 ? (
            <div className="text-gray-500">No recent orders found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Order ID</th>
                  <th className="text-left py-2 px-4">Product Name</th>
                  <th className="text-left py-2 px-4">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {recentOrderedItems.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-4">{String(item.orderId)}</td>
                    <td className="py-2 px-4">{String(item.productName)}</td>
                    <td className="py-2 px-4">{String(item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
