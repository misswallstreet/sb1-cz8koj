import type { CheckoutParams, CheckoutResponse } from './types';

export async function createCheckoutSession(params: CheckoutParams): Promise<CheckoutResponse> {
  try {
    const { priceId, tierName, interval } = params;

    if (!priceId) {
      throw new Error('Price ID is required');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        priceId,
        tierName,
        interval,
        successUrl: `${window.location.origin}/signup?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to process request' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.url) {
      throw new Error('No checkout URL returned');
    }

    return { url: data.url, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}