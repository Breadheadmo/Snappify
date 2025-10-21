import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/api';
import { 
  ShoppingBag, 
  ArrowRight, 
  Grid3x3, 
  TrendingUp,
  Package,
  Sparkles
} from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  productCount?: number;
  slug?: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productApi.getCategories();
        console.log('Fetched categories:', data); // ✅ DEBUG
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageLoad = (categoryId: string) => {
    setImagesLoaded(prev => ({ ...prev, [categoryId]: true }));
  };

  const defaultImages: Record<string, string> = {
    // Phone Accessories
    'Phone Cases': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
    'Phone Case': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
    'Cases': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80',
    
    // Screen Protection
    'Screen Protectors': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    'Screen Protector': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    'Phone Protection': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    'Tempered Glass': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    
    // Charging
    'Chargers & Cables': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
    'Chargers': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
    'Cables': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
    'Charging Solutions': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
    'USB Cables': 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80',
    
    // Audio
    'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'Headphones & Headsets': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'Earphones': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    'Earbuds': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    'Wireless Earbuds': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    'Audio Accessories': 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&q=80',
    'Speakers': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
    'Bluetooth Speakers': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
    
    // Wireless & Bluetooth
    'Wireless Accessories': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    'Bluetooth Accessories': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    
    // Power
    'Power Banks': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
    'Power Bank': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
    'Portable Chargers': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
    'Battery Packs': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80',
    
    // Stands & Holders
    'Phone Holders': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    'Phone Stands': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    'Car Mounts': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    'Holders & Stands': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80',
    
    // Smartwatches
    'Smart Watches': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    'Smartwatches': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    'Smartwatch': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    'Apple Watch': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&q=80',
    'Fitness Trackers': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
    
    // Skins & Wraps
    'Phone Skins': 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
    'Skins': 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
    'Wraps': 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&q=80',
    
    // Tablets
    'Tablet Accessories': 'https://images.unsplash.com/photo-1585789575315-3023c5f83c8b?w=800&q=80',
    'Tablet Cases': 'https://images.unsplash.com/photo-1585789575315-3023c5f83c8b?w=800&q=80',
    'iPad Accessories': 'https://images.unsplash.com/photo-1585789575315-3023c5f83c8b?w=800&q=80',
    
    // Camera
    'Camera Accessories': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    'Phone Lenses': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    'Tripods': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
    
    // Gaming
    'Gaming Accessories': 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80',
    'Gaming Controllers': 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80',
    'Mobile Gaming': 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&q=80',
    
    // General Phone Accessories
    'Phone Accessories': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    'Mobile Accessories': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    'Accessories': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80',
    
    // Memory & Storage
    'Memory Cards': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    'Storage': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    'SD Cards': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
    
    // Adapters & Converters
    'Adapters': 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80',
    'Converters': 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80',
    'Dongles': 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80',
    
    // Default fallback
    'default': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&q=80'
  };

  // ✅ FIXED: Added comprehensive null/undefined checks
  const getCategoryImage = (category: Category): string => {
    try {
      // First, try to use the image from the database
      if (category?.image) {
        return category.image;
      }
      
      // ✅ CHECK: Ensure category and name exist
      if (!category || !category.name || typeof category.name !== 'string') {
        console.warn('Invalid category object:', category);
        return defaultImages['default'];
      }
      
      // Try exact match
      if (defaultImages[category.name]) {
        return defaultImages[category.name];
      }
      
      // Try case-insensitive match
      const lowerCaseName = category.name.toLowerCase();
      const matchingKey = Object.keys(defaultImages).find(
        key => key.toLowerCase() === lowerCaseName
      );
      
      if (matchingKey) {
        return defaultImages[matchingKey];
      }
      
      // Try partial match (contains)
      const partialMatchKey = Object.keys(defaultImages).find(
        key => {
          const keyLower = key.toLowerCase();
          return lowerCaseName.includes(keyLower) || keyLower.includes(lowerCaseName);
        }
      );
      
      if (partialMatchKey) {
        return defaultImages[partialMatchKey];
      }
      
      // Fallback to default image
      return defaultImages['default'];
    } catch (error) {
      console.error('Error in getCategoryImage:', error, category);
      return defaultImages['default'];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-12 bg-white/20 rounded-lg w-64 mb-4"></div>
              <div className="h-6 bg-white/20 rounded-lg w-96"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                  <div className="p-6 bg-white">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Categories</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105"
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float-delayed"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 bg-white/10 rounded-full mb-6 animate-fade-in">
              <Grid3x3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-down">
              Browse Categories
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto animate-slide-up">
              Explore our carefully curated collection of premium tech accessories
            </p>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="h-6 w-6 text-yellow-300 mr-2" />
                  <span className="text-3xl font-bold text-white">{categories.length}</span>
                </div>
                <p className="text-primary-100 text-sm">Categories</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-center mb-2">
                  <Package className="h-6 w-6 text-green-300 mr-2" />
                  <span className="text-3xl font-bold text-white">500+</span>
                </div>
                <p className="text-primary-100 text-sm">Products</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-blue-300 mr-2" />
                  <span className="text-3xl font-bold text-white">Top</span>
                </div>
                <p className="text-primary-100 text-sm">Quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Available</h3>
            <p className="text-gray-600 mb-6">Check back later for new categories</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Go to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
                Shop by Category
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Find exactly what you need from our wide range of tech accessories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories
                .filter(category => {
                  // ✅ FILTER: Remove invalid categories before rendering
                  const isValid = category && 
                                 typeof category._id === 'string' && 
                                 typeof category.name === 'string' && 
                                 category.name.trim() !== '';
                  
                  if (!isValid) {
                    console.warn('Filtered out invalid category:', category);
                  }
                  
                  return isValid;
                })
                .map((category, index) => (
                <Link
                  key={category._id}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-64 overflow-hidden bg-gray-900">
                    <div className={`absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer transition-opacity duration-700 ${
                      imagesLoaded[category._id] ? 'opacity-0' : 'opacity-100'
                    }`}></div>
                    
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name || 'Category'}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      onLoad={() => handleImageLoad(category._id)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultImages['default'];
                        handleImageLoad(category._id);
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-500"></div>
                    <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/20 transition-all duration-500"></div>
                    
                    {category.productCount && category.productCount > 0 && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-primary-600 px-3 py-1 rounded-full text-sm font-semibold shadow-lg transform group-hover:scale-110 transition-all duration-300">
                        {category.productCount} items
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                        {category.name}
                        <ArrowRight className="ml-2 h-6 w-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                      </h3>
                      <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {category.description || 'Explore our collection of premium products'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 border-t-4 border-primary-600 group-hover:border-primary-700 transition-colors duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 group-hover:text-primary-600 transition-colors duration-300">
                        Browse Collection
                      </span>
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300 transform group-hover:scale-110">
                        <ShoppingBag className="h-5 w-5 text-primary-600 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-primary-100 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Browse all products or contact our team for personalized assistance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Package className="mr-2 h-5 w-5" />
              View All Products
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-700 text-white border-2 border-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowRight className="mr-2 h-5 w-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
