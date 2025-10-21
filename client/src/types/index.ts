// ============================================
// Category Types (Export FIRST)
// ============================================

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  children?: string[];
  level?: number;
  isActive: boolean;
  sortOrder?: number;
  productCount?: number;
  showInMenu?: boolean;
  icon?: string;
  color?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================
// Re-export existing types (Export AFTER Category)
// ============================================

export * from './Product';
export * from './Order';
export * from './User';

// ============================================
// Additional shared types
// ============================================

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pages: number;
  total: number;
}