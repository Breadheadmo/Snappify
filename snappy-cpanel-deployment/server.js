const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
// Load polyfill to fix deprecation warning
require('./utils/polyfill');
const connectDB = require('./config/db');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');
const { securityMiddleware, generalLimiter, authLimiter, apiLimiter } = require('./middleware/securityMiddleware');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy settings for production (when behind reverse proxy/load balancer)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
} else {
  // In development, don't trust proxies to avoid X-Forwarded-For issues
  app.set('trust proxy', false);
}

// Security middleware
app.use(securityMiddleware);

// General rate limiting
app.use(generalLimiter);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes with specific rate limiting
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users/login', authLimiter);
app.use('/api/users', authLimiter);

// API routes with general rate limiting
app.use('/api', apiLimiter);
app.use('/api/images', require('./routes/imageRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/tracking', require('./routes/trackingRoutes'));
app.use('/api/email-test', require('./routes/emailTest'));

// Set static folder in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
