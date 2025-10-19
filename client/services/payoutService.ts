const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface PaymentMethod {
  id: number;
  user_id: number;
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
  billing_address: any;
  is_default: boolean;
  created_at: string;
}

export const PayoutService = {
  async triggerPayout(parentId: string, childId: string, amount: number, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trigger-payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          parentId,
          childId,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to trigger payout');
      }

      return await response.json();
    } catch (error) {
      console.error('Payout service error:', error);
      throw error;
    }
  },

  async getTransactionHistory(parentId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/${parentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      return await response.json();
    } catch (error) {
      console.error('Transaction history error:', error);
      throw error;
    }
  },

  async getParentInfo(parentId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parent/${parentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch parent info');
      }

      return await response.json();
    } catch (error) {
      console.error('Parent info error:', error);
      throw error;
    }
  },

  async getChildInfo(childId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/child/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch child info');
      }

      return await response.json();
    } catch (error) {
      console.error('Child info error:', error);
      throw error;
    }
  },
};

export const PaymentMethodService = {
  async createPaymentMethod(paymentData: {
    userId: number;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    billingAddress: any;
    isDefault?: boolean;
  }, token: string): Promise<PaymentMethod> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment method');
      }

      const result = await response.json();
      return result.paymentMethod;
    } catch (error) {
      console.error('Payment method creation error:', error);
      throw error;
    }
  },

  async getUserPaymentMethods(userId: number, token: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment-methods/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const result = await response.json();
      return result.paymentMethods;
    } catch (error) {
      console.error('Payment methods fetch error:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(paymentMethodId: number, userId: number, token: string): Promise<PaymentMethod> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment-methods/${paymentMethodId}/set-default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set default payment method');
      }

      const result = await response.json();
      return result.paymentMethod;
    } catch (error) {
      console.error('Set default payment method error:', error);
      throw error;
    }
  },

  async deletePaymentMethod(paymentMethodId: number, userId: number, token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Delete payment method error:', error);
      throw error;
    }
  }
};
