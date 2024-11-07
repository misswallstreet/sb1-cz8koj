import React from 'react';
import { Check, LucideIcon } from 'lucide-react';

interface PricingTierProps {
  tier: {
    name: string;
    description: string;
    price: {
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
  onGetStarted: () => void;
  savings: number;
}

export const PricingTier: React.FC<PricingTierProps> = ({
  tier,
  isAnnual,
  loading,
  onGetStarted,
  savings
}) => {
  const Icon = tier.icon;
  const price = isAnnual ? tier.price.annual : tier.price.monthly;
  const interval = isAnnual ? '/year' : '/month';

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
        {isAnnual && (
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
        onClick={onGetStarted}
        disabled={loading}
        className={`w-full rounded-lg py-2.5 px-4 text-sm font-semibold text-white shadow-sm 
          bg-gradient-to-br ${tier.color} ${tier.hoverColor} focus-visible:outline focus-visible:outline-2 
          focus-visible:outline-offset-2 focus-visible:outline-[#81b29a] disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Get Started'
        )}
      </button>
    </div>
  );
};