import React from 'react';
import { FileVideo } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <FileVideo className="h-8 w-8 text-[#81b29a]" />
              <span className="ml-2 text-xl font-bold text-gray-900">Transcriptor</span>
            </a>
            <div className="hidden md:flex ml-10 space-x-8">
              <a
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </a>
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Features
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#81b29a] hover:bg-[#81b29a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a]"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};