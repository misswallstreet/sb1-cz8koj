import React, { useState } from 'react';
import { FileVideo, Wand2, Clock, Sparkles, Upload, Link as LinkIcon } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import toast from 'react-hot-toast';

export const LandingPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    redirectToLogin();
  };

  const redirectToLogin = () => {
    toast.error('Please sign in to upload videos', {
      duration: 4000,
      position: 'top-center',
    });
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section with Upload */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#81b29a]/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Videos with
              <span className="text-[#81b29a]"> AI-Powered Transcription</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get accurate transcriptions of your videos in minutes. Perfect for content creators,
              educators, and professionals.
            </p>
          </div>

          {/* Upload Interface */}
          <div className="max-w-2xl mx-auto mb-12">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
                ${dragActive ? 'border-[#81b29a] bg-[#81b29a]/10' : 'border-gray-300 hover:border-[#81b29a]'}`}
              onClick={redirectToLogin}
            >
              <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {dragActive
                  ? 'Drop the video here...'
                  : 'Drag & drop a video file here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: MP4, MOV, AVI, MKV (max 100MB)
              </p>
            </div>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <input
                type="url"
                placeholder="Paste video URL here"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#81b29a] focus:border-[#81b29a]"
                onClick={redirectToLogin}
                readOnly
              />
              <button
                onClick={redirectToLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#81b29a] hover:bg-[#81b29a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a]"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Add URL
              </button>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#81b29a] hover:bg-[#81b29a]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81b29a]"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white" id="features">
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
            <p className="text-xl text-white/90 mb-8">
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

      <Footer />
    </div>
  );
};