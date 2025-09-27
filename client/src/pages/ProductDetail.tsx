import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { Card, CardContent } from "../components/ui/card";
import { useAuth } from '../contexts/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { productApi, reviewApi } from '../services/api';
import { transformBackendProduct } from '../services/api';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import type { Product } from '../types/Product';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const ProductDetail: React.FC = () => {
  // Color and model selection state
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  // Carousel state
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  // Remove duplicate images declaration; use images from product below
  const handlePrevImage = () => {
    setCurrentImageIdx(idx => (images.length > 0 ? (idx === 0 ? images.length - 1 : idx - 1) : 0));
  };
  const handleNextImage = () => {
    setCurrentImageIdx(idx => (images.length > 0 ? (idx === images.length - 1 ? 0 : idx + 1) : 0));
  };
  const { user } = useAuth();
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
  const handleStarClick = async (rating: number) => {
    if (!product || ratingSubmitting) return;
    if (!user) {
      setRatingError('You must be logged in to rate.');
      return;
    }
    setRatingSubmitting(true);
    setRatingError(null);
    try {
      // Use product._id as string for MongoDB ObjectId
      const productId = product._id || product.id;
      if (!productId || typeof productId !== 'string') throw new Error('Invalid product ID');
      await reviewApi.addReview(productId, rating, "");
      setUserRating(rating);
      // Optionally, refetch product to update average rating
      // const updated = await productApi.getProductById(productId);
      // setProduct(updated);
    } catch (err: any) {
      if (err && err.message) {
        setRatingError(err.message);
      } else {
        setRatingError("Failed to submit rating. Please try again.");
      }
    } finally {
      setRatingSubmitting(false);
    }
  };

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
  // Ensure id is a number for reviewApi
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

  const handleAddToCart = () => {
    if (product) {
      // Pass selected options to cart logic (extend as needed)
      const cartItem = {
        ...product,
        quantity,
        color: selectedColor,
        model: selectedModel,
      };
      console.log('Adding to cart:', cartItem);
      // TODO: Integrate with actual cart logic if needed
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

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

  // Images array for carousel
  const images = product.images && product.images.length > 0
    ? product.images
    : [product.image || 'https://via.placeholder.com/400x300?text=Product+Image'];

  return (
  <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Carousel className="w-full max-w-xs">
            <CarouselContent>
              {images.map((img, idx) => (
                <CarouselItem key={idx}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <img src={img} alt={product.name} className="object-cover w-full h-full rounded-lg" />
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
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium">Out of Stock</span>
          )}
          {/* Color Picker */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-4 w-full">
              <h3 className="text-sm font-semibold mb-2">Choose Color:</h3>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 focus:outline-none ${selectedColor === color ? 'border-primary-600 ring-2 ring-primary-400' : 'border-gray-300'} bg-[${color}]`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Model Picker for Screen Protectors and Chargers */}
          {(product.category.toLowerCase().includes('screen protector') || product.category.toLowerCase().includes('charger')) && product.models && product.models.length > 0 && (
            <div className="mt-4 w-full">
              <h3 className="text-sm font-semibold mb-2">Choose Phone Model:</h3>
              <select
                className="w-full border rounded p-2"
                value={selectedModel || ''}
                onChange={e => setSelectedModel(e.target.value)}
              >
                <option value="" disabled>Select model</option>
                {product.models.map((model: string) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center mb-2">
              <span className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded-full mr-2">{product.category}</span>
              <span className="text-sm text-gray-500">Brand: {product.brand}</span>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStarClick(i + 1)}
                  disabled={ratingSubmitting || !user}
                  className="focus:outline-none"
                  aria-label={`Rate ${i + 1} stars`}
                >
                  <Star
                    className={`h-5 w-5 transition-colors duration-150 ${
                      (userRating !== null ? i < userRating : i < Math.floor(product.rating))
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-gray-600">({product.numReviews || product.reviews} reviews)</span>
              {ratingError && <span className="ml-4 text-red-500 text-sm">{ratingError}</span>}
              {userRating && <span className="ml-4 text-green-600 text-sm">Thank you for rating!</span>}
            </div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900">R{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-2 text-sm text-gray-500 line-through">R{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-gray-700 mb-4">{product.description}</p>
            {product.features && product.features.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Features:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Specifications:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {Object.entries(product.specifications).map(([key, value], idx) => (
                    <li key={idx}><span className="font-medium">{key}:</span> {value}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mb-4">
              <span className="text-sm text-gray-500">Weight: {product.weight || 'N/A'}</span>
              <span className="ml-4 text-sm text-gray-500">Dimensions: {product.dimensions || 'N/A'}</span>
            </div>
            <div className="mb-4">
              <span className="text-sm text-gray-500">Warranty: {product.warranty || 'N/A'}</span>
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
      <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">User Reviews</h2>
        {/* Review Submission Form */}
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
                // Refetch reviews
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
                  <Star className={`h-5 w-5 ${userRating !== null ? i < userRating : false ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
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
        {/* Reviews List */}
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
