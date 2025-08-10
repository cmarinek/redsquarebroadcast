export const cleanupAuthState = () => {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');

    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('onboarding.')) {
        localStorage.removeItem(key);
      }
    });

    // Remove from sessionStorage if in use
    try {
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('onboarding.')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // Ignore if sessionStorage is not available
    }
  } catch (e) {
    console.warn('Auth cleanup encountered an issue:', e);
  }
};
