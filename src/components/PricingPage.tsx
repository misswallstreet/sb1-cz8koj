import React, { useState } from 'react';
import { Zap, Rocket, Crown, Check, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Navbar } from './Navbar';
import toast from 'react-hot-toast';

const tiers = [
  {
    name: 'Free',
    description: 'Perfect for trying out our service',
    price: { monthly: '0', annual: '0' },
    features: [
      'Up to 10 minutes of transcription',
      'Basic video format support',
      'Standard processing speed',
      'Download transcriptions as text',
      '24/7 community support'
    ],
    icon: Zap,
    color: 'from-blue-400 to-blue-600',
    hoverColor: 'hover:from-blue-500 hover:to-blue-700'
  },
  {
    name: 'Nano',
    description: 'Small and efficient, like nanobots',
    price: { monthly: '17', annual: '120' },
    features: [
      '24 hours of transcription',
      'All video formats supported',
      'Priority processing',
      'Export to multiple formats',
      'Email support response < 24h',
      'API access'
    ],
    icon: Rocket,
    color: 'from-[#81b29a] to-emerald-600',
    hoverColor: 'hover:from-[#81b29a] hover:to-emerald-700',
    popular: true
  },
  {
    name: 'Mega',
    description: 'For those who need more power',
    price: { monthly: '29', annual: '199' },
    features: [
      '60 hours of transcription',
      'Ultra-fast processing',
      'Custom vocabulary support',
      'Team collaboration features',
      'Priority 24/7 support',
      'Advanced API features',
      'Custom integration support'
    ],
    icon: Crown,
    color: 'from-purple-500 to-purple-700',
    hoverColor: 'hover:from-purple-600 hover:to-purple-800'
  }
];

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(true);

  const calculateSavings = (monthly: string, annual: string) => {
    if (monthly === '0') return 0;
    const monthlyCost = parseFloat(monthly) * 12;
    const annualCost = parseFloat(annual);
    return Math.round((monthlyCost - annualCost) / monthlyCost * 100);
  };

  const handleGetStarted = (tierName: string) => {
    if (!user) {
      toast.error('Please sign in to continue', {
        duration: 4000,
        position: 'top-center',
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } else {
      // Handle subscription for logged-in users
      toast.success(`Upgrading to ${tierName} plan coming soon!`);
    }
  };

  const handleContactSales = () => {
    if (!user) {
      toast.error('Please sign in to contact sales', {
        duration: 4000,
        position: 'top-center',
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } else {
      toast.success('Enterprise sales contact coming soon!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start with our free tier and upgrade as you grow. All plans include our core features.
          </p>

          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#81b29a] focus:ring-offset-2"
              style={{ backgroundColor: isAnnual ? '#81b29a' : '#cbd5e1' }}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
              <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Save up to 30%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const price = isAnnual ? tier.price.annual : tier.price.monthly;
            const savings = calculateSavings(tier.price.monthly, tier.price.annual);

            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl bg-white shadow-xl transition-transform duration-300 hover:scale-105 ${
                  tier.popular ? 'ring-2 ring-[#81b29a]' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#81b29a] text-white text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                      <p className="text-gray-500 mt-1">{tier.description}</p>
                    </div>
                    <Icon className={`h-8 w-8 text-${tier.color.split('-')[1]}-600`} />
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">${price}</span>
                      <span className="text-gray-500 ml-2">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && savings > 0 && (
                      <p className="mt-1 text-sm text-green-600">
                        Save {savings}% with annual billing
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 px-6 rounded-lg font-medium text-white bg-gradient-to-r ${
                      tier.color
                    } ${tier.hoverColor} transition-all duration-200 flex items-center justify-center group`}
                    onClick={() => handleGetStarted(tier.name)}
                  >
                    {user ? 'Upgrade Now' : 'Get Started'}
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Enterprise Solutions Available
          </h2>
          <p className="text-gray-600 mb-6">
            Need a custom solution? We offer tailored plans for larger organizations.
          </p>
          <button 
            onClick={handleContactSales}
            className="inline-flex items-center px-6 py-3 border-2 border-[#81b29a] text-[#81b29a] font-medium rounded-lg hover:bg-[#81b29a] hover:text-white transition-colors duration-200"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};