// Environment configuration for Red Square platform
export const ENVIRONMENT = {
  // Application identity
  APP_NAME: 'Red Square Platform',
  APP_VERSION: '1.0.0',
  
  // Build target detection
  IS_MOBILE_APP: typeof window !== 'undefined' && (
    // Capacitor detection
    !!(window as any).Capacitor ||
    // Cordova detection
    !!(window as any).cordova ||
    // Native app detection via user agent
    /mobile|android|iphone|ipad/i.test(navigator?.userAgent || '')
  ),
  
  // Environment detection
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Build modes
  BUILD_TARGET: import.meta.env.VITE_BUILD_TARGET || 'web', // web, mobile, screen
  
  // Base URLs based on build target
  BASE_URL: import.meta.env.BASE_URL || '/',
  
  // Feature flags based on build target
  FEATURES: {
    SCREEN_DISCOVERY: true,
    CONTENT_UPLOAD: true,
    SCREEN_REGISTRATION: true,
    ADMIN_PANEL: true,
    MOBILE_FEATURES: typeof window !== 'undefined' && !!(window as any).Capacitor,
  }
};

// Export specific environment checks
export const isMobileApp = () => ENVIRONMENT.IS_MOBILE_APP;
export const isWebApp = () => !ENVIRONMENT.IS_MOBILE_APP;
export const isDevelopment = () => ENVIRONMENT.IS_DEVELOPMENT;
export const isProduction = () => ENVIRONMENT.IS_PRODUCTION;

// Build target helpers
export const getBuildTarget = () => ENVIRONMENT.BUILD_TARGET;
export const isScreenBuild = () => ENVIRONMENT.BUILD_TARGET === 'screen';
export const isMobileBuild = () => ENVIRONMENT.BUILD_TARGET === 'mobile';
export const isWebBuild = () => ENVIRONMENT.BUILD_TARGET === 'web';