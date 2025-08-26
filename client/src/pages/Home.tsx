import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/Product';
import { useCart } from '../contexts/CartContext';
import { productApi } from '../services/api';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        console.log('Loading featured products from API...');
        const result = await productApi.getProducts();
        console.log('API result:', result);
        
        // Take first 4 products as featured
        const featured = result.products.slice(0, 4);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error loading featured products:', error);
        // If API fails, we could fallback to mock data, but let's show empty for now
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      console.log('Adding product to cart:', product);
      await addToCart(product);
      console.log(`Added ${product.name} to cart successfully`);
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: "Secure Shopping",
      description: "Your data is protected with bank-level security"
    },
    {
      icon: <Truck className="h-8 w-8 text-primary-600" />,
      title: "Fast Shipping",
      description: "Free shipping on orders over $50"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-600" />,
      title: "24/7 Support",
      description: "Get help whenever you need it"
    }
  ];

  const categories = [
    {
      name: "Chargers",
      image: "https://via.placeholder.com/300x200?text=Chargers",
      description: "Fast charging solutions for all devices",
      link: "/products?category=Chargers"
    },
    {
      name: "Audio",
      image: "https://via.placeholder.com/300x200?text=Audio",
      description: "Premium sound quality headphones and speakers",
      link: "/products?category=Audio"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="parallax bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 relative overflow-hidden" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80")'
      }}>
        {/* Particle effects */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 4 + 6}s`
              }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/80 to-primary-800/80"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 float-animation text-reveal">
              Premium Tech Products
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto fade-in-up stagger-1">
              Discover the latest in chargers, audio devices, and cutting-edge technology. 
              Quality products for the modern lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up stagger-2">
              <Link
                to="/products"
                className="btn-primary glow-on-hover button-bounce inline-flex items-center"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/products?category=Audio"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300 glow-on-hover button-bounce"
              >
                Explore Audio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 gradient-text">
              Why Choose TechStore?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best shopping experience with quality products and exceptional service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center fade-in-up" style={{ animationDelay: `${(index + 1) * 0.2}s` }}>
                <div className="flex justify-center mb-4">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 gradient-text">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find exactly what you're looking for in our organized categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group block category-card fade-in-up"
                style={{ animationDelay: `${(index + 1) * 0.3}s` }}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <div className="image-zoom">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-48 object-cover transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                        <p className="text-lg">{category.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 fade-in-up">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 gradient-text">
                Featured Products
              </h2>
              <p className="text-gray-600">
                Our most popular and highly-rated products
              </p>
            </div>
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center nav-link"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
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
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="fade-in-up block hover:shadow-lg transition-shadow duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 fade-in-up">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto fade-in-up stagger-1">
            Join thousands of satisfied customers who trust TechStore for their tech needs.
          </p>
          <Link
            to="/products"
            className="btn-primary glow-on-hover inline-flex items-center fade-in-up stagger-2"
          >
            Start Shopping
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
