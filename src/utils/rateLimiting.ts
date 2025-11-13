import { supabase } from '@/integrations/supabase/client';

interface RateLimitResponse {
  allowed: boolean;
  remaining: number;
  limit: number;
  window_minutes?: number;
  reset_at?: string;
  error?: string;
  retry_after_seconds?: number;
}

/**
 * Check and enforce rate limiting for an endpoint
 * @param endpoint - The endpoint identifier (e.g., 'auth_signin', 'content_upload')
 * @param identifier - User ID, IP, or other unique identifier (defaults to user ID)
 * @returns Promise with rate limit status
 */
export async function checkRateLimit(
  endpoint: string,
  identifier?: string
): Promise<RateLimitResponse> {
  try {
    // Get identifier (user ID or fallback)
    let rateLimitId = identifier;

    if (!rateLimitId) {
      const { data: { user } } = await supabase.auth.getUser();
      rateLimitId = user?.id || `anon-${getFingerprint()}`;
    }

    // Check rate limit
    const { data, error } = await supabase.functions.invoke('rate-limit', {
      body: {
        identifier: rateLimitId,
        endpoint,
        action: 'check',
      },
    });

    if (error) throw error;

    return data as RateLimitResponse;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open)
    return {
      allowed: true,
      remaining: 0,
      limit: 0,
    };
  }
}

/**
 * Increment rate limit counter for an endpoint
 * @param endpoint - The endpoint identifier
 * @param identifier - User ID, IP, or other unique identifier
 * @returns Promise with rate limit status
 */
export async function incrementRateLimit(
  endpoint: string,
  identifier?: string
): Promise<RateLimitResponse> {
  try {
    let rateLimitId = identifier;

    if (!rateLimitId) {
      const { data: { user } } = await supabase.auth.getUser();
      rateLimitId = user?.id || `anon-${getFingerprint()}`;
    }

    const { data, error } = await supabase.functions.invoke('rate-limit', {
      body: {
        identifier: rateLimitId,
        endpoint,
        action: 'increment',
      },
    });

    if (error) throw error;

    return data as RateLimitResponse;
  } catch (error) {
    console.error('Rate limit increment failed:', error);
    return {
      allowed: true,
      remaining: 0,
      limit: 0,
    };
  }
}

/**
 * Reset rate limit for an identifier (admin only)
 * @param endpoint - The endpoint identifier
 * @param identifier - The identifier to reset
 */
export async function resetRateLimit(
  endpoint: string,
  identifier: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('rate-limit', {
      body: {
        identifier,
        endpoint,
        action: 'reset',
      },
    });

    if (error) throw error;

    return data as { success: boolean; message: string };
  } catch (error) {
    console.error('Rate limit reset failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a simple browser fingerprint for anonymous users
 * Not cryptographically secure, just for basic rate limiting
 */
function getFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      return canvas.toDataURL().slice(-50);
    }
  } catch {
    // Fallback to simpler fingerprint
  }

  return [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|').split('').reduce((hash, char) => {
    const chr = char.charCodeAt(0);
    hash = ((hash << 5) - hash) + chr;
    return hash & hash;
  }, 0).toString(36);
}

/**
 * Format retry-after time for user display
 */
export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Helper to handle rate limit errors in UI
 */
export function handleRateLimitError(response: RateLimitResponse): string {
  if (response.retry_after_seconds) {
    const retryTime = formatRetryAfter(response.retry_after_seconds);
    return `Too many requests. Please try again in ${retryTime}.`;
  }
  return 'Too many requests. Please slow down and try again later.';
}
