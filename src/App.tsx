import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AuthContext';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { PricingPage } from './components/PricingPage';
import { useAuth } from './components/AuthContext';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  const path = window.location.pathname;
  
  if (path === '/login') {
    return <Login />;
  }
  
  if (path === '/pricing') {
    return <PricingPage />;
  }

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