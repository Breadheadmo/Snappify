import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const WishlistSection: React.FC = () => {
  const { state: wishlistState, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();

  const handleAddToCart = (productId: string | number) => {
    const product = wishlistState.items?.find(item => String(item.id) === String(productId));
    if (product) {
      addToCart(product);
      showNotification(`${product.name} added to cart!`, 'success');
    }
  };

  // Add null check for wishlistState
  if (!wishlistState) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div>
      {wishlistState.itemCount > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FIXED: Added null filtering to prevent errors */}
            {wishlistState.items?.filter(product => product != null && product.id).map(product => (
                <div 
                  key={product.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
              >
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => {
                      removeFromWishlist(product.id);
                      showNotification(`${product.name} removed from wishlist.`, 'info');
                    }}
                    className="bg-white rounded-full p-1.5 shadow hover:bg-red-50 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                
                <div className="flex space-x-4">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img 
                      src={product.image || 'https://via.placeholder.com/200x200?text=Product+Image'} 
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/200x200?text=Product+Image';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Link 
                      to={`/products/${product.id}`}
                      className="text-gray-900 font-medium hover:text-primary-600 transition-colors"
                    >
                      {product.name || 'Unnamed Product'}
                    </Link>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-primary-600 font-bold">
                        R{product.price ? product.price.toLocaleString() : '0'}
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="inline-flex items-center text-sm bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                const validItems = wishlistState.items?.filter(product => product != null) || [];
                validItems.forEach(product => addToCart(product));
                showNotification('All wishlist items added to cart!', 'success');
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add All to Cart
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <Heart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Your wishlist is empty</p>
          <Link 
            to="/products" 
            className="inline-block mt-4 text-primary-600 hover:text-primary-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistSection;