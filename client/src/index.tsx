import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { SearchProvider } from './contexts/SearchContext';
import { BrowserRouter } from 'react-router-dom';
import { OrderProvider } from './contexts/OrderContext'; // ✅ Add this import

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider> {/* ✅ Wrap your app with OrderProvider */}
          <CartProvider>
            <WishlistProvider>
              <SearchProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </SearchProvider>
            </WishlistProvider>
          </CartProvider>
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);