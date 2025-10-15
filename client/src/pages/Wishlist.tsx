import React from 'react';
import WishlistComponent from '../components/wishlist/Wishlist';

const Wishlist: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">Save your favorite items for later</p>
        </div>
        
        <WishlistComponent />
      </div>
    </div>
  );
};

export default Wishlist;