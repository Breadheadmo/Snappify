export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  category: string;
  brand: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  relatedProducts?: number[];
  tags: string[];
  weight: string;
  dimensions: string;
  warranty: string;
  returnPolicy: string;
  shippingInfo: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  wishlist: number[];
  orders: Order[];
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  estimatedDelivery?: Date;
  shippingAddress: Address;
  paymentMethod: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Review {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  helpful: number;
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 1899,
    originalPrice: 2499,
    discount: 24,
    image: 'https://via.placeholder.com/300x200?text=Headphones',
    images: [
      'https://via.placeholder.com/400x400?text=Headphones+1',
      'https://via.placeholder.com/400x400?text=Headphones+2',
      'https://via.placeholder.com/400x400?text=Headphones+3'
    ],
    rating: 4.5,
    reviews: 120,
    inStock: true,
    category: 'Electronics',
    brand: 'TechAudio',
    description: 'High-quality wireless headphones with noise cancellation.',
    features: ['Bluetooth 5.0', '20h Battery', 'Noise Cancelling'],
    specifications: {
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '20 hours',
      'Noise Cancellation': 'Active',
      'Driver Size': '40mm',
      'Frequency Response': '20Hz-20kHz'
    },
    relatedProducts: [2, 5, 8],
    tags: ['wireless', 'noise-cancelling', 'bluetooth', 'audio'],
    weight: '250g',
    dimensions: '18 x 7 x 3 cm',
    warranty: '2 years',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 2499,
    originalPrice: 2999,
    discount: 17,
    image: 'https://via.placeholder.com/300x200?text=Smart+Watch',
    images: [
      'https://via.placeholder.com/400x400?text=SmartWatch+1',
      'https://via.placeholder.com/400x400?text=SmartWatch+2'
    ],
    rating: 4.2,
    reviews: 80,
    inStock: true,
    category: 'Wearables',
    brand: 'SmartTech',
    description: 'Track your fitness and notifications on the go.',
    features: ['Heart Rate', 'GPS', 'Water Resistant'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery': '7 days',
      'Water Resistance': '5ATM',
      'GPS': 'Built-in',
      'Heart Rate': '24/7 monitoring'
    },
    relatedProducts: [1, 7, 9],
    tags: ['fitness', 'smartwatch', 'health', 'tracking'],
    weight: '45g',
    dimensions: '4.2 x 3.6 x 1.2 cm',
    warranty: '1 year',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 3,
    name: 'Gaming Mouse',
    price: 799,
    image: 'https://via.placeholder.com/300x200?text=Gaming+Mouse',
    images: [
      'https://via.placeholder.com/400x400?text=GamingMouse+1',
      'https://via.placeholder.com/400x400?text=GamingMouse+2'
    ],
    rating: 4.8,
    reviews: 200,
    inStock: false,
    category: 'Accessories',
    brand: 'GamePro',
    description: 'Ergonomic mouse with customizable buttons and RGB lighting.',
    features: ['16000 DPI', 'RGB', 'Programmable Buttons'],
    specifications: {
      'DPI': '16000',
      'Polling Rate': '1000Hz',
      'Buttons': '7 programmable',
      'RGB': '16.8M colors',
      'Weight': '95g'
    },
    relatedProducts: [6, 11, 14],
    tags: ['gaming', 'rgb', 'programmable', 'ergonomic'],
    weight: '95g',
    dimensions: '12.5 x 6.8 x 4.2 cm',
    warranty: '2 years',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 4,
    name: '4K Monitor',
    price: 5999,
    originalPrice: 6999,
    discount: 14,
    image: 'https://via.placeholder.com/300x200?text=4K+Monitor',
    images: [
      'https://via.placeholder.com/400x400?text=4KMonitor+1',
      'https://via.placeholder.com/400x400?text=4KMonitor+2'
    ],
    rating: 4.6,
    reviews: 65,
    inStock: true,
    category: 'Displays',
    brand: 'DisplayTech',
    description: 'Ultra HD monitor for stunning visuals and productivity.',
    features: ['3840x2160', 'IPS Panel', 'HDR'],
    specifications: {
      'Resolution': '3840x2160',
      'Panel Type': 'IPS',
      'Refresh Rate': '60Hz',
      'Response Time': '5ms',
      'HDR': 'HDR400'
    },
    relatedProducts: [10, 11, 12],
    tags: ['4k', 'ips', 'hdr', 'productivity'],
    weight: '5.2kg',
    dimensions: '62.5 x 35.8 x 23.5 cm',
    warranty: '3 years',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 5,
    name: 'Bluetooth Speaker',
    price: 1299,
    image: 'https://via.placeholder.com/300x200?text=Bluetooth+Speaker',
    images: [
      'https://via.placeholder.com/400x400?text=Speaker+1',
      'https://via.placeholder.com/400x400?text=Speaker+2'
    ],
    rating: 4.3,
    reviews: 150,
    inStock: true,
    category: 'Audio',
    brand: 'SoundWave',
    description: 'Portable speaker with deep bass and long battery life.',
    features: ['12h Battery', 'Waterproof', 'Deep Bass'],
    specifications: {
      'Power': '20W',
      'Battery': '12 hours',
      'Waterproof': 'IPX7',
      'Bluetooth': '5.0',
      'Frequency': '60Hz-20kHz'
    },
    relatedProducts: [1, 2, 8],
    tags: ['portable', 'waterproof', 'bluetooth', 'bass'],
    weight: '800g',
    dimensions: '15 x 8 x 8 cm',
    warranty: '1 year',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 6,
    name: 'Mechanical Keyboard',
    price: 1599,
    originalPrice: 1899,
    discount: 16,
    image: 'https://via.placeholder.com/300x200?text=Keyboard',
    images: [
      'https://via.placeholder.com/400x400?text=Keyboard+1',
      'https://via.placeholder.com/400x400?text=Keyboard+2'
    ],
    rating: 4.7,
    reviews: 110,
    inStock: true,
    category: 'Accessories',
    brand: 'KeyTech',
    description: 'RGB mechanical keyboard with tactile switches.',
    features: ['RGB Lighting', 'Tactile Switches', 'USB-C'],
    specifications: {
      'Switches': 'Cherry MX Brown',
      'Layout': 'Full size',
      'RGB': '16.8M colors',
      'Connection': 'USB-C',
      'Backlight': 'Per-key RGB'
    },
    relatedProducts: [3, 11, 14],
    tags: ['mechanical', 'rgb', 'tactile', 'gaming'],
    weight: '1.2kg',
    dimensions: '44.5 x 13.5 x 3.5 cm',
    warranty: '2 years',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 7,
    name: 'Fitness Tracker',
    price: 999,
    image: 'https://via.placeholder.com/300x200?text=Fitness+Tracker',
    images: [
      'https://via.placeholder.com/400x400?text=FitnessTracker+1'
    ],
    rating: 4.1,
    reviews: 90,
    inStock: true,
    category: 'Wearables',
    brand: 'FitTech',
    description: 'Track your steps, sleep, and heart rate.',
    features: ['Step Counter', 'Sleep Monitor', 'Heart Rate'],
    specifications: {
      'Display': '1.1" OLED',
      'Battery': '7 days',
      'Waterproof': 'IP68',
      'Sensors': 'Heart rate, accelerometer',
      'Compatibility': 'iOS/Android'
    },
    relatedProducts: [2, 8, 9],
    tags: ['fitness', 'tracking', 'health', 'wearable'],
    weight: '25g',
    dimensions: '3.8 x 2.4 x 1.2 cm',
    warranty: '1 year',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 8,
    name: 'Drone',
    price: 3499,
    originalPrice: 3999,
    discount: 13,
    image: 'https://via.placeholder.com/300x200?text=Drone',
    images: [
      'https://via.placeholder.com/400x400?text=Drone+1',
      'https://via.placeholder.com/400x400?text=Drone+2'
    ],
    rating: 4.4,
    reviews: 60,
    inStock: false,
    category: 'Electronics',
    brand: 'SkyTech',
    description: 'Capture stunning aerial footage with this easy-to-fly drone.',
    features: ['4K Camera', 'GPS', '30min Flight'],
    specifications: {
      'Camera': '4K UHD',
      'Flight Time': '30 minutes',
      'Range': '2km',
      'GPS': 'Built-in',
      'Weight': '430g'
    },
    relatedProducts: [1, 4, 12],
    tags: ['drone', '4k', 'aerial', 'photography'],
    weight: '430g',
    dimensions: '28 x 28 x 12 cm',
    warranty: '1 year',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 9,
    name: 'Smartphone',
    price: 8999,
    originalPrice: 9999,
    discount: 10,
    image: 'https://via.placeholder.com/300x200?text=Smartphone',
    images: [
      'https://via.placeholder.com/400x400?text=Smartphone+1',
      'https://via.placeholder.com/400x400?text=Smartphone+2'
    ],
    rating: 4.9,
    reviews: 300,
    inStock: true,
    category: 'Electronics',
    brand: 'PhoneTech',
    description: 'Latest-gen smartphone with powerful performance.',
    features: ['AMOLED', '128GB', 'Triple Camera'],
    specifications: {
      'Display': '6.1" AMOLED',
      'Storage': '128GB',
      'Camera': 'Triple 48MP',
      'Battery': '4000mAh',
      'Processor': 'Snapdragon 8 Gen 2'
    },
    relatedProducts: [1, 2, 10],
    tags: ['smartphone', 'amoled', 'camera', '5g'],
    weight: '180g',
    dimensions: '14.7 x 7.1 x 0.8 cm',
    warranty: '2 years',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 10,
    name: 'Tablet',
    price: 4999,
    image: 'https://via.placeholder.com/300x200?text=Tablet',
    images: [
      'https://via.placeholder.com/400x400?text=Tablet+1',
      'https://via.placeholder.com/400x400?text=Tablet+2'
    ],
    rating: 4.5,
    reviews: 140,
    inStock: true,
    category: 'Electronics',
    brand: 'TabTech',
    description: 'Lightweight tablet for work and play.',
    features: ['10.5" Display', '64GB', 'Long Battery'],
    specifications: {
      'Display': '10.5" Retina',
      'Storage': '64GB',
      'Battery': '10 hours',
      'Processor': 'A14 Bionic',
      'Weight': '450g'
    },
    relatedProducts: [4, 9, 11],
    tags: ['tablet', 'retina', 'portable', 'productivity'],
    weight: '450g',
    dimensions: '24.8 x 17.4 x 0.6 cm',
    warranty: '1 year',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 11,
    name: 'Laptop',
    price: 12999,
    originalPrice: 14999,
    discount: 13,
    image: 'https://via.placeholder.com/300x200?text=Laptop',
    images: [
      'https://via.placeholder.com/400x400?text=Laptop+1',
      'https://via.placeholder.com/400x400?text=Laptop+2'
    ],
    rating: 4.8,
    reviews: 210,
    inStock: true,
    category: 'Computers',
    brand: 'LapTech',
    description: 'High-performance laptop for professionals.',
    features: ['i7 CPU', '16GB RAM', '512GB SSD'],
    specifications: {
      'Processor': 'Intel i7-12700H',
      'RAM': '16GB DDR4',
      'Storage': '512GB NVMe SSD',
      'Display': '15.6" FHD',
      'Graphics': 'RTX 3050'
    },
    relatedProducts: [4, 6, 10],
    tags: ['laptop', 'gaming', 'professional', 'performance'],
    weight: '2.1kg',
    dimensions: '35.9 x 24.9 x 2.3 cm',
    warranty: '2 years',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 12,
    name: 'Action Camera',
    price: 2599,
    image: 'https://via.placeholder.com/300x200?text=Action+Camera',
    images: [
      'https://via.placeholder.com/400x400?text=ActionCamera+1',
      'https://via.placeholder.com/400x400?text=ActionCamera+2'
    ],
    rating: 4.6,
    reviews: 75,
    inStock: true,
    category: 'Cameras',
    brand: 'ActionCam',
    description: 'Rugged action camera for all your adventures.',
    features: ['4K Video', 'Waterproof', 'Image Stabilization'],
    specifications: {
      'Video': '4K 30fps',
      'Photo': '12MP',
      'Waterproof': '10m',
      'Stabilization': 'EIS',
      'Battery': '90 minutes'
    },
    relatedProducts: [8, 9, 13],
    tags: ['action', '4k', 'waterproof', 'adventure'],
    weight: '120g',
    dimensions: '5.9 x 4.1 x 2.9 cm',
    warranty: '1 year',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 13,
    name: 'E-Reader',
    price: 1399,
    image: 'https://via.placeholder.com/300x200?text=E-Reader',
    images: [
      'https://via.placeholder.com/400x400?text=EReader+1'
    ],
    rating: 4.3,
    reviews: 55,
    inStock: true,
    category: 'Electronics',
    brand: 'ReadTech',
    description: 'Read your favorite books on the go.',
    features: ['E-Ink', 'Backlight', '8GB Storage'],
    specifications: {
      'Display': '6" E-Ink',
      'Storage': '8GB',
      'Battery': '4 weeks',
      'Backlight': 'Adjustable',
      'Weight': '180g'
    },
    relatedProducts: [10, 14, 15],
    tags: ['ereader', 'eink', 'books', 'reading'],
    weight: '180g',
    dimensions: '16.7 x 11.7 x 0.8 cm',
    warranty: '1 year',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 14,
    name: 'Portable SSD',
    price: 1099,
    originalPrice: 1299,
    discount: 15,
    image: 'https://via.placeholder.com/300x200?text=SSD',
    images: [
      'https://via.placeholder.com/400x400?text=SSD+1'
    ],
    rating: 4.7,
    reviews: 95,
    inStock: true,
    category: 'Storage',
    brand: 'SpeedTech',
    description: 'Fast and reliable portable SSD.',
    features: ['1TB', 'USB 3.1', 'Shock Resistant'],
    specifications: {
      'Capacity': '1TB',
      'Interface': 'USB 3.1 Gen 2',
      'Speed': '1050 MB/s',
      'Durability': 'Shock resistant',
      'Size': 'Pocket-sized'
    },
    relatedProducts: [6, 11, 15],
    tags: ['ssd', 'portable', 'fast', 'storage'],
    weight: '45g',
    dimensions: '7.5 x 5.1 x 0.8 cm',
    warranty: '3 years',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 15,
    name: 'Smart Light Bulb',
    price: 299,
    image: 'https://via.placeholder.com/300x200?text=Light+Bulb',
    images: [
      'https://via.placeholder.com/400x400?text=LightBulb+1'
    ],
    rating: 4.2,
    reviews: 40,
    inStock: true,
    category: 'Home',
    brand: 'SmartHome',
    description: 'Control your lights with your phone or voice.',
    features: ['WiFi', 'Color Changing', 'Energy Efficient'],
    specifications: {
      'Power': '9W',
      'Brightness': '800 lumens',
      'Colors': '16 million',
      'WiFi': '2.4GHz',
      'Life': '25,000 hours'
    },
    relatedProducts: [13, 14, 16],
    tags: ['smart', 'wifi', 'color', 'home'],
    weight: '120g',
    dimensions: '6 x 6 x 11 cm',
    warranty: '2 years',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
  {
    id: 16,
    name: 'VR Headset',
    price: 5999,
    originalPrice: 6999,
    discount: 14,
    image: 'https://via.placeholder.com/300x200?text=VR+Headset',
    images: [
      'https://via.placeholder.com/400x400?text=VRHeadset+1',
      'https://via.placeholder.com/400x400?text=VRHeadset+2'
    ],
    rating: 4.5,
    reviews: 70,
    inStock: true,
    category: 'Gaming',
    brand: 'VRTech',
    description: 'Immersive VR experience for gaming and more.',
    features: ['6DOF', 'Wireless', 'High Resolution'],
    specifications: {
      'Resolution': '1832x1920 per eye',
      'Field of View': '110°',
      'Tracking': '6DOF',
      'Connection': 'Wireless',
      'Battery': '2-3 hours'
    },
    relatedProducts: [3, 6, 11],
    tags: ['vr', 'gaming', 'immersive', 'wireless'],
    weight: '470g',
    dimensions: '18 x 12 x 8 cm',
    warranty: '1 year',
    returnPolicy: '30 days',
    shippingInfo: 'Free shipping over R800'
  },
];

export const mockCategories = [
  'Electronics',
  'Wearables', 
  'Accessories',
  'Displays',
  'Audio',
  'Computers',
  'Cameras',
  'Storage',
  'Home',
  'Gaming'
];

export const mockBrands = [
  'TechAudio',
  'SmartTech',
  'GamePro',
  'DisplayTech',
  'SoundWave',
  'KeyTech',
  'FitTech',
  'SkyTech',
  'PhoneTech',
  'TabTech',
  'LapTech',
  'ActionCam',
  'ReadTech',
  'SpeedTech',
  'SmartHome',
  'VRTech'
];
