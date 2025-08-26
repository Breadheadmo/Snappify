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
   discount?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
   numReviews?: number;
  inStock: boolean;
  countInStock?: number; // Backend includes stock count
  category: string;
  brand: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  relatedProducts?: number[];
  tags: string[];
  weight: string;
  dimensions: string;
  warranty: string;
  returnPolicy?: string;
  shippingInfo?: string;
}


