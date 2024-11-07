import React from 'react';
import { FileVideo, Wand2, Clock, Sparkles } from 'lucide-react';
import { Navbar } from './Navbar';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#81b29a]/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Videos with
            <span className="text-[#81b29a]"> AI-Powered Transcription</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get accurate transcriptions of your videos in minutes. Perfect for content creators,
            educators, and professionals.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#81b29a] hover:bg-[#81b29a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a]"
          >
            Get Started Free
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Transcriptor?
            </h2>
            <p className="text-xl text-gray-600">
              State-of-the-art technology meets user-friendly design
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FileVideo className="h-8 w-8 text-[#81b29a]" />,
                title: 'Multiple Formats',
                description: 'Support for all major video formats including MP4, MOV, and AVI'
              },
              {
                icon: <Wand2 className="h-8 w-8 text-[#81b29a]" />,
                title: 'AI-Powered',
                description: 'Advanced AI technology ensures high accuracy transcriptions'
              },
              {
                icon: <Clock className="h-8 w-8 text-[#81b29a]" />,
                title: 'Fast Processing',
                description: 'Get your transcriptions in minutes, not hours'
              },
              {
                icon: <Sparkles className="h-8 w-8 text-[#81b29a]" />,
                title: 'High Accuracy',
                description: '99%+ accuracy for clear audio in supported languages'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#81b29a]/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#81b29a]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-[#81b29a]/90 mb-8">
              Join thousands of satisfied users who trust Transcriptor
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#81b29a] bg-white hover:bg-[#81b29a]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#81b29a] focus:ring-white"
            >
              Start Transcribing Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};