import React, { useState, useEffect } from 'react';

interface SearchFilters {
  query: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  tags: string[];
  features: string[];
  inStock: boolean;
  sortBy: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  categories: string[];
  brands: string[];
  availableTags: string[];
  availableFeatures: string[];
  loading?: boolean;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  categories,
  brands,
  availableTags,
  availableFeatures,
  loading = false,
  className = '',
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    tags: [],
    features: [],
    inStock: false,
    sortBy: 'relevance',
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      tags: [],
      features: [],
      inStock: false,
      sortBy: 'relevance',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.category ||
      filters.brand ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minRating ||
      filters.tags.length > 0 ||
      filters.features.length > 0 ||
      filters.inStock ||
      filters.sortBy !== 'relevance'
    );
  };

  // Trigger search when filters change (debounced)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters]);

  return (
    <div className={`advanced-search bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Filters
            {hasActiveFilters() && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {[
                  filters.category && 1,
                  filters.brand && 1,
                  filters.minPrice && 1,
                  filters.maxPrice && 1,
                  filters.minRating && 1,
                  filters.tags.length,
                  filters.features.length,
                  filters.inStock && 1,
                  filters.sortBy !== 'relevance' && 1,
                ].filter(Boolean).reduce((a, b) => (typeof a === 'number' ? a : 0) + (typeof b === 'number' ? b : 0), 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleInputChange('sortBy', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="newest">Newest First</option>
                <option value="featured">Featured</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleInputChange('minPrice', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <span className="flex items-center text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => handleInputChange('minRating', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* In Stock Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                checked={filters.inStock}
                onChange={(e) => handleInputChange('inStock', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                In stock only
              </label>
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="relative">
                <button
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex justify-between items-center"
                >
                  <span className="text-gray-500">
                    {filters.tags.length === 0 ? 'Select tags...' : `${filters.tags.length} selected`}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTagDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag)}
                          onChange={() => handleTagToggle(tag)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features Filter */}
          {availableFeatures.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="relative">
                <button
                  onClick={() => setShowFeatureDropdown(!showFeatureDropdown)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex justify-between items-center"
                >
                  <span className="text-gray-500">
                    {filters.features.length === 0 ? 'Select features...' : `${filters.features.length} selected`}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showFeatureDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {availableFeatures.map(feature => (
                      <label key={feature} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Reset Filters
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;