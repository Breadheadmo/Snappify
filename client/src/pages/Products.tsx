import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productApi } from '../services/api';
import AdvancedSearch from '../components/search/AdvancedSearch';
import type { Product } from '../types/Product';
import { useCart } from '../contexts/CartContext';

const Products: React.FC = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const { addToCart, refreshCart } = useCart();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Load initial data
    const loadInitialData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          productApi.getCategories(),
          productApi.getBrands()
        ]);
        setCategories(categoriesRes);
        setBrands(brandsRes);
        
        // Load initial products
        await loadProducts({});
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      loadProducts({ category });
    }
  }, [searchParams]);

  const loadProducts = async (filters: any) => {
    setLoading(true);
    try {
      const result = await productApi.getProducts(filters);
      setProducts(result.products || []);
      
      // Extract available tags and features from products
      const tags = new Set<string>();
      const features = new Set<string>();
      
      result.products?.forEach((product: any) => {
        product.tags?.forEach((tag: string) => tags.add(tag));
        product.features?.forEach((feature: string) => features.add(feature));
      });
      
      setAvailableTags(Array.from(tags));
      setAvailableFeatures(Array.from(features));
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (filters: any) => {
    const searchFilters: any = {};
    if (filters.query) searchFilters.search = filters.query;
    if (filters.category) searchFilters.category = filters.category;
    if (filters.brand) searchFilters.brand = filters.brand;
    if (filters.minPrice) searchFilters.minPrice = filters.minPrice;
    if (filters.maxPrice) searchFilters.maxPrice = filters.maxPrice;
    if (filters.minRating) searchFilters.rating = filters.minRating;
    if (filters.tags?.length > 0) searchFilters.tags = filters.tags.join(',');
    if (filters.features?.length > 0) searchFilters.features = filters.features.join(',');
    if (filters.inStock) searchFilters.inStock = 'true';
    if (filters.sortBy && filters.sortBy !== 'relevance') searchFilters.sortBy = filters.sortBy;
    await loadProducts(searchFilters);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      await refreshCart();
      showNotification('Item added to cart successfully!', 'success');
    } catch (error) {
      showNotification('Failed to add item to cart', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600 mb-6">Browse all available products in our store</p>
          
          {/* Advanced Search */}
          <div className="w-full">
            <AdvancedSearch
              categories={categories}
              brands={brands}
              availableTags={availableTags}
              availableFeatures={availableFeatures}
              onSearch={handleSearch}
            />
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center text-gray-500">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto mb-4 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No products found</h3>
            <p className="mb-4">Try adjusting your filters or check back later.</p>
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <ArrowRight className="mr-2 h-5 w-5" />
              Go to Home
            </Link>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="fade-in-up block hover:shadow-lg transition-shadow duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    disableButtonAnimation
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
