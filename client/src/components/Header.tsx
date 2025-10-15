import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Heart, User, Home, Package, Grid, Info, Phone, MapPin } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import MiniCart from './Cart/MiniCart';
import { TubelightNavBar } from './ui/tubelight-navbar';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { state: wishlistState } = useWishlist();
  const { isAuthenticated, logout, user } = useAuth();

  // Navigation items for TubelightNavBar - Added Track Order
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Products', url: '/products', icon: Package },
    { name: 'Categories', url: '/categories', icon: Grid },
    { name: 'Track Order', url: '/track-order', icon: MapPin },
    { name: 'About', url: '/about', icon: Info },
    { name: 'Contact', url: '/contact', icon: Phone },
  ];

  const categories = [
    'Power & Charging',
    'Audio & Sound',
    'Phone Protection',
    'Storage & Connectivity'
  ];

  // Check if current page is login/signup/auth related
  const isAuthPage = ['/login', '/signup', '/request-reset', '/reset-password', '/verify-email', '/request-email-verification'].some(path => 
    location.pathname.startsWith(path)
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Main Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16">
            {/* Left - Logo */}
            <div className="flex justify-start">
              <Link to="/" className="flex items-center">
                <img src={require('../assets/images/Logo.png')} alt="Logo" className="w-8 h-8 mr-2 rounded-lg object-contain" />
              </Link>
            </div>

            {/* Center - Tubelight Navbar (Desktop only, not auth pages) */}
            {!isAuthPage ? (
              <div className="hidden md:flex justify-center">
                <TubelightNavBar items={navItems} />
              </div>
            ) : (
              <div className="hidden md:block"></div>
            )}

            {/* Right - Search, Cart, Wishlist, User */}
            <div className="flex items-center justify-end space-x-4">
              {!isAuthPage && (
                <>
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>

                  <Link to="/wishlist" className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative">
                    <Heart className="h-5 w-5" />
                    {wishlistState.itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistState.itemCount > 99 ? '99+' : wishlistState.itemCount}
                      </span>
                    )}
                  </Link>

                  {/* Cart - MiniCart already includes the badge */}
                  <MiniCart />
                </>
              )}

              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
                <div
                  className={`absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-200 z-50 ${
                    isUserMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                  }`}
                >
                  <div className="py-2">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-600">
                          Welcome, {user?.username || 'User'}
                        </div>
                        {user?.isAdmin && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                            Admin Dashboard
                          </Link>
                        )}
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                          Profile
                        </Link>
                        <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                          Orders
                        </Link>
                        <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                          Wishlist
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                          Sign In
                        </Link>
                        <Link to="/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                          Create Account
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!isAuthPage && (
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors">
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {!isAuthPage && isSearchOpen && (
            <div ref={searchRef} className="pb-4 border-t border-gray-200">
              <div className="flex gap-3 mt-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {!isAuthPage && isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.name} 
                    to={item.url} 
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-sm font-medium text-gray-600">Categories</div>
                {categories.map((category) => (
                  <Link 
                    key={category} 
                    to={`/products?category=${category}`} 
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;