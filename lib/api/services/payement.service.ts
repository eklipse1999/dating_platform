import apiClient from '../client';
import { API_CONFIG } from '../config';

export interface PaymentData {
  amount: number;
  pointsPackageId?: string;
  paymentMethod?: string;
  currency?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  points?: number;
  message?: string;
}

export const paymentsService = {
  /**
   * Process a payment
   */
  async processPayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.PAYMENTS.PROCESS, data);
      return response.data;
    } catch (error: any) {
      console.error('Process payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Payment failed');
    }
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<any[]> {
    try {
      // This endpoint might not exist yet, adjust when backend adds it
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.PAYMENTS.PROCESS}/history`);
      return response.data.payments || response.data || [];
    } catch (error: any) {
      console.error('Get payment history error:', error.response?.data || error.message);
      return [];
    }
  },
};

export default paymentsService;