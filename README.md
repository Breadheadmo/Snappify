# TechStore - Modern E-commerce Website

A professional, modern e-commerce website built with React, TypeScript, Node.js, and Tailwind CSS. Perfect for selling tech products like chargers, audio devices, and more.

## 🚀 Features

- **Modern Design**: Clean, professional UI with responsive design
- **Product Catalog**: Browse products by category with search and filtering
- **Product Details**: Comprehensive product pages with image galleries
- **Shopping Cart**: Full cart functionality with quantity controls
- **Responsive**: Mobile-first design that works on all devices
- **Fast Performance**: Optimized React components and efficient routing
- **Search & Filter**: Advanced product search and category filtering
- **Professional UI**: Beautiful animations and smooth transitions

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## 📁 Project Structure

```
Ecom/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── index.tsx      # Entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
├── server/                 # Node.js backend
│   └── index.js           # Express server
├── package.json            # Root dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Ecom
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the development servers**
   ```bash
   # Start both frontend and backend (recommended)
   npm run dev
   
   # Or start them separately:
   npm run server    # Backend on port 5000
   npm run client    # Frontend on port 3000
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start backend server only
- `npm run client` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## 🌟 Key Features Explained

### 1. Product Catalog
- Grid and list view options
- Category filtering
- Price and rating sorting
- Search functionality
- Responsive product cards

### 2. Product Details
- High-quality image galleries
- Detailed product information
- Feature lists
- Add to cart functionality
- Breadcrumb navigation

### 3. Shopping Cart
- Add/remove items
- Quantity controls
- Real-time price calculations
- Order summary
- Checkout process

### 4. Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Adaptive layouts
- Fast loading times

## 🎨 Customization

### Colors
Edit `client/tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... customize your brand colors
  }
}
```

### Products
Add your products in `server/index.js`:
```javascript
const products = [
  {
    id: 1,
    name: "Your Product Name",
    category: "Your Category",
    price: 29.99,
    // ... other properties
  }
];
```

### Styling
- Modify `client/src/index.css` for global styles
- Use Tailwind utility classes for component styling
- Customize component-specific styles in each component file

## 🔧 API Endpoints

- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get specific product
- `GET /api/categories` - Get all categories
- `GET /api/health` - Health check endpoint

### Query Parameters
- `category` - Filter by category
- `search` - Search products by name/description
- `sort` - Sort by price or rating

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deployment

### Frontend (React)
```bash
cd client
npm run build
# Deploy the 'build' folder to your hosting service
```

### Backend (Node.js)
```bash
# Set environment variables
PORT=5000
NODE_ENV=production

# Start the server
npm run server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you need help or have questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔮 Future Enhancements

- User authentication and accounts
- Payment processing integration
- Order management system
- Admin dashboard
- Product reviews and ratings
- Wishlist functionality
- Email notifications
- Analytics and reporting

---

**Built with ❤️ using modern web technologies**
