import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { useEffect, useState } from 'react';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminCategories from './pages/AdminCategories';
import AdminInventory from './pages/AdminInventory';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate page load
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <div className={`min-h-screen flex flex-col ${isLoaded ? 'page-load' : 'opacity-0'}`}>
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/request-reset" element={React.createElement(require('./pages/RequestPasswordReset').default)} />
                    <Route path="/reset-password/:token" element={React.createElement(require('./pages/ResetPassword').default)} />
                    <Route path="/request-email-verification" element={React.createElement(require('./pages/RequestEmailVerification').default)} />
                    <Route path="/verify-email/:token" element={React.createElement(require('./pages/VerifyEmail').default)} />
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/orders/:orderId" element={<OrderDetails />} />
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/products/new" element={<AdminProductForm />} />
                    <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
                    <Route path="/admin/categories" element={<AdminCategories />} />
                    <Route path="/admin/categories/new" element={<AdminCategories />} />
                    <Route path="/admin/inventory" element={<AdminInventory />} />
                    <Route path="/admin/inventory/low-stock" element={<AdminInventory />} />
                    <Route path="/admin/users" element={React.createElement(require('./pages/AdminUsers').default)} />
                    <Route path="/admin/orders" element={React.createElement(require('./pages/AdminOrders').default)} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
