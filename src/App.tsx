
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecurityProvider } from '@/contexts/SecurityContext';
import { SecureErrorBoundary } from '@/components/Security/SecureErrorBoundary';
import { OnboardingFlow } from '@/components/Onboarding/OnboardingFlow';
import { SettingsPanel } from '@/components/Settings/SettingsPanel';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('401') || error?.message?.includes('Invalid API key')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('noesis-onboarding-complete');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('noesis-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  // Listen for settings route
  useEffect(() => {
    const handleRouteChange = () => {
      setShowSettings(window.location.pathname === '/settings');
    };

    window.addEventListener('popstate', handleRouteChange);
    handleRouteChange(); // Check initial route

    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (showOnboarding) {
    return (
      <SecurityProvider>
        <SecureErrorBoundary>
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        </SecureErrorBoundary>
      </SecurityProvider>
    );
  }

  return (
    <React.StrictMode>
      <SecurityProvider>
        <SecureErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={0}>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/settings" element={<SettingsPanel />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </SecureErrorBoundary>
      </SecurityProvider>
    </React.StrictMode>
  );
};

export default App;
