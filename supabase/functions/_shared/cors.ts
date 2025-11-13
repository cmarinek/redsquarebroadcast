/**
 * CORS Configuration for Edge Functions
 *
 * SECURITY: Update ALLOWED_ORIGINS before deploying to production
 */

// Production domains - UPDATE THESE before launch
const PRODUCTION_ORIGINS = [
  'https://redsquare.app',
  'https://www.redsquare.app',
  'https://app.redsquare.app',
];

// Staging domains
const STAGING_ORIGINS = [
  'https://staging.redsquare.app',
  'https://dev.redsquare.app',
];

// Development domains
const DEVELOPMENT_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:3000',
];

// Mobile app origins (for Capacitor)
const MOBILE_ORIGINS = [
  'capacitor://localhost',
  'ionic://localhost',
  'http://localhost', // iOS
  'http://10.0.2.2', // Android emulator
];

// Determine environment from env variable
const getEnvironment = (): 'production' | 'staging' | 'development' => {
  const env = Deno.env.get('ENVIRONMENT') || Deno.env.get('DENO_ENV') || 'development';
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
};

// Get allowed origins based on environment
export const getAllowedOrigins = (): string[] => {
  const environment = getEnvironment();

  switch (environment) {
    case 'production':
      // Production: Only allow production domains + mobile apps
      return [...PRODUCTION_ORIGINS, ...MOBILE_ORIGINS];

    case 'staging':
      // Staging: Allow staging + mobile apps
      return [...STAGING_ORIGINS, ...MOBILE_ORIGINS, ...DEVELOPMENT_ORIGINS];

    case 'development':
    default:
      // Development: Allow all
      return [...PRODUCTION_ORIGINS, ...STAGING_ORIGINS, ...DEVELOPMENT_ORIGINS, ...MOBILE_ORIGINS];
  }
};

/**
 * Get CORS headers for a request
 * @param origin - The origin from the request headers
 * @returns CORS headers object
 */
export const getCorsHeaders = (origin?: string | null): Record<string, string> => {
  const allowedOrigins = getAllowedOrigins();
  const environment = getEnvironment();

  // In development, allow all origins for easier testing
  if (environment === 'development' && !origin) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
    };
  }

  // Check if origin is allowed
  const isAllowed = origin && allowedOrigins.includes(origin);

  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true',
    };
  }

  // Origin not allowed - return restrictive headers
  console.warn(`CORS: Origin not allowed: ${origin}`);
  return {
    'Access-Control-Allow-Origin': 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
};

/**
 * Handle CORS preflight request
 * @param req - The request object
 * @returns Response for OPTIONS request
 */
export const handleCorsPreflightRequest = (req: Request): Response => {
  const origin = req.headers.get('origin');
  const headers = getCorsHeaders(origin);

  return new Response(null, {
    status: 204,
    headers,
  });
};

/**
 * Add security headers to response
 * @param headers - Existing headers object
 * @returns Headers with security headers added
 */
export const addSecurityHeaders = (headers: Record<string, string>): Record<string, string> => {
  return {
    ...headers,
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.mapbox.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),

    // Other security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',

    // HSTS (only in production)
    ...(getEnvironment() === 'production' ? {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    } : {}),
  };
};

/**
 * Create a JSON response with proper CORS and security headers
 * @param data - Data to return
 * @param status - HTTP status code
 * @param origin - Request origin
 * @returns Response object
 */
export const createJsonResponse = (
  data: unknown,
  status: number = 200,
  origin?: string | null
): Response => {
  const corsHeaders = getCorsHeaders(origin);
  const securityHeaders = addSecurityHeaders(corsHeaders);

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...securityHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
};

/**
 * Log CORS rejection for monitoring
 */
export const logCorsRejection = (origin: string | null, endpoint: string): void => {
  console.warn({
    type: 'cors_rejection',
    origin,
    endpoint,
    timestamp: new Date().toISOString(),
    allowed_origins: getAllowedOrigins(),
  });
};
