import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '../lib/stripe';
import toast from 'react-hot-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: {
    name: string;
    priceIds: {
      monthly: string;
      annual: string;
    };
  };
  isAnnual: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedTier,
  isAnnual,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email.trim()) {
        throw new Error('Please enter your email');
      }

      const priceId = isAnnual ? selectedTier.priceIds.annual : selectedTier.priceIds.monthly;
      if (!priceId) {
        throw new Error('Invalid pricing configuration');
      }

      const interval = isAnnual ? 'year' : 'month';

      const { url, error } = await createCheckoutSession({
        priceId,
        email,
        tierName: selectedTier.name,
        interval,
      });

      if (error) {
        throw new Error(error);
      }

      if (!url) {
        throw new Error('No checkout URL received');
      }

      window.location.href = url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start checkout process';
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Get Started with {selectedTier.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to continue to checkout
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#81b29a] focus:ring-[#81b29a] sm:text-sm"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#81b29a] hover:bg-[#81b29a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Processing...
                </span>
              ) : (
                'Continue to Checkout'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};