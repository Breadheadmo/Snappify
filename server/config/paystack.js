/**
 * Paystack Service
 * Handles all interactions with the Paystack API
 */
const axios = require('axios');
const crypto = require('crypto');

class PaystackService {
  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY;
    this.baseURL = process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';
    this.webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    
    if (!this.secretKey) {
      console.error('Paystack secret key not found in environment variables');
    }
  }

  /**
   * Helper method to make API requests to Paystack
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {object} data - Request body
   * @returns {Promise<object>} Response data
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        method,
        url,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        data: data ? JSON.stringify(data) : undefined,
      };

      console.log(`Paystack API Request: ${config.method?.toUpperCase()} ${config.url}`);
      const response = await axios(config);
      
      console.log(`Paystack API Response: ${response.status} ${response.config.url}`);
      return response.data;
    } catch (error) {
      console.error('Paystack API Error:', {
        endpoint,
        method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Initialize a payment transaction
   * @param {object} data - Transaction data
   * @returns {Promise<object>} Transaction response
   */
  async initializeTransaction(data) {
    try {
      console.log('Initializing Paystack transaction:', data);
      const response = await this.makeRequest('/transaction/initialize', 'POST', {
        email: data.email,
        amount: data.amount * 100, // Paystack expects amount in kobo (smallest currency unit)
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata || {},
        currency: data.currency || 'ZAR'
      });
      
      console.log('Paystack initialization successful:', response.data);
      return response;
    } catch (error) {
      console.error('Paystack initialization failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify a payment transaction
   * @param {string} reference - Transaction reference
   * @returns {Promise<object>} Verification response
   */
  async verifyTransaction(reference) {
    try {
      console.log('Verifying Paystack transaction:', reference);
      const response = await this.makeRequest(`/transaction/verify/${reference}`);
      console.log('Paystack verification successful:', response.data);
      return response;
    } catch (error) {
      console.error('Paystack verification failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * List transactions for a customer
   * @param {string} customer - Customer email or code
   * @returns {Promise<object>} Transactions list
   */
  async listTransactions(customer = null) {
    try {
      const endpoint = customer 
        ? `/transaction?customer=${encodeURIComponent(customer)}`
        : '/transaction';
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Paystack list transactions failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Refund a transaction
   * @param {string} transaction - Transaction reference
   * @param {number} amount - Amount to refund in base currency
   * @returns {Promise<object>} Refund response
   */
  async refundTransaction(transaction, amount = null) {
    try {
      const data = { transaction };
      if (amount) data.amount = amount * 100;
      
      return await this.makeRequest('/refund', 'POST', data);
    } catch (error) {
      console.error('Paystack refund failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * @param {string} signature - Request signature from headers
   * @param {object} payload - Webhook payload
   * @returns {boolean} Whether signature is valid
   */
  verifyWebhookSignature(signature, payload) {
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Paystack webhook secret not found in environment variables');
      return false;
    }

    try {
      const hash = crypto
        .createHmac('sha512', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

module.exports = new PaystackService();
