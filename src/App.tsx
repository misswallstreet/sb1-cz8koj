import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { SignupPage } from './components/SignupPage';
import { PricingPage } from './components/PricingPage';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  // Handle public routes first
  switch (window.location.pathname) {
    case '/signup':
      return <SignupPage />;
    case '/pricing':
      return <PricingPage />;
    case '/login':
      return <Login />;
  }

  // Protected routes
  if (user) {
    return <Dashboard />;
  }

  // Default to landing page
  return <LandingPage />;
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppContent />
    </AuthProvider>
  );
};

export default App;