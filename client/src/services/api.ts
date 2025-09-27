// API services for Snappify e-commerce application
import { Product, CartItem } from '../types/Product';
import { User } from '../types/User';

// Base API URL - use relative URL in development to leverage proxy, absolute URL in production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'http://localhost:5001/api'
  : '/api'; // Use proxy in development
console.log('API_BASE_URL:', API_BASE_URL); // Debug log

/**
 * Helper function to transform backend order format to frontend format
 */
export const transformBackendOrder = (backendOrder: any): any => {
  return {
    id: backendOrder._id || backendOrder.id,
    date: backendOrder.createdAt || backendOrder.date,
    status: backendOrder.status || backendOrder.orderStatus || 'pending',
    total: backendOrder.totalPrice || backendOrder.total || 0,
    items: (backendOrder.orderItems || []).map((item: any) => ({
      product: {
        id: item.product?._id || item.product?.id || item.product,
        name: item.name || item.product?.name || 'Unknown Product',
        image: item.image || item.product?.image || item.product?.images?.[0] || 'https://via.placeholder.com/48?text=Product',
        price: item.price || item.product?.price || 0,
      },
      quantity: item.quantity || 1,
    })),
    trackingNumber: backendOrder.trackingNumber,
    shippingAddress: backendOrder.shippingAddress || {
      fullName: 'N/A',
      addressLine1: 'N/A',
      city: 'N/A',
      postalCode: 'N/A',
      country: 'N/A'
    }
  };
};

/**
 * Helper function to transform backend product format to frontend format
 */
export const transformBackendProduct = (backendProduct: any): Product => {
  return {
    id: backendProduct.id || backendProduct._id,
    _id: backendProduct._id,
    name: backendProduct.name,
    price: backendProduct.price,
    originalPrice: backendProduct.originalPrice,
    discount: backendProduct.discount,
    image: Array.isArray(backendProduct.images) ? backendProduct.images[0] : backendProduct.image,
    images: backendProduct.images || [backendProduct.image],
    rating: backendProduct.rating || 0,
    reviews: backendProduct.reviews || backendProduct.numReviews || 0,
    numReviews: backendProduct.numReviews,
    inStock: backendProduct.inStock,
    countInStock: backendProduct.countInStock,
    category: backendProduct.category,
    brand: backendProduct.brand,
    description: backendProduct.description,
    features: backendProduct.features || [],
    specifications: backendProduct.specifications || {},
    tags: backendProduct.tags || [],
    weight: backendProduct.weight || '',
    dimensions: backendProduct.dimensions || '',
    warranty: backendProduct.warranty || '',
    returnPolicy: backendProduct.returnPolicy,
    shippingInfo: backendProduct.shippingInfo
  };
};

/**
 * Helper function to handle API responses and errors
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
      console.error('API Error:', errorMessage, response.status);
      throw new Error(errorMessage);
    } catch (e) {
      // If we can't parse the JSON, just use the status
      console.error('API Error:', response.status, response.statusText);
      throw new Error(`Network Error: ${response.status} ${response.statusText}`);
    }
  }
  
  // Don't try to parse JSON if the response is 204 No Content
  if (response.status === 204) {
    return {};
  }
  
  try {
    return await response.json();
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    return {};
  }
};

/**
 * Get authentication header with JWT token
 */
