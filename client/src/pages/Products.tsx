import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, Star, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SearchFilters from '../components/SearchFilters';
import type { Product } from '../types/Product';
import { useSearch } from '../contexts/SearchContext';
import { useCart } from '../contexts/CartContext';

const Products: React.FC = () => {
  const { state: searchState, setCategory, setQuery, searchProducts } = useSearch();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    // Update search context when URL params change
    if (category !== 'all') {
      setCategory(category);
    }
    if (search) {
      setQuery(search);
    }
    searchProducts();
  }, [category, search, setCategory, setQuery, searchProducts]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product);
      // You could add a success notification here
      console.log(`Added ${product.name} to cart successfully`);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      // You could add an error notification here
      alert('Failed to add product to cart. Please try again.');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {category !== 'all' ? category : 'All Products'}
          </h1>
          {search && (
            <p className="text-gray-600">
              Search results for: <span className="font-medium">"{search}"</span>
            </p>
          )}
          <p className="text-gray-600">
            {searchState.totalResults} product{searchState.totalResults !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search and Filters */}
        <SearchFilters />

        {/* View Mode Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {searchState.totalResults === 0 ? (
          <div className="text-center py-12 fade-in-up">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {viewMode === 'grid' ? (
              searchState.results.map((product, index) => (
                <div key={product.id} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))
            ) : (
              searchState.results.map((product, index) => (
                <div key={product.id} className="card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    <div className="md:w-48 flex-shrink-0">
                      <div className="image-zoom">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 md:h-48 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center mb-2">
                            <div className="flex items-center mr-2 star-rating">
                              {renderStars(product.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({product.reviews} reviews)
                            </span>
                          </div>
                          <span className="inline-block bg-primary-100 text-primary-800 text-sm px-2 py-1 rounded-full mb-3">
                            {product.category}
                          </span>
                          {product.brand && (
                            <span className="inline-block bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full mb-3 ml-2">
                              {product.brand}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900 price-tag">
                            R{product.price.toLocaleString()}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              R{product.originalPrice.toLocaleString()}
                            </div>
                          )}
                          {product.discount && (
                            <div className="text-sm text-green-600 font-medium">
                              {product.discount}% OFF
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {product.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          className={`px-6 py-2 rounded-lg font-medium transition-colors cart-btn-pulse ${
                            product.inStock
                              ? 'bg-primary-600 hover:bg-primary-700 text-white'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
