import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface WishlistButtonProps {
  productId: string;
  variant?: {
    _id: string;
    size: string;
    color: string;
    material: string;
    style: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  variant,
  className = '',
  size = 'md',
  showText = true,
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && productId) {
      checkWishlistStatus();
    }
  }, [user, productId, variant]);

  const checkWishlistStatus = async () => {
    try {
      let url = `/api/wishlist/check/${productId}`;
      if (variant) {
        const params = new URLSearchParams({
          variant: JSON.stringify({
            variantId: variant._id,
            size: variant.size,
            color: variant.color,
            material: variant.material,
            style: variant.style,
          })
        });
        url += `?${params}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.inWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      showNotification('Please sign in to add items to your wishlist', 'error');
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        let url = `/api/wishlist/${productId}`;
        if (variant) {
          const params = new URLSearchParams({
            variant: JSON.stringify({
              variantId: variant._id,
              size: variant.size,
              color: variant.color,
              material: variant.material,
              style: variant.style,
            })
          });
          url += `?${params}`;
        }

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          setIsInWishlist(false);
          showNotification('Removed from wishlist', 'success');
        } else {
          showNotification('Failed to remove from wishlist', 'error');
        }
      } else {
        // Add to wishlist
        const body: any = { productId };
        if (variant) {
          body.variant = {
            variantId: variant._id,
            size: variant.size,
            color: variant.color,
            material: variant.material,
            style: variant.style,
          };
        }

        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.action === 'added') {
            setIsInWishlist(true);
            showNotification('Added to wishlist', 'success');
          } else if (data.action === 'removed') {
            setIsInWishlist(false);
            showNotification('Removed from wishlist', 'success');
          }
        } else {
          const errorData = await response.json();
          showNotification(errorData.message || 'Failed to add to wishlist', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showNotification('An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-1 text-sm';
      case 'lg':
        return 'p-3 text-lg';
      default:
        return 'p-2 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`
        flex items-center justify-center gap-2 border rounded-md transition-all
        ${isInWishlist 
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
          : 'bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600'
        }
        ${getSizeClasses()}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
        ${className}
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <div className={`animate-spin border-2 border-current border-t-transparent rounded-full ${getIconSize()}`}></div>
      ) : (
        <svg
          className={getIconSize()}
          fill={isInWishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isInWishlist ? 0 : 2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      
      {showText && (
        <span className="font-medium">
          {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;