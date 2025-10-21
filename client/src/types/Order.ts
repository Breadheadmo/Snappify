export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded'
}

// ✅ UPDATED: Enhanced OrderItem with both formats for compatibility
export interface OrderItem {
  id?: string;
  
  // Legacy format (for backward compatibility)
  productId?: string;
  productName?: string;
  productImage?: string;
  
  // ✅ NEW: Nested product object (preferred format)
  product: {
    id: string | number;
    _id?: string;
    name: string;
    image: string;
    price: number;
    brand?: string;
    category?: string;
  };
  
  quantity: number;
  price: number;
  subtotal: number;
  total?: number; // Alias for subtotal
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  state?: string; // Alias for province
  postalCode: string;
  country: string;
  phone: string;
}

export interface TrackingEvent {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  location?: string;
  description: string;
  estimatedDelivery?: Date;
}

export interface Order {
  id: string;
  _id?: string; // MongoDB ID (if applicable)
  orderNumber: string;
  userId: string;
  
  items: OrderItem[];
  
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress; // ✅ ADDED: Optional billing address
  
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  trackingEvents: TrackingEvent[];
  
  notes?: string;
  
  // ✅ ADDED: Main timestamp field for display
  date?: string; // ISO string format for easy display
  
  createdAt: Date;
  updatedAt: Date;
  
  // ✅ Lifecycle timestamps
  deliveredAt?: Date;
  shippedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  returnedAt?: Date; // ✅ ADDED: When order was returned
}

// ✅ NEW: Filter options type
export interface OrderFilterOptions {
  status?: OrderStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ✅ NEW: Helper type for status counts
export type OrderStatusCounts = Record<OrderStatus | 'all', number>;

// ✅ NEW: Type guard to check if OrderItem uses legacy format
export function isLegacyOrderItem(item: OrderItem): boolean {
  return !!(item.productId && item.productName && item.productImage);
}

// ✅ NEW: Transform legacy OrderItem to new format
export function transformOrderItem(item: OrderItem): OrderItem {
  if (isLegacyOrderItem(item)) {
    return {
      ...item,
      product: {
        id: item.productId!,
        name: item.productName!,
        image: item.productImage!,
        price: item.price
      },
      total: item.subtotal
    };
  }
  return item;
}

// ✅ NEW: Transform Order to ensure compatibility
export function normalizeOrder(order: Order): Order {
  return {
    ...order,
    date: order.date || order.createdAt?.toString(),
    items: order.items.map(transformOrderItem)
  };
}