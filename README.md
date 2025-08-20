# Snappy E-commerce Platform

A modern e-commerce website built with React, TypeScript, Node.js, Express, and MongoDB.

## Project Structure

```
Snappy/
├── client/                  # React frontend
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts (Auth, Cart, etc.)
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript type definitions
│   │   ├── services/        # API services
│   │   ├── App.tsx          # Main app component
│   │   └── index.tsx        # Entry point
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind configuration
├── server/                  # Express backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── data/                # Seed data
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # Express routes
│   ├── scripts/             # Utility scripts
│   ├── utils/               # Utility functions
│   ├── server.js            # Entry point
│   └── package.json         # Backend dependencies
├── init-db.bat              # Script to initialize the database
├── start-app.bat            # Script to start both frontend and backend
└── package.json             # Root package.json
```

## Features

- Modern, responsive UI built with Tailwind CSS
- Product catalog with search and filtering
- Shopping cart functionality
- User authentication with JWT
- Wishlist management
- Product detail pages
- Order placement and history
- MongoDB Atlas database integration

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Snappy.git
   cd Snappy
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   a. Create or edit `.env` file in the server directory:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

   b. Create or edit `.env` file in the client directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_USE_MOCK_DATA=false
   ```

4. **Initialize the database**
   ```bash
   cd ..
   init-db.bat
   ```

5. **Start the application**
   ```bash
   start-app.bat
   ```

### Alternative Manual Startup

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend client (in a separate terminal)**
   ```bash
   cd client
   npm start
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Usage

### User Accounts

The database is seeded with the following accounts:

- Admin User:
  - Email: admin@example.com
  - Password: password123

- Regular User:
  - Email: john@example.com
  - Password: password123

### Development Modes

#### Using Mock Data

If you want to develop without connecting to the backend API, you can set `REACT_APP_USE_MOCK_DATA=true` in the client's `.env` file. This will use the mock data instead of making API calls.

#### Using Real API

To use the real API, set `REACT_APP_USE_MOCK_DATA=false` in the client's `.env` file.

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users` - Register a new user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a product by ID
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id/related` - Get related products
- `GET /api/products/categories` - Get all categories
- `GET /api/products/brands` - Get all brands
- `GET /api/products/search` - Search products

### Wishlist
- `GET /api/users/wishlist` - Get user's wishlist
- `POST /api/users/wishlist` - Add product to wishlist
- `DELETE /api/users/wishlist/:id` - Remove product from wishlist
- `GET /api/users/wishlist/check/:id` - Check if product is in wishlist

### Cart
- `GET /api/cart/items` - Get user's cart
- `POST /api/cart/items` - Add product to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove product from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders/checkout` - Place an order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/:id/cancel` - Cancel an order

## Available Scripts

### Frontend
- `npm start` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm test` - Run frontend tests

### Backend
- `npm start` - Start backend production server
- `npm run dev` - Start backend development server with nodemon
- `npm test` - Run backend tests
- `npm run data:import` - Import seed data to the database
- `npm run data:destroy` - Clear all data from the database

## License

This project is licensed under the MIT License.
