import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Package, Truck, ShieldCheck, Award, Zap } from 'lucide-react';
import type { Product } from '../types/Product';
import type { Category } from '../types'; // 🆕 ADDED
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

  // ============================================
  // 🆕 HELPER FUNCTION FOR CATEGORY HANDLING
  // ============================================

  /**
   * Safely extract category name from string or Category object
   */
  const getCategoryName = (): string => {
    if (!product.category) return 'Uncategorized';
    
    // If it's a string, return it directly
    if (typeof product.category === 'string') {
      return product.category;
    }
    
    // If it's a Category object, return its name property
    return product.category.name || 'Uncategorized';
  };

  // ============================================
  // EXISTING HELPER FUNCTIONS
  // ============================================

  // Helper function to parse and clean features from any format
  const parseFeatures = (features: any): string[] => {
    if (!features) return [];
    
    if (typeof features === 'string') {
      try {
        // First, try to parse as JSON
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) {
          return parsed.map(f => cleanFeatureText(f)).filter(f => f.length > 0);
        }
        return [cleanFeatureText(String(parsed))].filter(f => f.length > 0);
      } catch {
        // If JSON parsing fails, clean the raw string
        return [cleanFeatureText(features)].filter(f => f.length > 0);
      }
    }
    
    if (Array.isArray(features)) {
      return features.map(f => cleanFeatureText(f)).filter(f => f.length > 0);
    }
    
    return [];
  };

  // Clean individual feature text from all JSON artifacts
  const cleanFeatureText = (text: any): string => {
    if (!text) return '';
    
    let cleaned = String(text)
      // Remove array bracket notation with quotes
      .replace(/^\["|"\]$/g, '')
      .replace(/^\["(.+)"\]$/g, '$1')
      // Remove escaped quotes
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      // Remove standalone quotes at start/end
      .replace(/^["']|["']$/g, '')
      // Remove extra brackets
      .replace(/^\[|\]$/g, '')
      // Clean up whitespace
      .trim();
    
    return cleaned;
  };

  // Get clean description - FIXED VERSION
  const getCleanDescription = (): string => {
    if (!product.description) return 'Premium quality product';

    const description = product.description;

    // If it's a string
    if (typeof description === 'string') {
      const clean = cleanFeatureText(description);
      
      // Get first sentence or first 100 characters (increased from 80)
      const firstSentence = clean.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length > 0) {
        return firstSentence.length > 100 
          ? firstSentence.substring(0, 100) + '...' 
          : firstSentence;
      }
      
      return clean.substring(0, 100) + (clean.length > 100 ? '...' : '');
    }

    // If it's an array, get first item - FIXED with type assertion
    if (Array.isArray(description)) {
      const descArray: string[] = description;
      if (descArray.length > 0) {
        const firstItem = cleanFeatureText(descArray[0]);
        return firstItem.substring(0, 100) + (firstItem.length > 100 ? '...' : '');
      }
    }

    return 'Premium quality product';
  };

  const displayFeatures = parseFeatures(product.features);
  const displayDescription = getCleanDescription();

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

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const mainImage = product.images && product.images.length > 0 && product.images[0]
    ? product.images[0]
    : 'https://via.placeholder.com/300x200?text=Product+Image';

  // Calculate savings and discount percentage
  const savings = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;
  
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div 
      ref={cardRef}
      className={`card product-card group relative overflow-hidden ${isVisible ? 'fade-in-up' : 'opacity-0'} shadow-lg hover:shadow-2xl`}
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
          className={`w-full h-56 object-cover transition-all duration-500 ${
            imageLoaded ? 'image-loaded' : 'image-loading'
          } scale-100 group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
            setImageLoaded(true);
          }}
        />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-bounce z-10">
            {discountPercent}% OFF
          </div>
        )}
        
        {/* Stock Status Badge */}
        {!product.inStock ? (
          <div className="absolute top-2 right-12 bg-gradient-to-r from-gray-700 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse z-10">
            Out of Stock
          </div>
        ) : product.inStock && product.reviews > 100 && (
          <div className="absolute top-2 right-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>Popular</span>
          </div>
        )}
        
        {/* Category Badge - 🔧 FIXED */}
        <div className="absolute bottom-2 left-2 bg-primary-600/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md animate-fade-in">
          {getCategoryName()}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110 z-10 ${
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
        
        {/* Image Count Badge */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
            {product.images.length} 📷
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4 animate-fade-in">
        {/* Brand, Stock Status & Top Rated */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {product.brand && (
              <div className="text-xs text-primary-600 font-bold bg-primary-50 px-2 py-1 rounded">
                {product.brand}
              </div>
            )}
            {product.inStock && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <Package className="h-3 w-3" />
                <span className="font-semibold">In Stock</span>
              </div>
            )}
          </div>
          {product.rating >= 4.5 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <Award className="h-3 w-3" />
              <span className="font-semibold">Top Rated</span>
            </div>
          )}
        </div>
        
        {/* Product Title */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-3 min-h-[48px] text-base">
            <span className="transition-colors duration-300 group-hover:text-primary-600 group-hover:underline">
              {product.name}
            </span>
          </h3>
        </Link>
        
        {/* Price Section */}
        <div className="mb-3 bg-gradient-to-r from-primary-50 to-purple-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl font-black text-gray-900 price-tag">
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent animate-gradient-text">
                R{product.price.toLocaleString()}
              </span>
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 line-through">
                  R{product.originalPrice.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          {savings > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-green-700 font-bold bg-green-100 px-2 py-1 rounded">
                Save R{savings.toLocaleString()} ({discountPercent}%)
              </div>
            </div>
          )}
        </div>
        
        {/* Product Description */}
        <div className="mb-3 bg-gray-50 p-3 rounded-lg">
          <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">About this product</h4>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-2">
            {displayDescription}
          </p>
        </div>
        
        {/* Key Features */}
        {displayFeatures.length > 0 && (
          <div className="mb-3 bg-blue-50 p-3 rounded-lg">
            <h4 className="text-xs font-bold text-blue-900 mb-2 uppercase tracking-wide flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Key Features
            </h4>
            <ul className="space-y-1.5">
              {displayFeatures.slice(0, 4).map((feature, index) => (
                <li
                  key={index}
                  className="text-xs text-gray-700 flex items-start leading-relaxed"
                  title={feature}
                >
                  <span className="text-primary-600 mr-2 flex-shrink-0 font-bold text-base">✓</span>
                  <span className="line-clamp-2 font-medium">{feature}</span>
                </li>
              ))}
              {displayFeatures.length > 4 && (
                <p className="text-xs text-primary-600 font-bold mt-2 ml-5">
                  +{displayFeatures.length - 4} more features
                </p>
              )}
            </ul>
          </div>
        )}

        {/* Quick Info Icons */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b-2 border-gray-200">
          <div className="flex items-center gap-1 text-xs text-gray-700 bg-primary-50 px-2 py-1.5 rounded" title="Fast Shipping">
            <Truck className="h-4 w-4 text-primary-600" />
            <span className="font-semibold">Fast Ship</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-700 bg-green-50 px-2 py-1.5 rounded" title="Secure Payment">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span className="font-semibold">Secure</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-700 bg-amber-50 px-2 py-1.5 rounded" title="Quality Guaranteed">
            <Award className="h-4 w-4 text-amber-600" />
            <span className="font-semibold">Quality</span>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={!product.inStock}
          className={`w-full py-3 px-4 rounded-lg font-bold text-base transition-all duration-300 cart-btn-pulse shadow-lg ${
            product.inStock
              ? (
                  disableButtonAnimation
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white'
                    : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white hover:scale-105 hover:shadow-xl animate-pulse'
                )
              : (
                  disableButtonAnimation
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed animate-pulse'
                )
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <ShoppingCart className="h-5 w-5 animate-fade-in" />
            <span className="animate-fade-in uppercase tracking-wide">
              {isInCart(product.id.toString()) 
                ? '✓ In Cart' 
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