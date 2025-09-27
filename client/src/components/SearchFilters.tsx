import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Star } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';

const SearchFilters: React.FC = () => {
  const { state, setQuery, setCategory, setBrand, setPriceRange, setRating, setInStock, setSortBy, searchProducts, clearFilters } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState(state.query);
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(20000);

  useEffect(() => {
    setLocalQuery(state.query);
  }, [state.query]);

  useEffect(() => {
    // Fetch categories and brands from backend
    const fetchFilters = async () => {
      try {
        const mod = await import('../services/api');
        const [catRes, brandRes] = await Promise.all([
          mod.productApi.getCategories(),
          mod.productApi.getBrands()
        ]);
        // Transform categories to the expected format
        setCategories(catRes.map((cat: string) => ({ _id: cat, name: cat })));
        setBrands(brandRes);
      } catch (err) {
        setCategories([]);
        setBrands([]);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    // Dynamically set max price based on products in results
    if (state.results.length > 0) {
      setMaxPrice(Math.max(...state.results.map(p => p.price)));
    }
  }, [state.results]);

  const handleSearch = () => {
    setQuery(localQuery);
    searchProducts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setLocalQuery('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Active Filters Display */}
      {(state.category !== 'all' || state.brand !== 'all' || state.rating > 0 || state.inStock || state.priceRange[0] > 0 || state.priceRange[1] < maxPrice) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {state.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              Category: {state.category}
              <button
                onClick={() => setCategory('all')}
                className="ml-1 hover:text-primary-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {state.brand !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              Brand: {state.brand}
              <button
                onClick={() => setBrand('all')}
                className="ml-1 hover:text-primary-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {state.rating > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              Rating: {state.rating}+
              <button
                onClick={() => setRating(0)}
                className="ml-1 hover:text-primary-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {state.inStock && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              In Stock Only
              <button
                onClick={() => setInStock(false)}
                className="ml-1 hover:text-primary-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(state.priceRange[0] > 0 || state.priceRange[1] < maxPrice) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              Price: R{state.priceRange[0]} - R{state.priceRange[1]}
              <button
                onClick={() => setPriceRange([0, maxPrice])}
                className="ml-1 hover:text-primary-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Results Count and Sort */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600">
          {state.totalResults} product{state.totalResults !== 1 ? 's' : ''} found
        </span>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={state.sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="relevance">Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviewed</option>
            <option value="newest">Newest</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Category</h3>
              <select
                value={state.category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Brand</h3>
              <select
                value={state.brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Price Range</h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={state.priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), state.priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={state.priceRange[1]}
                    onChange={(e) => setPriceRange([state.priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  R{state.priceRange[0]} - R{state.priceRange[1]}
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Minimum Rating</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={rating}
                      checked={state.rating === rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">& up</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={0}
                    checked={state.rating === 0}
                    onChange={() => setRating(0)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">Any rating</span>
                </label>
              </div>
            </div>
          </div>

          {/* Stock Filter */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="text-primary-600 focus:ring-primary-500 rounded"
              />
              <span className="text-sm text-gray-700">In stock only</span>
            </label>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                searchProducts();
                setIsOpen(false);
              }}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
