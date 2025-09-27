# Snappy Backend API

RESTful API for the Snappy E-commerce Platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/snappy
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=30d
   ```

3. Seed the database with sample data:
   ```bash
   npm run data:import
   ```

## Scripts

- `npm start` - Start the server
- `npm run dev` - Start the server with nodemon (auto-reload on changes)
- `npm test` - Run tests
- `npm run data:import` - Import sample data into the database
- `npm run data:destroy` - Clear all data from the database

## API Endpoints

### Authentication
- `POST /api/users/login` - Login user & get token
- `POST /api/users` - Register a new user
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a product (Admin)
- `PUT /api/products/:id` - Update a product (Admin)
- `DELETE /api/products/:id` - Delete a product (Admin)
- `POST /api/products/:id/reviews` - Create product review (Protected)
- `GET /api/products/top` - Get top rated products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/brands` - Get product brands

### Orders
- `POST /api/orders` - Create new order (Protected)
- `GET /api/orders/myorders` - Get logged in user orders (Protected)
- `GET /api/orders/:id` - Get order by ID (Protected)
- `PUT /api/orders/:id/pay` - Update order to paid (Protected)
- `PUT /api/orders/:id/deliver` - Update order to delivered (Admin)
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order (Protected)

### Wishlist
- `GET /api/wishlist` - Get user wishlist (Protected)
- `POST /api/wishlist` - Add product to wishlist (Protected)
- `DELETE /api/wishlist/:productId` - Remove product from wishlist (Protected)

### Cart
- `POST /api/cart/validate` - Validate cart items and get updated info
- `GET /api/cart/shipping-options` - Get shipping options

## Data Models

### User
- username (String, required, unique)
- email (String, required, unique)
- password (String, required)
- isAdmin (Boolean)
- profilePicture (String)
- phoneNumber (String)
- defaultShippingAddress (Object)
- wishlist (Array of Product IDs)

### Product
- name (String, required)
- price (Number, required)
- description (String, required)
- images (Array of Strings, required)
- brand (String, required)
- category (String, required)
- inStock (Boolean, required)
- countInStock (Number, required)
- rating (Number)
- numReviews (Number)
- reviews (Array of Review Objects)
- features (Array of Strings)
- specifications (Map of String key-value pairs)
- relatedProducts (Array of Product IDs)
- tags (Array of Strings)
- weight (String)
- dimensions (String)
- warranty (String)

### Order
- user (User ID, required)
- orderItems (Array of items with product, name, image, price, quantity)
- shippingAddress (Object with address details)
- paymentMethod (String, required)
- paymentResult (Object with payment details)
- shippingMethod (Object with shipping details)
- taxPrice (Number, required)
- shippingPrice (Number, required)
- subtotal (Number, required)
- totalPrice (Number, required)
- isPaid (Boolean, required)
- paidAt (Date)
- isDelivered (Boolean, required)
- deliveredAt (Date)
- status (String, enum: 'Processing', 'Shipped', 'Delivered', 'Cancelled')
- trackingNumber (String)
