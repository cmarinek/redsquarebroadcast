import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
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

// Detect if running on mobile device in Capacitor (only in actual mobile environment)
const isMobileApp = !!(window as any).Capacitor && (window as any).Capacitor.isNativePlatform;

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <LanguageProvider>
            <AuthProvider>
              {isMobileApp ? <ScreenOwnerMobile /> : <App />}
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </I18nextProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);