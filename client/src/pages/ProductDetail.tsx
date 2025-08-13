import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import type { Product } from '../types/Product';
import { mockProducts } from '../types/Product';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      const found = mockProducts.find(p => p.id === Number(id));
      setProduct(found || null);
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // TODO: Implement cart functionality
      console.log('Adding to cart:', { ...product, quantity });
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Mock multiple images for the product
  const productImages = [
    product.image,
    'https://via.placeholder.com/400x400?text=Product+View+2',
    'https://via.placeholder.com/400x400?text=Product+View+3',
    'https://via.placeholder.com/400x400?text=Product+View+4'
  ];

  return (
    <div className="min-h-screen bg-gray-50 page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 fade-in-up" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-700 hover:text-primary-600 nav-link">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/products" className="text-gray-700 hover:text-primary-600 nav-link">
                  Products
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link 
                  to={`/products?category=${product.category}`}
                  className="text-gray-700 hover:text-primary-600 nav-link"
                >
                  {product.category}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4 fade-in-up stagger-1">
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 image-zoom">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                }}
              />
            </div>
            
            {/* Thumbnail images */}
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index 
                      ? 'border-primary-600' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/100x100?text=View';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 fade-in-up stagger-2">
            <div>
              <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 gradient-text">
                {product.name}
              </h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3 star-rating">
                  {renderStars(product.rating)}
                </div>
                <span className="text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <div className="text-4xl font-bold text-gray-900 mb-6 price-tag">
                R{product.price.toLocaleString()}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div className="fade-in-up stagger-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="bg-gray-50 rounded-lg p-6 fade-in-up stagger-4">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-gray-900 font-medium min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors cart-btn-pulse ${
                    product.inStock
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </span>
                  </div>
                </button>
                
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors glow-on-hover">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors glow-on-hover">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in-up stagger-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>Free delivery on orders over R800</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>1 year warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RotateCcw className="h-4 w-4" />
                <span>30-day returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 fade-in-up stagger-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 gradient-text">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would typically fetch related products */}
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="skeleton h-48 rounded-t-xl mb-4"></div>
                <div className="space-y-2">
                  <div className="skeleton h-4 rounded"></div>
                  <div className="skeleton h-4 rounded w-3/4"></div>
                  <div className="skeleton h-6 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
