import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initWebVitals } from '@/utils/telemetry'
import { initErrorReporting } from '@/utils/errorReporting'
import { cleanupAuthState } from '@/utils/authCleanup'
import { supabase, SUPABASE_PROJECT_REF } from '@/integrations/supabase/client'

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

createRoot(document.getElementById("root")!).render(<App />);

// Initialize frontend performance telemetry
initWebVitals(0.25);
// Initialize client-side error reporting (sampled)
initErrorReporting(0.5);
