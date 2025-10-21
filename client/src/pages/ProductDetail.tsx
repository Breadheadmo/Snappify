import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { Card, CardContent } from "../components/ui/card";
import ImageZoom from '../components/products/ImageZoom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import { useParams, Link } from 'react-router-dom';
import { productApi, reviewApi } from '../services/api';
import { transformBackendProduct } from '../services/api';
import { Star, ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import type { Product } from '../types/Product';
import type { Category } from '../types'; // 🆕 ADDED
import WishlistButton from '../components/wishlist/WishlistButton';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const ProductDetail: React.FC = () => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // ============================================
  // 🆕 HELPER FUNCTIONS FOR CATEGORY HANDLING
  // ============================================

  /**
   * Safely extract category name from string or Category object
   */
  const getCategoryName = (category: string | Category | undefined): string => {
    if (!category) return 'Uncategorized';
    
    // If it's a string, return it directly
    if (typeof category === 'string') return category;
    
    // If it's a Category object, return its name property
    return category.name || 'Uncategorized';
  };

  /**
   * Get category slug for URL generation
   */
  const getCategorySlug = (category: string | Category | undefined): string => {
    if (!category) return '';
    
    // If it's a string, convert to slug format
    if (typeof category === 'string') {
      return category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    // If it's a Category object, return its slug
    return category.slug || '';
  };

  /**
   * Get category ID for linking
   */
  const getCategoryId = (category: string | Category | undefined): string => {
    if (!category) return '';
    
    // If it's a string, return empty (no ID available)
    if (typeof category === 'string') return '';
    
    // If it's a Category object, return its _id
    return category._id || '';
  };

  // ============================================
  // EXISTING HELPER FUNCTIONS
  // ============================================

  // Helper functions to parse JSON data
  const parseFeatures = (features: any): string[] => {
    if (!features) return [];
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        return Array.isArray(parsed) ? parsed : [features];
      } catch {
        // If it's a string but not valid JSON, split by common delimiters
        return features.split(/[,;\n]/).map((f: string) => f.trim()).filter((f: string) => f.length > 0);
      }
    }
    return Array.isArray(features) ? features : [];
  };

  const parseSpecifications = (specs: any): Record<string, any> => {
    if (!specs) return {};
    if (typeof specs === 'string') {
      try {
        return JSON.parse(specs);
      } catch {
        return {};
      }
    }
    return typeof specs === 'object' ? specs : {};
  };

  const handlePrevImage = () => {
    const images = product?.images && product.images.length > 0
      ? product.images
      : [product?.image || 'https://via.placeholder.com/400x300?text=Product+Image'];
    setCurrentImageIdx(idx => (images.length > 0 ? (idx === 0 ? images.length - 1 : idx - 1) : 0));
  };
  
  const handleNextImage = () => {
    const images = product?.images && product.images.length > 0
      ? product.images
      : [product?.image || 'https://via.placeholder.com/400x300?text=Product+Image'];
    setCurrentImageIdx(idx => (images.length > 0 ? (idx === images.length - 1 ? 0 : idx + 1) : 0));
  };

  // ============================================
  // USE EFFECTS
  // ============================================

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product Not Found');
        setLoading(false);
        return;
      }
      try {
        let data = await productApi.getProductById(String(id));
        if (data && !data.id && data._id) {
          data = transformBackendProduct(data);
        }
        setProduct(data);
      } catch (err) {
        setError('Product Not Found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const productId = Number(id);
        if (isNaN(productId)) throw new Error('Invalid product ID');
        const data = await reviewApi.getProductReviews(productId);
        setReviews(data);
      } catch (err) {
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleAddToCart = () => {
    if (!product) {
      showNotification('Product not found. Please try again.', 'error');
      return;
    }

    if (!product.inStock) {
      showNotification('This product is currently out of stock.', 'error');
      return;
    }

    const cartItem = {
      ...product,
      quantity,
      selectedVariants,
    };

    try {
      addToCart(cartItem, quantity);
      
      let message = `${product.name} added to cart!`;
      if (quantity > 1) {
        message += ` Quantity: ${quantity}`;
      }
      if (selectedVariants.color || selectedVariants.model) {
        const variants = [];
        if (selectedVariants.color) variants.push(`Color: ${selectedVariants.color}`);
        if (selectedVariants.model) variants.push(`Model: ${selectedVariants.model}`);
        message += ` (${variants.join(', ')})`;
      }
      
      showNotification(message, 'success');

    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      showNotification('Failed to add item to cart. Please try again.', 'error');
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  // ============================================
  // RENDER CONDITIONS
  // ============================================

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Link to="/products" className="text-primary-600 hover:underline flex items-center">
          <ArrowLeft className="mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image || 'https://via.placeholder.com/400x300?text=Product+Image'];

  const features = parseFeatures(product.features);
  const specifications = parseSpecifications(product.specifications);

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      {/* 🆕 BREADCRUMB NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors">
            Products
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link 
                to={`/products?category=${encodeURIComponent(getCategoryName(product.category))}`}
                className="hover:text-primary-600 transition-colors"
              >
                {getCategoryName(product.category)}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <Carousel className="w-full max-w-md">
            <CarouselContent>
              {images.map((img, idx) => (
                <CarouselItem key={idx}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <ImageZoom src={img} alt={product.name} />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          {!product.inStock && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium mt-4">Out of Stock</span>
          )}
          
          {/* Enhanced Variant Selection */}
          <div className="mt-6 w-full max-w-md space-y-6">
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Choose Color:</h3>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg ${
                        selectedVariants.color === color 
                          ? 'border-blue-600 ring-4 ring-blue-200 scale-110 shadow-xl' 
                          : 'border-gray-300 hover:border-gray-400 hover:shadow-xl'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, color }))}
                      aria-label={`Select ${color} color`}
                      title={`Select ${color} color`}
                    />
                  ))}
                </div>
                {selectedVariants.color && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800">
                      Selected Color: <span className="text-blue-600">{selectedVariants.color}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Model Selection */}
            {product.models && product.models.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Choose Model:</h3>
                <select
                  className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 bg-white"
                  value={selectedVariants.model || ''}
                  onChange={e => setSelectedVariants(prev => ({ ...prev, model: e.target.value }))}
                >
                  <option value="" disabled>Select your device model</option>
                  {product.models.map((model: string) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                {selectedVariants.model && (
                  <div className="mt-3 p-2 bg-green-50 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      Selected Model: <span className="text-green-600">{selectedVariants.model}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Variant Summary */}
            {(selectedVariants.color || selectedVariants.model) && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Your Selection:</h4>
                <div className="space-y-1">
                  {selectedVariants.color && (
                    <p className="text-sm text-blue-700">
                      Color: <span className="font-medium">{selectedVariants.color}</span>
                    </p>
                  )}
                  {selectedVariants.model && (
                    <p className="text-sm text-blue-700">
                      Model: <span className="font-medium">{selectedVariants.model}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center mb-2">
              {/* 🔧 FIXED: Category display with helper function */}
              <Link 
                to={`/products?category=${encodeURIComponent(getCategoryName(product.category))}`}
                className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded-full mr-2 hover:bg-primary-200 transition-colors inline-block"
              >
                {getCategoryName(product.category)}
              </Link>
              <span className="text-sm text-gray-500">Brand: {product.brand}</span>
            </div>
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  {product.rating.toFixed(1)} ({product.numReviews || product.reviews} reviews)
                </span>
              </div>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">R{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-2 text-sm text-gray-500 line-through">R{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">{product.description}</p>
            
            {/* Features Section */}
            {features.length > 0 && (
              <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                <h3 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
                  <span className="bg-primary-600 text-white rounded-full p-1 mr-2">
                    <Check className="h-4 w-4" />
                  </span>
                  Key Features
                </h3>
                <ul className="space-y-2">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-700">
                      <span className="text-primary-600 mr-3 mt-1 flex-shrink-0">
                        <Check className="h-5 w-5" />
                      </span>
                      <span className="leading-relaxed text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Specifications Section */}
            {Object.keys(specifications).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-lg text-gray-800">Specifications:</h3>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {Object.entries(specifications).map(([key, value], idx) => (
                    <div key={idx} className="flex py-2 border-b border-gray-200 last:border-0">
                      <span className="font-medium text-gray-700 min-w-[150px]">{key}:</span>
                      <span className="flex-1 text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Weight and Dimensions */}
            <div className="mb-4 bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Weight:</span>
                  <span className="ml-2 text-gray-600">{product.weight || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dimensions:</span>
                  <span className="ml-2 text-gray-600">{product.dimensions || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {/* Warranty */}
            <div className="mb-4 bg-blue-50 border border-blue-100 p-3 rounded-lg">
              <span className="font-medium text-blue-900">Warranty:</span>
              <span className="ml-2 text-blue-700">{product.warranty || 'N/A'}</span>
            </div>
            
            {/* Quantity and Actions */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700 mr-3">
                  Quantity:
                </label>
                <div className="flex items-center border rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-center min-w-[3rem]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    disabled={quantity >= 10}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                <WishlistButton productId={String(product._id || product.id)} />
              </div>
            </div>
            {/* Back Button */}
            <div className="mt-8">
              <Link to="/products" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                <ArrowLeft className="mr-2" />
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* User Reviews Section */}
      <div className="max-w-7xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">User Reviews</h2>
        {user ? (
          <form
            className="mb-8"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!product) return;
              if (!userRating || userRating < 1 || userRating > 5) {
                setRatingError('Please select a star rating.');
                return;
              }
              if (!comment.trim()) {
                setRatingError('Please enter a comment.');
                return;
              }
              setRatingSubmitting(true);
              setRatingError(null);
              try {
                const productIdStr = String(product._id || product.id);
                await reviewApi.addReview(productIdStr, userRating, comment);
                setUserRating(null);
                setComment('');
                const productIdNum = typeof product.id === 'number' ? product.id : Number(product.id || product._id);
                const data = await reviewApi.getProductReviews(productIdNum);
                setReviews(data);
              } catch (err: any) {
                setRatingError(err.message || 'Failed to submit review.');
              } finally {
                setRatingSubmitting(false);
              }
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="font-medium">Your Rating:</span>
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUserRating(i + 1)}
                  className="focus:outline-none"
                  aria-label={`Rate ${i + 1} stars`}
                >
                  <Star className={`h-5 w-5 ${userRating !== null && i < userRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded p-2 mb-2"
              rows={3}
              placeholder="Write your review..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
            />
            {ratingError && <div className="text-red-500 mb-2">{ratingError}</div>}
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
              disabled={ratingSubmitting}
            >
              {ratingSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="mb-8 text-gray-500">Log in to submit a review.</div>
        )}
        {reviewsLoading ? (
          <div>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews yet.</div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-sm text-gray-700 font-semibold">{review.userName}</span>
                  <span className="ml-2 text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="text-gray-700 text-sm">{review.comment || <span className="italic text-gray-400">No comment</span>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;