const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Authentication API services
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('🌐 API_BASE_URL:', API_BASE_URL);
      
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.log('📝 Using mock data for login');
        return new Promise<{ token: string; user: User }>((resolve) => {
          setTimeout(() => {
            resolve({ 
              token: 'mock-jwt-token',
              user: {
                id: '1',
                username: 'testuser',
                email: email,
                profilePicture: '/images/avatars/default.jpg',
                createdAt: new Date().toISOString()
              }
            });
          }, 800);
        });
      }

      console.log('🚀 Making API request to:', `${API_BASE_URL}/users/login`);
      
      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response ok:', response.ok);

      const data = await handleResponse(response);
      console.log('📦 Raw backend data:', data);
      
      // Transform backend response to frontend format
      const transformedData = {
        token: data.token,
        user: {
          id: data._id,
          username: data.username,
          email: data.email,
          profilePicture: data.profilePicture || '/images/avatars/default.jpg',
          createdAt: new Date().toISOString(),
          isAdmin: data.isAdmin
        }
      };
      
      console.log('✅ Transformed login data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Check if it's a network error (Failed to fetch)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🚫 Network Error - Unable to connect to server');
        console.error('🔍 Check if backend server is running on:', API_BASE_URL);
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  register: async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Registration successful' });
          }, 800);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, firstName, lastName }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Get current user data using JWT token
   */
  getCurrentUser: async () => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<User>((resolve) => {
          setTimeout(() => {
            resolve({
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              profilePicture: '/images/avatars/default.jpg',
              createdAt: new Date().toISOString()
            });
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      });

      const data = await handleResponse(response);
      
      // Transform backend response to frontend format
      return {
        id: data._id,
        username: data.username,
        email: data.email,
        profilePicture: data.profilePicture || '/images/avatars/default.jpg',
        createdAt: new Date().toISOString(),
        isAdmin: data.isAdmin,
        phoneNumber: data.phoneNumber,
        defaultShippingAddress: data.defaultShippingAddress
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },
  
  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<User>((resolve) => {
          setTimeout(() => {
            resolve({
              id: '1',
              username: userData.username || 'testuser',
              email: userData.email || 'test@example.com',
              profilePicture: userData.profilePicture || '/images/avatars/default.jpg',
              createdAt: new Date().toISOString()
            });
          }, 800);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
  
  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Password changed successfully' });
          }, 800);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  },
  
  /**
   * Request password reset
   */
  forgotPassword: async (email: string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Password reset email sent' });
          }, 800);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Password reset successful' });
          }, 800);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};

/**
 * Interface for product filters
 */
export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

/**
 * Product API services
 */
