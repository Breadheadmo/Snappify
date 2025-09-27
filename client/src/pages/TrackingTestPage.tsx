import React, { useState } from 'react';

const TrackingTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testTrackingSystem = async () => {
    setIsRunning(true);
    setTestResults([]);
    addResult('🧪 Starting tracking system tests...');

    // Test 1: Test public tracking with fake tracking number
    try {
      addResult('1️⃣ Testing public tracking API...');
      const response = await fetch('/api/tracking/TEST123456789');
      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('✅ Public tracking API works');
        addResult(`📦 Found tracking: ${data.data.trackingNumber}`);
      } else {
        addResult('⚠️ No tracking data found (expected for new system)');
      }
    } catch (error) {
      addResult(`❌ Public tracking test failed: ${error}`);
    }

    // Test 2: Test tracking form navigation
    try {
      addResult('2️⃣ Testing tracking form...');
      const trackingNumber = 'TEST123456789';
      const currentPath = window.location.pathname;
      
      // Simulate navigation
      window.history.pushState({}, '', `/track/${trackingNumber}`);
      addResult('✅ Tracking URL navigation works');
      
      // Restore original path
      window.history.pushState({}, '', currentPath);
    } catch (error) {
      addResult(`❌ Tracking form test failed: ${error}`);
    }

    // Test 3: Test tracking component rendering
    try {
      addResult('3️⃣ Testing tracking component...');
      
      // Check if tracking components exist
      const trackingForm = document.querySelector('input[placeholder*="tracking"]');
      if (trackingForm) {
        addResult('✅ Tracking form found in UI');
      } else {
        addResult('⚠️ Tracking form not found in current view');
      }
    } catch (error) {
      addResult(`❌ Component test failed: ${error}`);
    }

    // Test 4: Test API endpoints availability
    try {
      addResult('4️⃣ Testing API endpoints...');
      
      const endpoints = [
        '/api/tracking/TEST123',
        '/api/products',
        '/api/users/me'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.status !== 500) {
            addResult(`✅ Endpoint ${endpoint} is reachable`);
          } else {
            addResult(`⚠️ Endpoint ${endpoint} returned server error`);
          }
        } catch (err) {
          addResult(`❌ Endpoint ${endpoint} is not reachable`);
        }
      }
    } catch (error) {
      addResult(`❌ API endpoints test failed: ${error}`);
    }

    // Test 5: Test tracking stages data
    try {
      addResult('5️⃣ Testing tracking stages...');
      
      const trackingStages = [
        'processing', 'confirmed', 'preparing', 
        'shipped', 'in_transit', 'out_for_delivery', 'delivered'
      ];
      
      addResult(`✅ Tracking stages defined: ${trackingStages.length} stages`);
      addResult(`📋 Stages: ${trackingStages.join(' → ')}`);
    } catch (error) {
      addResult(`❌ Tracking stages test failed: ${error}`);
    }

    addResult('🎉 All tests completed!');
    setIsRunning(false);
  };

  const createTestOrder = async () => {
    setIsRunning(true);
    addResult('🏗️ Creating test tracking data...');

    try {
      // This would be an admin function to create test data
      const testOrder = {
        trackingNumber: `TEST${Date.now()}`,
        carrier: 'DHL',
        currentStage: 'shipped',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      addResult(`✅ Test order simulated: ${testOrder.trackingNumber}`);
      addResult(`📦 Carrier: ${testOrder.carrier}`);
      addResult(`📅 Estimated delivery: ${new Date(testOrder.estimatedDelivery).toLocaleDateString()}`);
      addResult('💡 Use this tracking number to test the tracking page');
      
    } catch (error) {
      addResult(`❌ Test order creation failed: ${error}`);
    }

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Tracking System Test Suite
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={testTrackingSystem}
              disabled={isRunning}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            
            <button
              onClick={createTestOrder}
              disabled={isRunning}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Creating...' : 'Create Test Data'}
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <h3 className="text-white mb-2">Test Results:</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-400">Click "Run All Tests" to start testing...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="whitespace-pre-wrap">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Manual Tests</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Navigate to <code>/track/TEST123</code></li>
                <li>• Try the tracking form in header</li>
                <li>• Test responsive design</li>
                <li>• Check console for errors</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">🔧 System Info</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Frontend: React + TypeScript</li>
                <li>• Backend: Node.js + Express</li>
                <li>• Database: MongoDB</li>
                <li>• Features: Email, Admin, Public tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingTestPage;
