import React, { useState } from 'react';
import { Zap, Rocket, Sparkles } from 'lucide-react';
import { PRICING_TIERS, calculateSavings } from '../lib/stripe';
import { PricingTier } from './PricingTier';
import { CheckoutModal } from './CheckoutModal';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedTier, setSelectedTier] = useState<typeof PRICING_TIERS[keyof typeof PRICING_TIERS] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async (tier: typeof PRICING_TIERS[keyof typeof PRICING_TIERS]) => {
    if (tier.name === 'Free') {
      window.location.href = '/login';
      return;
    }

    setSelectedTier(tier);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your transcription needs
            </p>
            
            <div className="mt-8 flex items-center justify-center">
              <div className="relative flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    !isAnnual
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isAnnual
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {Object.entries(PRICING_TIERS).map(([key, tier]) => {
              let Icon;
              switch (key) {
                case 'Free':
                  Icon = Sparkles;
                  break;
                case 'Nano':
                  Icon = Zap;
                  break;
                default:
                  Icon = Rocket;
              }

              const savings = calculateSavings(tier.price.monthly, tier.price.annual);

              return (
                <PricingTier
                  key={key}
                  tier={{ ...tier, icon: Icon }}
                  isAnnual={isAnnual}
                  loading={loading && selectedTier?.name === tier.name}
                  onGetStarted={() => handleGetStarted(tier)}
                  savings={savings}
                />
              );
            })}
          </div>
        </div>
      </div>

      <Footer />

      {selectedTier && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTier(null);
          }}
          selectedTier={selectedTier}
          isAnnual={isAnnual}
        />
      )}
    </div>
  );
};