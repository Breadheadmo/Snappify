const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

// Test profile update functionality
async function testProfileUpdate() {
  try {
    console.log('🧪 Testing Profile Update Functionality...\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE}/users/register`, {
      username: 'testuser_profile',
      email: 'testprofile@example.com',
      password: 'testpassword123'
    });

    if (registerResponse.status === 201) {
      console.log('✅ User registered successfully');
    }

    // Step 2: Login to get token
    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/users/login`, {
      email: 'testprofile@example.com',
      password: 'testpassword123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 3: Test profile update
    console.log('3. Testing profile update...');
    const updateResponse = await axios.put(`${API_BASE}/profile/update`, {
      username: 'updated_testuser',
      email: 'testprofile@example.com',
      phoneNumber: '+1234567890',
      defaultShippingAddress: {
        addressLine1: '123 Test Street',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        postalCode: '12345',
        country: 'US'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Profile updated successfully');
    console.log('Updated user data:', updateResponse.data.user);

    // Step 4: Test password change
    console.log('4. Testing password change...');
    const passwordResponse = await axios.put(`${API_BASE}/profile/change-password`, {
      currentPassword: 'testpassword123',
      newPassword: 'newpassword123'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Password changed successfully');

    // Step 5: Test settings update
    console.log('5. Testing settings update...');
    const settingsResponse = await axios.put(`${API_BASE}/profile/settings`, {
      notifications: false,
      language: 'es',
      currency: 'EUR'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Settings updated successfully');
    console.log('Updated settings:', settingsResponse.data.settings);

    console.log('\n🎉 All profile tests passed successfully!');

  } catch (error) {
    console.error('❌ Profile test failed:', error.response?.data || error.message);
  }
}

// Run the test
testProfileUpdate();
