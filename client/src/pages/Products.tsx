import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid, List, Star, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productApi } from '../services/api';
import SearchFilters from '../components/SearchFilters';
import type { Product } from '../types/Product';
import { useSearch } from '../contexts/SearchContext';
import { useCart } from '../contexts/CartContext';

const Products: React.FC = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, refreshCart } = useCart();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const category = searchParams.get('category');
        const filters: any = {};
        if (category) {
          filters.category = category;
        }
        const result = await productApi.getProducts(filters);
        setProducts(result.products);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [searchParams]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product);
      await refreshCart();
      showNotification(`${product.name} added to cart!`, 'success');
    } catch (error) {
      showNotification('Failed to add product to cart. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Browse all available products in our store</p>
          {/* Notification handled by NotificationProvider */}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="fade-in-up block hover:shadow-lg transition-shadow duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
