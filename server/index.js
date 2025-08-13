const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Sample product data
const products = [
  {
    id: 1,
    name: "iPhone 15 Pro Max Charger",
    category: "Chargers",
    price: 29.99,
    image: "/images/iphone-charger.jpg",
    description: "Fast charging USB-C cable for iPhone 15 Pro Max with premium build quality.",
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    features: ["USB-C", "Fast Charging", "Premium Cable", "1 Year Warranty"]
  },
  {
    id: 2,
    name: "AirPods Pro 2nd Generation",
    category: "Audio",
    price: 249.99,
    image: "/images/airpods-pro.jpg",
    description: "Active noise cancellation, spatial audio, and sweat and water resistance.",
    rating: 4.9,
    reviews: 2156,
    inStock: true,
    features: ["Active Noise Cancellation", "Spatial Audio", "Water Resistant", "Wireless Charging"]
  },
  {
    id: 3,
    name: "JBL Flip 6 Bluetooth Speaker",
    category: "Audio",
    price: 129.99,
    image: "/images/jbl-speaker.jpg",
    description: "Portable Bluetooth speaker with powerful bass and 12 hours of playtime.",
    rating: 4.7,
    reviews: 892,
    inStock: true,
    features: ["Bluetooth 5.1", "12 Hour Battery", "Waterproof", "PartyBoost"]
  },
  {
    id: 4,
    name: "Samsung Galaxy Fast Charger",
    category: "Chargers",
    price: 24.99,
    image: "/images/samsung-charger.jpg",
    description: "25W fast charging adapter for Samsung Galaxy devices.",
    rating: 4.6,
    reviews: 567,
    inStock: true,
    features: ["25W Fast Charging", "USB-C", "Compact Design", "Galaxy Compatible"]
  },
  {
    id: 5,
    name: "Sony WH-1000XM5 Headphones",
    category: "Audio",
    price: 399.99,
    image: "/images/sony-headphones.jpg",
    description: "Industry-leading noise canceling wireless headphones with exceptional sound quality.",
    rating: 4.9,
    reviews: 1834,
    inStock: true,
    features: ["Industry-leading ANC", "30 Hour Battery", "Touch Controls", "Premium Audio"]
  },
  {
    id: 6,
    name: "Anker PowerCore 20000mAh",
    category: "Chargers",
    price: 49.99,
    image: "/images/anker-powerbank.jpg",
    description: "High-capacity portable charger with fast charging technology.",
    rating: 4.8,
    reviews: 2341,
    inStock: true,
    features: ["20000mAh Capacity", "Fast Charging", "Dual USB", "Compact Design"]
  }
];

// Routes
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  
  let filteredProducts = [...products];
  
  // Filter by category
  if (category && category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  // Search functionality
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Sorting
  if (sort === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }
  
  res.json(filteredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
