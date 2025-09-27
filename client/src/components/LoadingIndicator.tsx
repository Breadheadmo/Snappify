import React from 'react';

const LoadingIndicator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center justify-center ${className || ''}`}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
    <span className="text-blue-600 font-semibold">Loading...</span>
  </div>
);

export default LoadingIndicator;
