import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.tsx'
import ScreenOwnerMobile from './pages/ScreenOwnerMobile.tsx'
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

// Handle Supabase project switching cleanup
const LAST_REF_KEY = 'active_supabase_ref';
const lastRef = localStorage.getItem(LAST_REF_KEY);
if (lastRef && lastRef !== SUPABASE_PROJECT_REF) {
  try {
    cleanupAuthState();
    try {
      (supabase.auth as any).signOut({ scope: 'global' });
    } catch {
      supabase.auth.signOut();
    }
  } finally {
    localStorage.setItem(LAST_REF_KEY, SUPABASE_PROJECT_REF);
    window.location.href = '/auth';
  }
} else {
  if (!lastRef) localStorage.setItem(LAST_REF_KEY, SUPABASE_PROJECT_REF);
}

// Initialize monitoring
initWebVitals(0.1) // 10% sampling rate
initErrorReporting(0.5) // 50% sampling rate

// Enhanced environment detection
const isMobileApp = !!(window as any).Capacitor && (window as any).Capacitor.isNativePlatform;
const isElectron = !!(window as any).electronAPI || !!(window as any).require || navigator.userAgent.indexOf('Electron') !== -1;

// Use HashRouter for file:// protocols and Capacitor/Electron apps
const isFileProtocol = window.location.protocol === 'file:';
const shouldUseHashRouter = isFileProtocol || isMobileApp || isElectron;
const Router = shouldUseHashRouter ? HashRouter : BrowserRouter;

// Determine if this is specifically the RedSquare mobile app (not screens app)
const isRedSquareMobileApp = isMobileApp && 
  (window.location.pathname.includes('/screen-owner-mobile') || 
   window.location.pathname.includes('/mobile-app') ||
   (!window.location.pathname.includes('/redsquare-screens') && 
    !isElectron && 
    !navigator.userAgent.includes('TV')));

console.log('App initialization:', {
  isMobileApp,
  isElectron,
  isRedSquareMobileApp,
  pathname: window.location.pathname,
  hash: window.location.hash,
  userAgent: navigator.userAgent,
  protocol: window.location.protocol,
  shouldUseHashRouter,
  Router: shouldUseHashRouter ? 'HashRouter' : 'BrowserRouter'
});

// Environment detection completed

// Add error event listener for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error, event.message, event.filename, event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add CSS loading check for Electron
if (isElectron) {
  // Checking CSS variables in Electron
  const checkCSS = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--background');
    // CSS variables validated
    
    if (!bgColor) {
      console.warn('CSS variables not loaded properly');
    }
  };
  
  // Check CSS after a short delay
  setTimeout(checkCSS, 100);
}

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
              <Suspense fallback={<LoadingFallback message="Loading application..." />}>
                {isRedSquareMobileApp ? <ScreenOwnerMobile /> : <App />}
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