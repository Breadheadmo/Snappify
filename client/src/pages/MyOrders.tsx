import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, Filter, Loader, ShoppingBag, Calendar, DollarSign, ChevronRight, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types/Order';
import { useOrders } from '../contexts/OrderContext';

const MyOrders = () => {
  const navigate = useNavigate();
  const { orders, loading, error, fetchOrders } = useOrders();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  // ✅ HELPER FUNCTIONS - Added to safely access product properties
  const getProductName = (item: any): string => {
    return item.productName || item.product?.name || item.name || 'Unknown Product';
  };

  const getProductImage = (item: any): string => {
    return item.productImage || item.product?.image || item.image || 'https://via.placeholder.com/80?text=Product';
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter - ✅ FIXED: Safe property access
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => getProductName(item).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.SHIPPED:
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.PROCESSING:
      case OrderStatus.CONFIRMED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.CANCELLED:
      case OrderStatus.RETURNED:
        return 'bg-red-100 text-red-800 border-red-200';
      case OrderStatus.REFUNDED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED).length,
      processing: orders.filter(o => o.status === OrderStatus.PROCESSING).length,
      shipped: orders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.OUT_FOR_DELIVERY).length,
      delivered: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
    };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage all your orders in one place</p>
        </div>
      </div>

      {/* Stats Cards */}
      {orders.length > 0 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-semibold mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-600 font-semibold mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 font-semibold mb-1">Processing</p>
                <p className="text-2xl font-bold text-orange-900">{stats.processing}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 font-semibold mb-1">Shipped</p>
                <p className="text-2xl font-bold text-purple-900">{stats.shipped}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-semibold mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, tracking number, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative md:w-64">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white cursor-pointer transition-all"
              >
                <option value="all">All Orders</option>
                <option value={OrderStatus.PENDING}>Pending</option>
                <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                <option value={OrderStatus.PROCESSING}>Processing</option>
                <option value={OrderStatus.SHIPPED}>Shipped</option>
                <option value={OrderStatus.OUT_FOR_DELIVERY}>Out for Delivery</option>
                <option value={OrderStatus.DELIVERED}>Delivered</option>
                <option value={OrderStatus.CANCELLED}>Cancelled</option>
                <option value={OrderStatus.RETURNED}>Returned</option>
                <option value={OrderStatus.REFUNDED}>Refunded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container mx-auto px-4 py-8">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? 'Start shopping to see your orders here' 
                : 'Try adjusting your search or filters'}
            </p>
            {orders.length === 0 && (
              <Link to="/products">
                <button className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-8 py-3 rounded-lg font-bold hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg hover:shadow-xl">
                  Start Shopping
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-primary-200 cursor-pointer">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                        {order.trackingNumber && (
                          <span className="flex items-center gap-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <p className="text-2xl font-bold text-gray-900">
                          R{order.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-primary-600 font-semibold text-sm">
                        <span>View Details</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview - ✅ FIXED: Safe property access */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {order.items.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex-shrink-0">
                        <img
                          src={getProductImage(item)}
                          alt={getProductName(item)}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                          title={getProductName(item)}
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/80?text=Product';
                          }}
                        />
                      </div>
                    ))}
                    {order.items.length > 5 && (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <span className="text-sm font-bold text-gray-600">
                          +{order.items.length - 5}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Estimated Delivery */}
                  {order.estimatedDelivery && order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Estimated Delivery: <span className="font-semibold text-green-600">{formatDate(order.estimatedDelivery)}</span>
                      </p>
                    </div>
                  )}

                  {/* Delivered Date */}
                  {order.deliveredAt && order.status === OrderStatus.DELIVERED && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Delivered on: <span className="font-semibold text-green-600">{formatDate(order.deliveredAt)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;