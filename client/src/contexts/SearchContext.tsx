import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { Product } from '../types/Product';
import { mockProducts, mockCategories, mockBrands } from '../types/Product';
import { productApi } from '../services/api';

interface SearchState {
  query: string;
  category: string;
  brand: string;
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  sortBy: string;
  results: Product[];
  totalResults: number;
  isLoading: boolean;
}

type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_BRAND'; payload: string }
  | { type: 'SET_PRICE_RANGE'; payload: [number, number] }
  | { type: 'SET_RATING'; payload: number }
  | { type: 'SET_IN_STOCK'; payload: boolean }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SEARCH_PRODUCTS' }
  | { type: 'CLEAR_FILTERS' };

const SearchContext = createContext<{
  state: SearchState;
  setQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setBrand: (brand: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setRating: (rating: number) => void;
  setInStock: (inStock: boolean) => void;
  setSortBy: (sortBy: string) => void;
  searchProducts: () => void;
  clearFilters: () => void;
  getFilteredProducts: () => Product[];
} | undefined>(undefined);

const initialState: SearchState = {
  query: '',
  category: 'all',
  brand: 'all',
  priceRange: [0, 20000],
  rating: 0,
  inStock: false,
  sortBy: 'relevance',
  results: [],
  totalResults: 0,
  isLoading: false
};

// Helper function to filter products based on search criteria
const filterProductsByCriteria = (filters: Omit<SearchState, 'results' | 'totalResults' | 'isLoading'>): Product[] => {
  let filtered = [...mockProducts];

  // Filter by query (search in name, description, and tags)
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.tags.some(tag => tag.toLowerCase().includes(query)) ||
      product.brand.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (filters.category !== 'all') {
    filtered = filtered.filter(product => product.category === filters.category);
  }

  // Filter by brand
  if (filters.brand !== 'all') {
    filtered = filtered.filter(product => product.brand === filters.brand);
  }

  // Filter by price range
  filtered = filtered.filter(product => 
    product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
  );

  // Filter by rating
  if (filters.rating > 0) {
    filtered = filtered.filter(product => product.rating >= filters.rating);
  }

  // Filter by stock status
  if (filters.inStock) {
    filtered = filtered.filter(product => product.inStock);
  }

  return filtered;
};

// Helper function to sort products
const sortProductsByCriteria = (products: Product[], sortBy: string): Product[] => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    
    case 'reviews':
      return sorted.sort((a, b) => b.reviews - a.reviews);
    
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id);
    
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    
    default:
      return sorted;
  }
};

const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    
    case 'SET_BRAND':
      return { ...state, brand: action.payload };
    
    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload };
    
    case 'SET_RATING':
      return { ...state, rating: action.payload };
    
    case 'SET_IN_STOCK':
      return { ...state, inStock: action.payload };
    
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    
    case 'SEARCH_PRODUCTS': {
      const filteredProducts = filterProductsByCriteria(state);
      const sortedProducts = sortProductsByCriteria(filteredProducts, state.sortBy);
      
      return {
        ...state,
        results: sortedProducts,
        totalResults: sortedProducts.length,
        isLoading: false
      };
    }
    
    case 'CLEAR_FILTERS':
      return {
        ...initialState,
        results: mockProducts,
        totalResults: mockProducts.length
      };
    
    default:
      return state;
  }
};

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, {
    ...initialState,
    results: mockProducts,
    totalResults: mockProducts.length
  });

  // Load categories and brands on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and brands - using mock data for now
        console.log('Brands:', mockBrands);
      } catch (error) {
        console.error('Error fetching search filters:', error);
      }
    };
    
    fetchData();
  }, []);

  const setQuery = (query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  };

  const setCategory = (category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  };

  const setBrand = (brand: string) => {
    dispatch({ type: 'SET_BRAND', payload: brand });
  };

  const setPriceRange = (range: [number, number]) => {
    dispatch({ type: 'SET_PRICE_RANGE', payload: range });
  };

  const setRating = (rating: number) => {
    dispatch({ type: 'SET_RATING', payload: rating });
  };

  const setInStock = (inStock: boolean) => {
    dispatch({ type: 'SET_IN_STOCK', payload: inStock });
  };

  const setSortBy = (sortBy: string) => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  };

  const searchProducts = () => {
    dispatch({ type: 'SEARCH_PRODUCTS' });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const getFilteredProducts = (): Product[] => {
    return filterProductsByCriteria(state);
  };

  const value = {
    state,
    setQuery,
    setCategory,
    setBrand,
    setPriceRange,
    setRating,
    setInStock,
    setSortBy,
    searchProducts,
    clearFilters,
    getFilteredProducts
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export { mockCategories, mockBrands };
