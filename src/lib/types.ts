import { LucideIcon } from 'lucide-react';

export interface PricingTier {
  name: string;
  description: string;
  price: {
    monthly: string;
    annual: string;
  };
  priceIds: {
    monthly: string;
    annual: string;
  };
  features: string[];
  color: string;
  hoverColor: string;
  popular?: boolean;
  icon?: LucideIcon;
}

export interface CheckoutParams {
  priceId: string;
  tierName: string;
  interval: 'month' | 'year';
}

export interface CheckoutResponse {
  url: string | null;
  error: string | null;
}