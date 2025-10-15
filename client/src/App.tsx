import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Track from './pages/Track';
import TrackOrder from './pages/TrackingOrder';
import { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext'; 
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
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';

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
    <ThemeProvider defaultTheme="dark">
      <div className={`min-h-screen flex flex-col bg-white text-shimmerBlack-950 ${isLoaded ? 'page-load' : 'opacity-0'}`}>
        <Header />
        <main className="flex-grow bg-white">
          <Routes>
            <Route path="/request-reset" element={React.createElement(require('./pages/RequestPasswordReset').default)} />
            <Route path="/reset-password/:token" element={React.createElement(require('./pages/ResetPassword').default)} />
            <Route path="/request-email-verification" element={React.createElement(require('./pages/RequestEmailVerification').default)} />
            <Route path="/verify-email/:token" element={React.createElement(require('./pages/VerifyEmail').default)} />
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/track" element={<Track />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/track/:trackingNumber" element={<OrderTracking />} />
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
    </ThemeProvider>
  );
}

export default App;