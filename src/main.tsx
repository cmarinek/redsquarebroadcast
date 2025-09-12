import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initWebVitals } from '@/utils/telemetry'
import { initErrorReporting } from '@/utils/errorReporting'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingFallback } from '@/components/LoadingFallback'
import { cleanupAuthState } from '@/utils/authCleanup'
import { supabase, SUPABASE_PROJECT_REF } from '@/integrations/supabase/client'
import i18n from './lib/i18n'
import { I18nextProvider } from 'react-i18next'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1
    }
  }
})

// Handle Supabase project switching cleanup (non-blocking)
const LAST_REF_KEY = 'active_supabase_ref';
try {
  const lastRef = localStorage.getItem(LAST_REF_KEY);
  if (lastRef && lastRef !== SUPABASE_PROJECT_REF) {
    // Clean up but don't block app initialization
    cleanupAuthState();
    supabase.auth.signOut().catch(() => {});
    localStorage.setItem(LAST_REF_KEY, SUPABASE_PROJECT_REF);
    // Schedule redirect after React mounts
    setTimeout(() => {
      window.location.href = '/auth';
    }, 100);
  } else {
    if (!lastRef) localStorage.setItem(LAST_REF_KEY, SUPABASE_PROJECT_REF);
  }
} catch {
  // Fallback if localStorage fails
  localStorage.setItem(LAST_REF_KEY, SUPABASE_PROJECT_REF);
}

// Initialize monitoring
initWebVitals(0.1) // 10% sampling rate
initErrorReporting(0.5) // 50% sampling rate

// Environment detection for mobile apps
const isMobileApp = !!(window as any).Capacitor && (window as any).Capacitor.isNativePlatform;

// Use HashRouter for Capacitor mobile apps, BrowserRouter for web
const Router = isMobileApp ? HashRouter : BrowserRouter;

console.log('App initialization:', {
  isMobileApp,
  pathname: window.location.pathname,
  hash: window.location.hash,
  protocol: window.location.protocol,
  router: isMobileApp ? 'HashRouter' : 'BrowserRouter'
});

// Add error event listener for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error, event.message, event.filename, event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Starting React application

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
} else {
  // Root element ready for React mounting
}

createRoot(rootElement!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <Router>
        <I18nextProvider i18n={i18n}>
          <LanguageProvider>
            <AuthProvider>
              <Suspense fallback={<LoadingFallback message="Loading..." />}>
                <App />
              </Suspense>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </I18nextProvider>
      </Router>
    </QueryClientProvider>
  </ErrorBoundary>
);

// React application initialized