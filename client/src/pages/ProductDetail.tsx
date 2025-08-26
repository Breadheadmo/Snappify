import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../services/api';
import { transformBackendProduct } from '../services/api';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import type { Product } from '../types/Product';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product Not Found');
        setLoading(false);
        return;
      }
      try {
        // Try to fetch with number, fallback to string
  let data = await productApi.getProductById(String(id));
        // If backend returns raw object, transform it
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

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <img
            src={product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/400x300?text=Product+Image'}
            alt={product.name}
            className="w-full max-w-xs h-auto rounded-lg mb-4 object-cover"
          />
          {!product.inStock && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium">Out of Stock</span>
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
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="ml-2 text-gray-600">({product.numReviews || product.reviews} reviews)</span>
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
    </div>
  );
};

export default ProductDetail;
