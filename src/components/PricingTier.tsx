import React from 'react';
import { Check, LucideIcon, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '../lib/stripe';
import toast from 'react-hot-toast';

interface PricingTierProps {
  tier: {
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
    icon: LucideIcon;
  };
  isAnnual: boolean;
  loading: boolean;
  savings: number;
}

export const PricingTier: React.FC<PricingTierProps> = ({
  tier,
  isAnnual,
  loading,
  savings
}) => {
  const Icon = tier.icon;
  const price = isAnnual ? tier.price.annual : tier.price.monthly;
  const interval = isAnnual ? '/year' : '/month';

  const handleGetStarted = async () => {
    if (tier.name === 'Free') {
      window.location.href = '/signup';
      return;
    }

    try {
      const priceId = isAnnual ? tier.priceIds.annual : tier.priceIds.monthly;
      
      const { url, error } = await createCheckoutSession({
        priceId,
        tierName: tier.name,
        interval: isAnnual ? 'year' : 'month'
      });

      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    }
  };

  return (
    <div className={`relative rounded-2xl bg-white p-8 shadow-lg ${tier.popular ? 'border-2 border-[#81b29a]' : ''}`}>
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-[#81b29a]/10 px-4 py-1 text-sm font-medium text-[#81b29a]">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6 flex items-center gap-4">
        <div className={`rounded-lg p-2 bg-gradient-to-br ${tier.color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">{tier.description}</p>

      <div className="mb-6">
        <p className="flex items-baseline">
          <span className="text-4xl font-bold tracking-tight text-gray-900">${price}</span>
          <span className="ml-1 text-sm font-semibold text-gray-600">{interval}</span>
        </p>
        {isAnnual && savings > 0 && (
          <p className="mt-1 text-sm text-[#81b29a]">
            Save {savings}% with annual billing
          </p>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 flex-shrink-0 text-[#81b29a]" />
            <span className="ml-3 text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleGetStarted}
        disabled={loading}
        className={`w-full rounded-lg py-2.5 px-4 text-sm font-semibold text-white shadow-sm 
          bg-gradient-to-br ${tier.color} ${tier.hoverColor} focus-visible:outline focus-visible:outline-2 
          focus-visible:outline-offset-2 focus-visible:outline-[#81b29a] disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            Processing...
          </span>
        ) : (
          'Get Started'
        )}
      </button>
    </div>
  );
};