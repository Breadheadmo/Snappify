import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '../types/Product';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 star ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  // Use first image from images array, fallback to placeholder
  const mainImage = product.images && product.images.length > 0 && product.images[0]
    ? product.images[0]
    : 'https://via.placeholder.com/300x200?text=Product+Image';

  return (
    <div 
      ref={cardRef}
      className={`card product-card group ${isVisible ? 'fade-in-up' : 'opacity-0'}`}
      style={{ 
        transitionDelay: isVisible ? '0.1s' : '0s',
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
      }}
    >
      <div className="relative overflow-hidden rounded-t-xl image-zoom">
        <img
          src={mainImage}
          alt={product.name}
          className={`w-full h-48 object-cover transition-all duration-500 ${
            imageLoaded ? 'image-loaded' : 'image-loading'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
            setImageLoaded(true);
          }}
        />
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
            {product.discount}% OFF
          </div>
        )}
        
        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
            Out of Stock
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          {product.category}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
            isInWishlist(product.id)
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart 
            className={`h-4 w-4 ${
              isInWishlist(product.id) ? 'fill-current' : ''
            }`} 
          />
        </button>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
        )}
        
        {/* Product Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating and Reviews */}
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2 star-rating">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-600">
            ({product.reviews})
          </span>
        </div>
        
        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 price-tag">
              R{product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                R{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Features Preview */}
        {product.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 2).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
              {product.features.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{product.features.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 cart-btn-pulse ${
            product.inStock
              ? 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>
              {isInCart(product.id.toString()) 
                ? 'In Cart' 
                : product.inStock 
                  ? 'Add to Cart' 
                  : 'Out of Stock'
              }
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
