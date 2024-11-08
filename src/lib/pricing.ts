import type { PricingTier } from './types';

export const PRICING_TIERS: Record<string, PricingTier> = {
  Free: {
    name: 'Free',
    description: 'Perfect for trying out the service',
    price: {
      monthly: '0',
      annual: '0'
    },
    priceIds: {
      monthly: '',
      annual: ''
    },
    features: [
      '10 minutes of transcription',
      'Community support',
      'Standard processing speed',
      'Export to TXT format',
      '7-day history'
    ],
    color: 'from-gray-500 to-gray-600',
    hoverColor: 'hover:from-gray-600 hover:to-gray-700'
  },
  Nano: {
    name: 'Nano',
    description: 'Perfect for small projects and individual creators',
    price: {
      monthly: '17',
      annual: '120'
    },
    priceIds: {
      monthly: 'price_1QIf9IKl2xab1pxWctrzj2CL',
      annual: 'price_1QIfHYKl2xab1pxWkm9Ji0WQ'
    },
    features: [
      '24 hours of transcription',
      'Basic support',
      'Standard processing speed',
      'Export to TXT format',
      '30-day history'
    ],
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700'
  },
  Mega: {
    name: 'Mega',
    description: 'Ideal for teams and growing businesses',
    price: {
      monthly: '29',
      annual: '199'
    },
    priceIds: {
      monthly: 'price_1QIf9aKl2xab1pxWuBHNfxL7',
      annual: 'price_1QIfHCKl2xab1pxWjphMJtMh'
    },
    features: [
      '60 hours of transcription',
      'Priority support',
      'Fast processing speed',
      'Export to multiple formats',
      '90-day history',
      'Team collaboration'
    ],
    color: 'from-[#81b29a] to-[#6b9580]',
    hoverColor: 'hover:from-[#6b9580] hover:to-[#557969]',
    popular: true
  }
};

export function calculateSavings(monthlyPrice: string, annualPrice: string): number {
  const monthly = parseFloat(monthlyPrice);
  const annual = parseFloat(annualPrice);
  const monthlyCostAnnually = monthly * 12;
  const savings = ((monthlyCostAnnually - annual) / monthlyCostAnnually) * 100;
  return Math.round(savings);
}