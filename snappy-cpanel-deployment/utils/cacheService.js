const Redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      if (process.env.REDIS_URL) {
        this.client = Redis.createClient({
          url: process.env.REDIS_URL
        });

        this.client.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('Redis Client Connected');
          this.isConnected = true;
        });

        await this.client.connect();
      } else {
        console.log('Redis URL not provided, caching disabled');
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, data, ttl = 3600) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.setEx(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async clear() {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  // Cache middleware for Express routes
  middleware(duration = 300) {
    return async (req, res, next) => {
      if (!this.isConnected) {
        return next();
      }

      const key = `cache:${req.originalUrl}`;
      
      try {
        const cached = await this.get(key);
        
        if (cached) {
          return res.json(cached);
        }

        // Store original json method
        const originalJson = res.json;
        
        // Override json method to cache response
        res.json = (data) => {
          this.set(key, data, duration);
          return originalJson.call(res, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  // Product-specific caching
  async cacheProducts(products, duration = 1800) {
    await this.set('products:all', products, duration);
  }

  async getCachedProducts() {
    return await this.get('products:all');
  }

  async invalidateProductCache() {
    await this.del('products:all');
    // Also clear any product-specific caches
    const keys = await this.client?.keys('products:*') || [];
    if (keys.length > 0) {
      await this.client?.del(keys);
    }
  }

  // Order-specific caching
  async cacheUserOrders(userId, orders, duration = 600) {
    await this.set(`orders:user:${userId}`, orders, duration);
  }

  async getCachedUserOrders(userId) {
    return await this.get(`orders:user:${userId}`);
  }

  async invalidateUserOrders(userId) {
    await this.del(`orders:user:${userId}`);
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
