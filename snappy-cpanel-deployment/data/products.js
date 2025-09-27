const products = [
  // Power Banks
  {
    name: '20000mAh Power Bank with Fast Charging',
    price: 899,
    originalPrice: 1199,
    description: 'High-capacity power bank with 20000mAh battery. Features dual USB outputs, USB-C input/output, and LED power indicator. Perfect for charging smartphones, tablets, and other devices multiple times.',
    brand: 'PowerMax',
    category: 'Power Banks',
    inStock: true,
    countInStock: 25,
    rating: 4.6,
    numReviews: 18,
    images: [
      'https://via.placeholder.com/650x650?text=Power+Bank+20000mAh',
      'https://via.placeholder.com/650x650?text=Power+Bank+Side+View'
    ],
    features: [
      '20000mAh High Capacity',
      'Dual USB-A Outputs',
      'USB-C Input/Output',
      'LED Power Indicator',
      'Multiple Safety Protections'
    ],
    specifications: {
      'Capacity': '20000mAh',
      'Input': 'USB-C 18W',
      'Output': 'USB-A 22.5W, USB-C 20W',
      'Weight': '420g',
      'Dimensions': '16.8 x 8.2 x 2.4 cm'
    },
    tags: ['power bank', 'charging', 'portable', 'fast charging'],
    weight: '420g',
    dimensions: '16.8 x 8.2 x 2.4 cm',
    warranty: '1 year'
  },

  // Wall Chargers
  {
    name: '65W GaN Fast Wall Charger',
    price: 649,
    originalPrice: 849,
    description: 'Compact GaN technology wall charger with 65W power output. Features USB-C and USB-A ports for charging laptops, smartphones, and tablets simultaneously.',
    brand: 'ChargeSpeed',
    category: 'Wall Chargers',
    inStock: true,
    countInStock: 30,
    rating: 4.8,
    numReviews: 22,
    images: [
      'https://via.placeholder.com/650x650?text=65W+GaN+Charger',
      'https://via.placeholder.com/650x650?text=GaN+Charger+Ports'
    ],
    features: [
      '65W Total Power Output',
      'GaN Technology - Compact Size',
      'USB-C PD 3.0',
      'USB-A QC 3.0',
      'Universal Compatibility'
    ],
    specifications: {
      'Total Output': '65W',
      'USB-C Output': '65W (PD 3.0)',
      'USB-A Output': '18W (QC 3.0)',
      'Input': '100-240V AC',
      'Size': '6.8 x 3.2 x 3.2 cm'
    },
    tags: ['wall charger', 'gan', 'fast charging', '65w', 'usb-c'],
    weight: '120g',
    dimensions: '6.8 x 3.2 x 3.2 cm',
    warranty: '2 years'
  },

  // Wireless Chargers
  {
    name: '15W Wireless Charging Pad',
    price: 499,
    originalPrice: 699,
    description: 'Fast 15W wireless charging pad compatible with all Qi-enabled devices. Features anti-slip design, LED indicator, and temperature control for safe charging.',
    brand: 'WirelessMax',
    category: 'Wireless Chargers',
    inStock: true,
    countInStock: 20,
    rating: 4.4,
    numReviews: 15,
    images: [
      'https://via.placeholder.com/650x650?text=15W+Wireless+Charger',
      'https://via.placeholder.com/650x650?text=Wireless+Charging+LED'
    ],
    features: [
      '15W Fast Wireless Charging',
      'Qi Certified',
      'Anti-Slip Design',
      'LED Charging Indicator',
      'Temperature Control'
    ],
    specifications: {
      'Output': 'Up to 15W',
      'Input': 'USB-C 20W',
      'Compatibility': 'All Qi-enabled devices',
      'Material': 'Aluminum + Silicone',
      'Dimensions': '10 x 10 x 0.8 cm'
    },
    tags: ['wireless charger', 'qi', '15w', 'fast charging'],
    weight: '150g',
    dimensions: '10 x 10 x 0.8 cm',
    warranty: '1 year'
  },

  // Earphones & AirPods
  {
    name: 'True Wireless Earbuds with ANC',
    price: 1299,
    originalPrice: 1699,
    description: 'Premium true wireless earbuds with active noise cancellation. Features 6-hour battery life, IPX7 waterproof rating, and crystal-clear call quality.',
    brand: 'AudioPro',
    category: 'Earphones & AirPods',
    inStock: true,
    countInStock: 15,
    rating: 4.7,
    numReviews: 28,
    images: [
      'https://via.placeholder.com/650x650?text=Wireless+Earbuds+ANC',
      'https://via.placeholder.com/650x650?text=Earbuds+Charging+Case'
    ],
    features: [
      'Active Noise Cancellation',
      '6H Battery + 24H Case',
      'IPX7 Waterproof',
      'Touch Controls',
      'Crystal Clear Calls'
    ],
    specifications: {
      'Battery Life': '6h + 24h case',
      'Connectivity': 'Bluetooth 5.2',
      'Water Resistance': 'IPX7',
      'Driver Size': '12mm',
      'Weight': '5g per earbud'
    },
    tags: ['earbuds', 'wireless', 'anc', 'waterproof'],
    weight: '50g',
    dimensions: '6.5 x 4.5 x 2.5 cm',
    warranty: '1 year'
  },

  // Phone Cases
  {
    name: 'Shockproof Clear Phone Case',
    price: 299,
    originalPrice: 399,
    description: 'Military-grade protection in a crystal-clear design. Drop-tested from 3 meters, this case offers maximum protection while showcasing your phone\'s design.',
    brand: 'ProtectMax',
    category: 'Phone Covers & Cases',
    inStock: true,
    countInStock: 50,
    rating: 4.5,
    numReviews: 35,
    images: [
      'https://via.placeholder.com/650x650?text=Clear+Shockproof+Case',
      'https://via.placeholder.com/650x650?text=Case+Corner+Protection'
    ],
    features: [
      'Military Grade Protection',
      'Crystal Clear Design',
      '3m Drop Protection',
      'Raised Camera Protection',
      'Wireless Charging Compatible'
    ],
    specifications: {
      'Material': 'TPU + Polycarbonate',
      'Drop Protection': '3 meters',
      'Compatibility': 'iPhone 14 Pro',
      'Weight': '45g',
      'Thickness': '1.2mm'
    },
    tags: ['phone case', 'clear', 'shockproof', 'protection'],
    weight: '45g',
    dimensions: '15.5 x 7.8 x 1.2 cm',
    warranty: '6 months'
  },

  // Screen Protectors
  {
    name: 'Tempered Glass Screen Protector',
    price: 199,
    originalPrice: 299,
    description: '9H hardness tempered glass screen protector with oleophobic coating. Easy bubble-free installation with included alignment tool.',
    brand: 'GlassShield',
    category: 'Screen Protectors',
    inStock: true,
    countInStock: 100,
    rating: 4.6,
    numReviews: 42,
    images: [
      'https://via.placeholder.com/650x650?text=Tempered+Glass+Protector',
      'https://via.placeholder.com/650x650?text=Installation+Kit'
    ],
    features: [
      '9H Hardness',
      'Oleophobic Coating',
      'Bubble-Free Installation',
      '99.9% Transparency',
      'Touch Sensitive'
    ],
    specifications: {
      'Hardness': '9H',
      'Thickness': '0.33mm',
      'Transparency': '99.9%',
      'Compatibility': 'iPhone 14 Pro',
      'Package': '2 protectors + tools'
    },
    tags: ['screen protector', 'tempered glass', '9h', 'clear'],
    weight: '20g',
    dimensions: '15.1 x 7.1 x 0.33 cm',
    warranty: '6 months'
  },

  // USB Cables
  {
    name: 'USB-C to Lightning Cable 2m',
    price: 349,
    originalPrice: 449,
    description: 'MFi certified USB-C to Lightning cable supporting fast charging up to 20W. Durable braided design with reinforced connectors.',
    brand: 'CableMax',
    category: 'Charging Cables',
    inStock: true,
    countInStock: 40,
    rating: 4.8,
    numReviews: 25,
    images: [
      'https://via.placeholder.com/650x650?text=USB-C+Lightning+Cable',
      'https://via.placeholder.com/650x650?text=Braided+Cable+Design'
    ],
    features: [
      'MFi Certified',
      'Fast Charging 20W',
      'Braided Design',
      'Reinforced Connectors',
      '2 Meter Length'
    ],
    specifications: {
      'Length': '2 meters',
      'Connector': 'USB-C to Lightning',
      'Power': 'Up to 20W',
      'Data Transfer': 'USB 2.0',
      'Material': 'Braided Nylon'
    },
    tags: ['cable', 'usb-c', 'lightning', 'mfi', 'braided'],
    weight: '80g',
    dimensions: '200 x 1.2 x 0.8 cm',
    warranty: '1 year'
  },

  // Flash Drives
  {
    name: '128GB USB 3.0 Flash Drive',
    price: 449,
    originalPrice: 599,
    description: 'High-speed 128GB USB 3.0 flash drive with metal casing. Perfect for storing and transferring large files with read speeds up to 150MB/s.',
    brand: 'DataMax',
    category: 'Flash Drives',
    inStock: true,
    countInStock: 35,
    rating: 4.5,
    numReviews: 18,
    images: [
      'https://via.placeholder.com/650x650?text=128GB+USB+3.0+Drive',
      'https://via.placeholder.com/650x650?text=Metal+USB+Drive'
    ],
    features: [
      '128GB Storage Capacity',
      'USB 3.0 High Speed',
      'Metal Housing',
      'Plug and Play',
      'Compact Design'
    ],
    specifications: {
      'Capacity': '128GB',
      'Interface': 'USB 3.0',
      'Read Speed': 'Up to 150MB/s',
      'Write Speed': 'Up to 40MB/s',
      'Material': 'Metal'
    },
    tags: ['flash drive', 'usb 3.0', '128gb', 'metal', 'storage'],
    weight: '15g',
    dimensions: '5.5 x 1.8 x 0.9 cm',
    warranty: '2 years'
  }
];

module.exports = products;