export const productApi = {
  /**
   * Get products with optional filters
   */
  getProducts: async (filters?: ProductFilters) => {
    try {
      // For production, use real API
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
      const data = await handleResponse(response);
      
      // Transform backend format to frontend format
      const transformedProducts = data.products ? data.products.map(transformBackendProduct) : [];
      
      return {
        products: transformedProducts,
        total: data.totalProducts || 0,
        page: data.page || 1,
        totalPages: data.pages || 1
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  /**
   * Get a product by ID
   */
  getProductById: async (id: string) => {
    try {

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get featured products
   */
  getFeaturedProducts: async () => {
    try {

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/products/featured`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },
  
  /**
   * Get related products for a given product
   */
  getRelatedProducts: async (productId: number) => {
    try {

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/products/${productId}/related`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  },
  
  /**
   * Get all product categories
   */
  getCategories: async () => {
    try {

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
  
  /**
   * Get all product brands
   */
  getBrands: async () => {
    try {

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/products/brands`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },
  
  /**
   * Search products by query
   */
  searchProducts: async (query: string) => {
    try {

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};

/**
 * Wishlist API services
 */
export const wishlistApi = {
  /**
   * Get wishlist
   */
  getWishlist: async () => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<Product[]>((resolve) => {
          setTimeout(() => {
            // Return an empty wishlist for demo mode
            resolve([]);
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/wishlist`, {
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },
  
  /**
   * Add a product to wishlist
   */
  addToWishlist: async (productId: number) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Product added to wishlist' });
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/wishlist`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },
  
  /**
   * Remove a product from wishlist
   */
  removeFromWishlist: async (productId: number) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Product removed from wishlist' });
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/wishlist/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },
  
  /**
   * Check if a product is in the wishlist
   */
  isInWishlist: async (productId: number) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<boolean>((resolve) => {
          setTimeout(() => {
            // Randomly determine if it's in the wishlist (for demo purposes)
            const mockIds = [1, 3, 6];
            resolve(mockIds.includes(productId));
          }, 300);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/users/wishlist/check/${productId}`, {
        headers: getAuthHeader(),
      });

      const data = await handleResponse(response);
      return data.inWishlist;
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      throw error;
    }
  }
};

/**
 * Interface for cart data
 */
export interface CartData {
  items: CartItem[];
  total: number;
}

/**
 * Cart API services
 */
export const cartApi = {
  /**
   * Get user's cart
   */
  getCart: async () => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<CartData>((resolve) => {
          setTimeout(() => {
            // Return an empty cart for demo mode
            resolve({ items: [], total: 0 });
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/cart/items`, {
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },
  
  /**
   * Add a product to cart
   */
  addToCart: async (productId: number | string, quantity: number = 1) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Product added to cart' });
          }, 500);
        });
      }

      console.log(`API: Adding product ${productId} (quantity: ${quantity}) to cart`);

      // For production, use real API - use numeric ID if available
      const idToUse = typeof productId === 'number' ? productId : productId;

      const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: idToUse, quantity }),
      });

      const data = await handleResponse(response);
      console.log('API: Cart add response:', data);
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },
  
  /**
   * Update quantity of a cart item
   */
  updateCartItem: async (productId: number | string, quantity: number) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Cart item updated' });
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },
  
  /**
   * Remove a product from cart
   */
  removeFromCart: async (productId: number | string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Product removed from cart' });
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/cart/items/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },
  
  /**
   * Clear the cart
   */
  clearCart: async () => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Cart cleared' });
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
  
  /**
   * Checkout the cart
   */
  checkout: async (
    orderItems: Array<{ product: string; name: string; quantity: number; image: string; price: number }>,
    shippingAddress: any,
    paymentMethod: string,
    shippingMethod: { name: string; price: number; description?: string },
    taxPrice: number,
    shippingPrice: number,
    subtotal: number,
    totalPrice: number
  ) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ orderId: string; message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ 
              orderId: 'order-' + Date.now(), 
              message: 'Order placed successfully' 
            });
          }, 1000);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderItems,
          shippingAddress,
          paymentMethod,
          shippingMethod,
          taxPrice,
          shippingPrice,
          subtotal,
          totalPrice
        }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  }
};

/**
 * Order API services
 */
export const orderApi = {
  /**
   * Get user's orders
   */
  getOrders: async () => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<any[]>((resolve) => {
          setTimeout(() => {
            // Return an empty orders array for demo mode
            resolve([]);
          }, 800);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
        headers: {
          ...getAuthHeader(),
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });

      const backendOrders = await handleResponse(response);
      
      // Transform backend orders to frontend format
      const transformedOrders = (backendOrders || []).map(transformBackendOrder);
      
      return transformedOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific order by ID
   */
  getOrderById: async (orderId: string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<any>((resolve, reject) => {
          setTimeout(() => {
            // Return null for demo mode
            reject(new Error('Order not found'));
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  },
  
  /**
   * Cancel an order
   */
  cancelOrder: async (orderId: string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Order cancelled successfully' });
          }, 800);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }
};

/**
 * Review API services
 */
export const reviewApi = {
  /**
   * Get reviews for a product
   */
  getProductReviews: async (productId: number) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<any[]>((resolve) => {
          setTimeout(() => {
            resolve([
              {
                id: 'review-1',
                productId,
                userId: 'user-1',
                userName: 'John Doe',
                rating: 5,
                comment: 'Great product, very happy with my purchase!',
                date: new Date(Date.now() - 86400000 * 10).toISOString(),
                helpful: 5
              },
              {
                id: 'review-2',
                productId,
                userId: 'user-2',
                userName: 'Jane Smith',
                rating: 4,
                comment: 'Good quality but a bit pricey.',
                date: new Date(Date.now() - 86400000 * 5).toISOString(),
                helpful: 2
              },
              {
                id: 'review-3',
                productId,
                userId: 'user-3',
                userName: 'Mike Johnson',
                rating: 3,
                comment: 'Average product, works as expected.',
                date: new Date(Date.now() - 86400000 * 2).toISOString(),
                helpful: 1
              }
            ]);
          }, 600);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
      return handleResponse(response);
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  },
  
  /**
   * Add a review for a product
   */
  addReview: async (productId: string, rating: number, comment: string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string; reviewId: string }>((resolve) => {
          setTimeout(() => {
            resolve({ 
              message: 'Review added successfully',
              reviewId: 'review-' + Date.now()
            });
          }, 800);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error adding review for product ${productId}:`, error);
      throw error;
    }
  },
  
  /**
   * Mark a review as helpful
   */
  markReviewHelpful: async (reviewId: string) => {
    try {
      // For development/demo mode, use mock data
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        return new Promise<{ message: string }>((resolve) => {
          setTimeout(() => {
            resolve({ message: 'Review marked as helpful' });
          }, 500);
        });
      }

      // For production, use real API
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: getAuthHeader(),
      });

      return handleResponse(response);
    } catch (error) {
      console.error(`Error marking review ${reviewId} as helpful:`, error);
      throw error;
    }
  }
};

// Export all API services together
const api = {
  auth: authApi,
  products: productApi,
  wishlist: wishlistApi,
  cart: cartApi,
  orders: orderApi,
  reviews: reviewApi
};

export default api;
