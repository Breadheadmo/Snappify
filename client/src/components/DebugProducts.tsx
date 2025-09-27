import React, { useState, useEffect } from 'react';
import { productApi } from '../services/api';

const DebugProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('🔍 Debug: Starting product API test...');
        
        // Direct fetch to see raw response
        const rawResult = await fetch('/api/products');
        const rawData = await rawResult.json();
        
        console.log('🔍 Debug: Raw API response:', rawData);
        setRawResponse(rawData);
        
        // Use the productApi service
        const result = await productApi.getProducts();
        console.log('🔍 Debug: Processed API result:', result);
        
        setProducts(result.products || []);
      } catch (err) {
        console.error('🔍 Debug: API error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  if (loading) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-400 rounded mb-4">
      <h3 className="font-bold text-lg mb-2">🔍 API Debug Information</h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="mb-4">
        <strong>Raw API Response:</strong>
        <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(rawResponse, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <strong>Processed Products Count:</strong> {products.length}
      </div>
      
      {products.length > 0 && (
        <div>
          <strong>Sample Product:</strong>
          <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
            {JSON.stringify(products[0], null, 2)}
          </pre>
        </div>
      )}
      
      {products.length === 0 && !error && (
        <div className="p-2 bg-orange-100 border border-orange-400 rounded">
          No products found in processed result
        </div>
      )}
    </div>
  );
};

export default DebugProducts;
