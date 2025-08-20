const products = [
  {
    name: 'Wireless Earbuds',
    price: 1299,
    originalPrice: 1499,
    description: 'Premium wireless earbuds with noise cancellation and crystal-clear sound quality. These earbuds offer an immersive audio experience with deep bass and crisp highs. The compact charging case provides extended battery life for all-day listening.',
    brand: 'SoundWave',
    category: 'Audio',
    inStock: true,
    countInStock: 15,
    rating: 4.5,
    numReviews: 12,
    images: [
      'https://via.placeholder.com/650x650?text=Wireless+Earbuds+1',
      'https://via.placeholder.com/650x650?text=Wireless+Earbuds+2',
      'https://via.placeholder.com/650x650?text=Wireless+Earbuds+3'
    ],
    features: [
      'Active Noise Cancellation',
      'Bluetooth 5.2',
      'IPX7 Waterproof',
      '24h Battery Life',
      'Touch Controls'
    ],
    specifications: {
      'Battery Life': '6h (24h with case)',
      'Connectivity': 'Bluetooth 5.2',
      'Water Resistance': 'IPX7',
      'Weight': '5g per earbud, 45g case'
    },
    tags: ['wireless', 'earbuds', 'audio', 'bluetooth'],
    weight: '50g',
    dimensions: '6.5 x 4.5 x 2.5 cm',
    warranty: '1 year'
  },
  {
    name: '65" 4K Smart TV',
    price: 11999,
    originalPrice: 13999,
    description: 'Experience stunning clarity and vibrant colors with this 65-inch 4K smart TV. Features include HDR technology, built-in streaming apps, and voice control functionality for a seamless viewing experience.',
    brand: 'VisionPlus',
    category: 'Electronics',
    inStock: true,
    countInStock: 5,
    rating: 4.8,
    numReviews: 10,
    images: [
      'https://via.placeholder.com/650x650?text=Smart+TV+1',
      'https://via.placeholder.com/650x650?text=Smart+TV+2'
    ],
    features: [
      '4K Ultra HD Resolution',
      'HDR10+',
      'Smart TV Platform',
      'Voice Control',
      'Multiple HDMI Ports'
    ],
    specifications: {
      'Screen Size': '65 inches',
      'Resolution': '3840 x 2160 (4K)',
      'Refresh Rate': '120Hz',
      'Connectivity': 'Wi-Fi, Bluetooth, HDMI x3, USB x2',
      'Audio': '20W Built-in Speakers'
    },
    tags: ['tv', '4k', 'smart tv', 'hdr', 'electronics'],
    weight: '25kg',
    dimensions: '145.3 x 83.8 x 7.1 cm',
    warranty: '2 years'
  },
  {
    name: 'Professional Blender',
    price: 2499,
    originalPrice: 2999,
    description: 'High-performance blender with variable speed control and pulse feature. Powerful enough to blend even the toughest ingredients into smooth perfection. Ideal for smoothies, soups, nut butters, and more.',
    brand: 'KitchenPro',
    category: 'Appliances',
    inStock: true,
    countInStock: 8,
    rating: 4.6,
    numReviews: 15,
    images: [
      'https://via.placeholder.com/650x650?text=Blender+1',
      'https://via.placeholder.com/650x650?text=Blender+2'
    ],
    features: [
      '1200W Motor',
      'Variable Speed Control',
      'Pulse Function',
      '1.8L BPA-Free Container',
      'Hardened Steel Blades'
    ],
    specifications: {
      'Power': '1200W',
      'Capacity': '1.8L',
      'Speed Settings': '10 + Pulse',
      'Material': 'BPA-Free Plastic & Stainless Steel',
      'Programs': '5 Preset Programs'
    },
    tags: ['blender', 'kitchen', 'appliance', 'smoothie'],
    weight: '4.2kg',
    dimensions: '20 x 22 x 44 cm',
    warranty: '3 years'
  },
  {
    name: 'Ergonomic Office Chair',
    price: 1899,
    originalPrice: 2199,
    description: 'Designed for comfort during long work hours, this ergonomic office chair features adjustable lumbar support, breathable mesh back, and customizable armrests. The perfect addition to any home office or workspace.',
    brand: 'ComfortPlus',
    category: 'Furniture',
    inStock: true,
    countInStock: 12,
    rating: 4.7,
    numReviews: 22,
    images: [
      'https://via.placeholder.com/650x650?text=Office+Chair+1',
      'https://via.placeholder.com/650x650?text=Office+Chair+2'
    ],
    features: [
      'Adjustable Lumbar Support',
      'Breathable Mesh Back',
      'Padded Seat Cushion',
      'Adjustable Armrests',
      '360° Swivel'
    ],
    specifications: {
      'Weight Capacity': '150kg',
      'Seat Height': '45-55cm (Adjustable)',
      'Material': 'Mesh, Foam, Steel Frame',
      'Recline': 'Up to 135°',
      'Base': '5-Point with Wheels'
    },
    tags: ['chair', 'office', 'furniture', 'ergonomic'],
    weight: '15kg',
    dimensions: '65 x 65 x 115 cm',
    warranty: '2 years'
  },
  {
    name: 'Smartphone 5G',
    price: 9999,
    originalPrice: 11999,
    description: 'Cutting-edge smartphone with 5G connectivity, professional-grade camera system, and all-day battery life. The edge-to-edge AMOLED display delivers stunning visuals for gaming, streaming, and everyday use.',
    brand: 'PhoneTech',
    category: 'Electronics',
    inStock: true,
    countInStock: 20,
    rating: 4.9,
    numReviews: 32,
    images: [
      'https://via.placeholder.com/650x650?text=Smartphone+1',
      'https://via.placeholder.com/650x650?text=Smartphone+2'
    ],
    features: [
      '5G Connectivity',
      '6.5" AMOLED Display',
      'Triple Camera System',
      '256GB Storage',
      'All-Day Battery'
    ],
    specifications: {
      'Display': '6.5" AMOLED 120Hz',
      'Processor': 'Octa-core 3.0GHz',
      'RAM': '8GB',
      'Storage': '256GB',
      'Battery': '4500mAh',
      'OS': 'Android 12'
    },
    tags: ['smartphone', '5g', 'camera', 'electronics'],
    weight: '189g',
    dimensions: '15.1 x 7.3 x 0.8 cm',
    warranty: '1 year'
  },
  {
    name: 'Wireless Charging Pad',
    price: 499,
    originalPrice: 699,
    description: 'Convenient wireless charging pad compatible with all Qi-enabled devices. Features fast charging technology and a sleek, minimalist design that complements any space. The non-slip surface keeps your device secure during charging.',
    brand: 'PowerUp',
    category: 'Accessories',
    inStock: true,
    countInStock: 30,
    rating: 4.4,
    numReviews: 18,
    images: [
      'https://via.placeholder.com/650x650?text=Charging+Pad+1',
      'https://via.placeholder.com/650x650?text=Charging+Pad+2'
    ],
    features: [
      'Qi Wireless Charging',
      'Fast Charge 15W',
      'LED Indicator',
      'Non-Slip Surface',
      'Compact Design'
    ],
    specifications: {
      'Input': 'USB-C, 20W',
      'Output': 'Up to 15W',
      'Compatibility': 'All Qi-enabled devices',
      'Material': 'Aluminum & Silicone',
      'Size': 'Diameter 10cm'
    },
    tags: ['charger', 'wireless', 'accessory', 'smartphone'],
    weight: '150g',
    dimensions: '10 x 10 x 1.2 cm',
    warranty: '1 year'
  },
  {
    name: 'Smart Home Security Camera',
    price: 1699,
    originalPrice: 1999,
    description: 'Keep your home secure with this smart security camera featuring 1080p HD video, night vision, and motion detection. Receive real-time alerts on your smartphone and easily integrate with your existing smart home system.',
    brand: 'SecureView',
    category: 'Smart Home',
    inStock: true,
    countInStock: 15,
    rating: 4.6,
    numReviews: 25,
    images: [
      'https://via.placeholder.com/650x650?text=Security+Camera+1',
      'https://via.placeholder.com/650x650?text=Security+Camera+2'
    ],
    features: [
      '1080p HD Video',
      'Night Vision',
      'Motion Detection',
      'Two-way Audio',
      'Cloud Storage'
    ],
    specifications: {
      'Resolution': '1080p HD',
      'Field of View': '130°',
      'Night Vision': 'Up to 10m',
      'Storage': 'Cloud + MicroSD (up to 128GB)',
      'Power': 'DC 5V or Battery (included)'
    },
    tags: ['camera', 'security', 'smart home', 'wifi'],
    weight: '320g',
    dimensions: '11 x 7 x 7 cm',
    warranty: '2 years'
  },
  {
    name: 'Premium Coffee Maker',
    price: 1999,
    originalPrice: 2499,
    description: 'Brew barista-quality coffee at home with this premium coffee maker. Features include customizable brew strength, built-in grinder, and programmable timer. The thermal carafe keeps your coffee hot for hours without burning.',
    brand: 'BrewMaster',
    category: 'Appliances',
    inStock: true,
    countInStock: 10,
    rating: 4.8,
    numReviews: 30,
    images: [
      'https://via.placeholder.com/650x650?text=Coffee+Maker+1',
      'https://via.placeholder.com/650x650?text=Coffee+Maker+2'
    ],
    features: [
      'Built-in Grinder',
      'Programmable Timer',
      'Customizable Brew Strength',
      'Thermal Carafe',
      'Self-Cleaning Function'
    ],
    specifications: {
      'Capacity': '10 Cups',
      'Water Tank': '1.5L',
      'Grinder': 'Conical Burr Grinder',
      'Power': '1000W',
      'Materials': 'Stainless Steel & Glass'
    },
    tags: ['coffee', 'appliance', 'kitchen', 'brewing'],
    weight: '5.2kg',
    dimensions: '25 x 20 x 40 cm',
    warranty: '2 years'
  }
];

module.exports = products;
