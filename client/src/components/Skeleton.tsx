import React from 'react';

interface SkeletonProps {
  type: 'text' | 'circle' | 'rectangle' | 'product-card' | 'avatar';
  width?: string;
  height?: string;
  className?: string;
  repeat?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  type, 
  width = '100%', 
  height = '1rem', 
  className = '',
  repeat = 1
}) => {
  const skeletonBaseClass = 'animate-pulse bg-gray-200 rounded';
  
  const skeletonClass = `${skeletonBaseClass} ${className}`;
  
  const getSkeletonByType = (type: SkeletonProps['type'], index: number) => {
    switch (type) {
      case 'text':
        return (
          <div 
            key={index}
            className={`${skeletonClass} h-4 mb-2`} 
            style={{ width }} 
          ></div>
        );
      
      case 'circle':
        return (
          <div 
            key={index}
            className={`${skeletonClass} rounded-full`} 
            style={{ width, height: height || width }} 
          ></div>
        );
      
      case 'rectangle':
        return (
          <div 
            key={index}
            className={skeletonClass} 
            style={{ width, height }} 
          ></div>
        );
      
      case 'avatar':
        return (
          <div 
            key={index}
            className={`${skeletonClass} rounded-full`} 
            style={{ width: '2.5rem', height: '2.5rem' }} 
          ></div>
        );
      
      case 'product-card':
        return (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Image */}
            <div className={`${skeletonBaseClass} h-48 w-full`}></div>
            
            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className={`${skeletonBaseClass} h-5 w-2/3`}></div>
              
              {/* Price */}
              <div className={`${skeletonBaseClass} h-6 w-1/3`}></div>
              
              {/* Rating */}
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`${skeletonBaseClass} h-4 w-4`}></div>
                ))}
                <div className={`${skeletonBaseClass} h-4 w-8 ml-2`}></div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  if (repeat === 1) {
    return getSkeletonByType(type, 0);
  }
  
  return (
    <>
      {[...Array(repeat)].map((_, index) => getSkeletonByType(type, index))}
    </>
  );
};

export default Skeleton;
