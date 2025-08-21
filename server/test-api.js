const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing products API...');
    const response = await fetch('http://localhost:5000/api/products');
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response structure:', {
      hasProducts: !!data.products,
      productsLength: data.products ? data.products.length : 0,
      totalProducts: data.totalProducts,
      sampleProduct: data.products ? data.products[0] : null
    });
    
    if (data.products && data.products.length > 0) {
      console.log('First product details:');
      const product = data.products[0];
      console.log({
        _id: product._id,
        id: product.id,
        name: product.name,
        price: product.price,
        inStock: product.inStock
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testAPI();
