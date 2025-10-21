import axios from 'axios';
import { Order, OrderStatus } from '../types/Order';

const API_BASE_URL = '/api/orders';

// Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class OrderService {
  /**
   * Get all orders for the logged-in user
   */
  async getMyOrders(): Promise<Order[]> {
    try {
      const response = await axios.get<ApiResponse<Order[]>>(`${API_BASE_URL}/my-orders`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await axios.get<ApiResponse<Order>>(`${API_BASE_URL}/${orderId}`);
      if (!response.data.data) {
        throw new Error('Order not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  /**
   * Track order by tracking number (public endpoint)
   */
  async trackByNumber(trackingNumber: string): Promise<Order> {
    try {
      const response = await axios.get<ApiResponse<Order>>(`/api/tracking/${trackingNumber}`);
      if (!response.data.data) {
        throw new Error('Tracking number not found');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Invalid tracking number');
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: any;
    paymentMethod: string;
  }): Promise<Order> {
    try {
      const response = await axios.post<ApiResponse<Order>>(API_BASE_URL, orderData);
      if (!response.data.data) {
        throw new Error('Failed to create order');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const response = await axios.patch<ApiResponse<Order>>(
        `${API_BASE_URL}/${orderId}/cancel`,
        { reason }
      );
      if (!response.data.data) {
        throw new Error('Failed to cancel order');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await axios.patch<ApiResponse<Order>>(
        `${API_BASE_URL}/${orderId}/status`,
        { status }
      );
      if (!response.data.data) {
        throw new Error('Failed to update order status');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  }

  /**
   * Add tracking event (admin only)
   */
  async addTrackingEvent(orderId: string, event: {
    status: OrderStatus;
    description: string;
    location?: string;
  }): Promise<Order> {
    try {
      const response = await axios.post<ApiResponse<Order>>(
        `${API_BASE_URL}/${orderId}/tracking`,
        event
      );
      if (!response.data.data) {
        throw new Error('Failed to add tracking event');
      }
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add tracking event');
    }
  }

  /**
   * Get order invoice URL
   */
  getInvoiceUrl(orderId: string): string {
    return `${API_BASE_URL}/${orderId}/invoice`;
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(orderId: string): Promise<void> {
    try {
      const response = await axios.get(`${API_BASE_URL}/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      throw new Error('Failed to download invoice');
    }
  }
}

export default new OrderService();