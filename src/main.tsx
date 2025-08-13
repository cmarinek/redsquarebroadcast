import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initWebVitals } from '@/utils/telemetry'
import { initErrorReporting } from '@/utils/errorReporting'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { cleanupAuthState } from '@/utils/authCleanup'
import { supabase, SUPABASE_PROJECT_REF } from '@/integrations/supabase/client'

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

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);