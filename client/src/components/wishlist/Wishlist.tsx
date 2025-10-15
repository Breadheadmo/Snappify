import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    countInStock: number;
    rating: number;
    numReviews: number;
  };
  variant?: {
    _id: string;
    size: string;
    color: string;
    material: string;
    style: string;
    price: number;
    countInStock: number;
  };
  addedAt: string;
}

interface WishlistProps {
  className?: string;
}

const Wishlist: React.FC<WishlistProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.items || []);
      } else {
        showNotification('Failed to load wishlist', 'error');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showNotification('Error loading wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (item: WishlistItem) => {
    if (!user) return;

    setRemoving(item._id);
    try {
      let url = `/api/wishlist/${item.product._id}`;
      if (item.variant) {
        const params = new URLSearchParams({
          variant: JSON.stringify({
            variantId: item.variant._id,
            size: item.variant.size,
            color: item.variant.color,
            material: item.variant.material,
            style: item.variant.style,
          })
        });
        url += `?${params}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setWishlist(prev => prev.filter(wishlistItem => wishlistItem._id !== item._id));
        showNotification('Removed from wishlist', 'success');
      } else {
        showNotification('Failed to remove item', 'error');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showNotification('Error removing item', 'error');
    } finally {
      setRemoving(null);
    }
  };

  const clearWishlist = async () => {
    if (!user || wishlist.length === 0) return;

    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setWishlist([]);
        showNotification('Wishlist cleared', 'success');
      } else {
        showNotification('Failed to clear wishlist', 'error');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      showNotification('Error clearing wishlist', 'error');
    }
  };

  const addToCart = async (item: WishlistItem) => {
    // This would integrate with your cart system
    showNotification('Add to cart functionality to be implemented', 'info');
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your wishlist</h2>
        <Link
          to="/login"
          className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-4">Start adding products you love to your wishlist</p>
        <Link
          to="/products"
          className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className={`wishlist ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <button
          onClick={clearWishlist}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/products/${item.product._id}`} className="block">
              <img
                src={item.product.images[0] || '/placeholder-image.jpg'}
                alt={item.product.name}
                className="w-full h-48 object-cover"
              />
            </Link>
            
            <div className="p-4">
              <Link to={`/products/${item.product._id}`} className="block">
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                  {item.product.name}
                </h3>
              </Link>

              {item.variant && (
                <div className="text-sm text-gray-600 mb-2">
                  {[item.variant.size, item.variant.color, item.variant.material, item.variant.style]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              )}

              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(item.product.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({item.product.numReviews})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-primary-600">
                  ${(item.variant?.price || item.product.price).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  {(item.variant?.countInStock || item.product.countInStock) > 0 
                    ? 'In Stock' 
                    : 'Out of Stock'
                  }
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(item)}
                  disabled={(item.variant?.countInStock || item.product.countInStock) === 0}
                  className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item)}
                  disabled={removing === item._id}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove from wishlist"
                >
                  {removing === item._id ? (
                    <div className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Added {new Date(item.addedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;