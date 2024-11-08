import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface SignupConfirmationProps {
  email: string;
  onContinue: () => void;
}

export const SignupConfirmation: React.FC<SignupConfirmationProps> = ({ email, onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="relative bg-white rounded-xl max-w-lg w-full p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Created Successfully!
            </h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                We've sent a confirmation email to:
              </p>
              <p className="font-medium text-gray-900 bg-gray-50 py-2 px-4 rounded-lg inline-block">
                {email}
              </p>
              <p className="text-gray-600">
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>

            <button
              onClick={onContinue}
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#81b29a] hover:bg-[#81b29a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a] transition-colors"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};