import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '../types/Product';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  disableButtonAnimation?: boolean;
}

const ProductCard = ({ product, onAddToCart, disableButtonAnimation }: ProductCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { isInCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Helper function to parse features from JSON string or array
  const parseFeatures = (features: any): string[] => {
    if (!features) return [];
    
    if (typeof features === 'string') {
      try {
        // Parse JSON string
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) {
          // Clean each feature: remove escape characters, quotes, brackets
          return parsed.map(f => 
            String(f)
              .replace(/^\["|"\]$/g, '') // Remove leading/trailing ["..."]
              .replace(/\\"/g, '"')       // Remove escape slashes
              .replace(/^["']|["']$/g, '') // Remove quotes
              .trim()
          ).filter(f => f.length > 0);
        }
        return [String(parsed)];
      } catch {
        // If parsing fails, treat as comma/semicolon separated string
        return features
          .split(/[,;\n]/)
          .map((f: string) => f.trim().replace(/^["']|["']$/g, ''))
          .filter((f: string) => f.length > 0);
      }
    }
    
    if (Array.isArray(features)) {
      return features.map(f => 
        String(f)
          .replace(/\\"/g, '"')
          .replace(/^["']|["']$/g, '')
          .trim()
      ).filter(f => f.length > 0);
    }
    
    return [];
  };

  const displayFeatures = parseFeatures(product.features);

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

  const mainImage = product.images && product.images.length > 0 && product.images[0]
    ? product.images[0]
    : 'https://via.placeholder.com/300x200?text=Product+Image';

  return (
    <div 
      ref={cardRef}
      className={`card product-card group relative overflow-hidden ${isVisible ? 'fade-in-up' : 'opacity-0'} shadow-lg`}
      style={{ 
        transitionDelay: isVisible ? '0.1s' : '0s',
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
      }}
    >
      <div className="relative overflow-hidden rounded-t-xl image-zoom">
        <div className={`absolute inset-0 z-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded-t-xl ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-700`}></div>
        <img
          src={mainImage}
          alt={product.name}
          className={`w-full h-48 object-cover transition-all duration-500 ${
            imageLoaded ? 'image-loaded' : 'image-loading'
          } scale-100 group-hover:scale-105`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
            setImageLoaded(true);
          }}
        />
        
        {product.discount && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
            {product.discount}% OFF
          </div>
        )}
        
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-gray-700 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            Out of Stock
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 bg-primary-600/90 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md animate-fade-in">
          {product.category}
        </div>
        
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110 ${
            isInWishlist(product.id)
              ? 'bg-red-500 text-white animate-heartbeat'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart 
            className={`h-4 w-4 ${
              isInWishlist(product.id) ? 'fill-current animate-heartbeat' : ''
            }`} 
          />
        </button>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4 animate-fade-in">
        {product.brand && (
          <div className="text-xs text-gray-500 mb-1">{product.brand}</div>
        )}
        
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
            <span className="transition-colors duration-300 group-hover:text-primary-600 group-hover:underline">
              {product.name}
            </span>
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2 star-rating">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-600">
            <span className="ml-1 text-xs text-gray-400">({product.reviews})</span>
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 price-tag">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent animate-gradient-text">
                R{product.price.toLocaleString()}
              </span>
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                <span className="animate-fade-in">R{product.originalPrice.toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>
        
        {/* Features Preview - COMPLETELY FIXED */}
        {displayFeatures.length > 0 && (
          <div className="mb-3 min-h-[60px]">
            <ul className="space-y-1">
              {displayFeatures.slice(0, 2).map((feature, index) => (
                <li
                  key={index}
                  className="text-xs text-gray-600 flex items-start leading-relaxed"
                  title={feature}
                >
                  <span className="text-primary-600 mr-1 flex-shrink-0">•</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>
            {displayFeatures.length > 2 && (
              <p className="text-xs text-gray-400 mt-1">
                +{displayFeatures.length - 2} more features
              </p>
            )}
          </div>
        )}
        
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 cart-btn-pulse shadow-md ${
            product.inStock
              ? (
                  disableButtonAnimation
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 animate-bounce'
                )
              : (
                  disableButtonAnimation
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed animate-pulse'
                )
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ShoppingCart className="h-4 w-4 animate-fade-in" />
            <span className="animate-fade-in">
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