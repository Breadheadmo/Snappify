const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

const testTrackingAPI = async () => {
  console.log('🧪 Testing Tracking API Endpoints...\n');

  try {
    // Test 1: Public tracking (should work without auth)
    console.log('1️⃣ Testing public tracking...');
    try {
      const response = await axios.get(`${API_BASE}/tracking/TEST123456789`);
      if (response.data.success) {
        console.log('✅ Public tracking works');
        console.log('📦 Tracking data:', response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ No tracking number found (expected for first run)');
      } else {
        console.log('❌ Public tracking failed:', error.message);
      }
    }

    // Test 2: Admin login to get token
    console.log('\n2️⃣ Testing admin authentication...');
    let adminToken = '';
    try {
      const loginResponse = await axios.post(`${API_BASE}/users/login`, {
        email: 'admin@snappy.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.token) {
        adminToken = loginResponse.data.token;
        console.log('✅ Admin login successful');
      }
    } catch (error) {
      console.log('⚠️ Admin login failed (might need to create admin user):', error.response?.data?.message || error.message);
    }

    // Test 3: Get orders (if admin token available)
    if (adminToken) {
      console.log('\n3️⃣ Testing admin order access...');
      try {
        const ordersResponse = await axios.get(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (ordersResponse.data.length > 0) {
          const firstOrder = ordersResponse.data[0];
          console.log('✅ Orders retrieved successfully');
          console.log('📋 Sample order ID:', firstOrder._id);
          
          // Test 4: Update tracking for this order
          console.log('\n4️⃣ Testing tracking update...');
          try {
            const trackingUpdate = await axios.put(`${API_BASE}/tracking/order/${firstOrder._id}`, {
              trackingNumber: `TR${Date.now()}`,
              carrier: 'DHL',
              currentStage: 'shipped',
              estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              trackingUrl: `https://dhl.com/track/TR${Date.now()}`
            }, {
              headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (trackingUpdate.data.success) {
              console.log('✅ Tracking update successful');
              console.log('📦 Updated order:', trackingUpdate.data.order.trackingNumber);
            }
          } catch (error) {
            console.log('❌ Tracking update failed:', error.response?.data?.message || error.message);
          }
        }
      } catch (error) {
        console.log('❌ Orders retrieval failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 5: Test bulk update endpoint (if admin token available)
    if (adminToken) {
      console.log('\n5️⃣ Testing bulk tracking update...');
      try {
        const bulkResponse = await axios.put(`${API_BASE}/tracking/bulk-update`, {
          updates: [] // Empty for test - would contain actual order updates
        }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        if (bulkResponse.data.success) {
          console.log('✅ Bulk update endpoint works');
        }
      } catch (error) {
        console.log('❌ Bulk update failed:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n✅ API testing completed!');
    
  } catch (error) {
    console.log('❌ API test suite failed:', error.message);
  }
};

// Test server connectivity first
const testServerConnection = async () => {
  console.log('🔗 Testing server connection...');
  try {
    const response = await axios.get(`${API_BASE.replace('/api', '')}/`);
    console.log('✅ Server is running');
    return true;
  } catch (error) {
    console.log('❌ Server connection failed. Make sure the server is running on port 5001');
    console.log('💡 Run: cd server && npm start');
    return false;
  }
};

const runTests = async () => {
  const serverRunning = await testServerConnection();
  if (serverRunning) {
    await testTrackingAPI();
  }
};

// Add axios request/response interceptors for debugging
axios.interceptors.request.use(request => {
  console.log(`🚀 ${request.method?.toUpperCase()} ${request.url}`);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    console.log(`❌ ${error.response?.status || 'ERROR'} ${error.config?.url}`);
    return Promise.reject(error);
  }
);

if (require.main === module) {
  runTests();
}

module.exports = { testTrackingAPI, testServerConnection };
