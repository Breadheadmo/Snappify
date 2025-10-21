import { Category } from './index';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Product {
  id: number | string;
  _id?: string; // MongoDB ObjectId
  name: string;
  price: number;
  originalPrice?: number;
  salePrice?: number; // ← Added for sale prices
  discount?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  numReviews?: number;
  inStock: boolean;
  stock?: number; // ← Added for consistency
  countInStock?: number; // Backend includes stock count
  category: Category | string; // ✅ Now accepts both Category object and string
  brand: string;
  description: string;
  features?: string[]; // ← Made optional
  specifications?: Record<string, string>; // ← Made optional
  relatedProducts?: number[];
  tags?: string[]; // ← Made optional
  weight?: string; // ← Made optional
  dimensions?: string; // ← Made optional
  warranty?: string; // ← Made optional
  returnPolicy?: string;
  shippingInfo?: string;
  colors?: string[];
  models?: string[];
  slug?: string; // ← Added for URL-friendly names
  isFeatured?: boolean; // ← Added for featured products
  isActive?: boolean; // ← Added for product status
  createdAt?: string;
  updatedAt?: string;
}


