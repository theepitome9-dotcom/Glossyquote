// API Configuration
// Backend API endpoints (Supabase Edge Functions)

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://vbtmxyuxjuqzfbdmjgcb.supabase.co/functions/v1';

export const API_ENDPOINTS = {
  // Payment endpoints
  createPaymentIntent: `${API_URL}/create-payment-intent`,
  verifyPayment: `${API_URL}/verify-payment`,
  purchaseCredits: `${API_URL}/purchase-credits`,

  // Webhook endpoint (deprecated - was for Stripe)
  // stripeWebhook: `${API_URL}/stripe-webhook`,
  
  // Lead purchase
  purchaseLead: `${API_URL}/purchase-lead`,
} as const;

// API Client Helper
export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { data: null, error: errorData.error || 'Request failed' };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Create payment intent for estimate
  static async createPaymentIntent(params: {
    estimateId: string;
    amount: number;
    currency?: string;
  }) {
    return this.request<{ clientSecret: string; paymentIntentId: string }>(
      API_ENDPOINTS.createPaymentIntent,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  }

  // Purchase credits
  static async purchaseCredits(params: {
    professionalId: string;
    packageId: string;
    amount: number;
    credits: number;
  }) {
    return this.request<{ clientSecret: string; paymentIntentId: string }>(
      API_ENDPOINTS.purchaseCredits,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  }

  // Purchase lead
  static async purchaseLead(params: {
    jobId: string;
    professionalId: string;
    creditsSpent: number;
  }) {
    return this.request<{ success: boolean; job: any }>(
      API_ENDPOINTS.purchaseLead,
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  }

  // Verify payment status
  static async verifyPayment(paymentIntentId: string) {
    return this.request<{ status: string; paid: boolean }>(
      `${API_ENDPOINTS.verifyPayment}?paymentIntentId=${paymentIntentId}`,
      {
        method: 'GET',
      }
    );
  }
}
