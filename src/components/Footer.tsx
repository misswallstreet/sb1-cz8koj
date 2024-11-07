import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © {currentYear} Financial Success Media. All rights reserved.
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>in the Silicon South</span>
          </div>
          <a
            href="https://financialsuccessmedia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#81b29a] hover:text-[#81b29a]/80"
          >
            financialsuccessmedia.com
          </a>
        </div>
      </div>
    </footer>
  );
};