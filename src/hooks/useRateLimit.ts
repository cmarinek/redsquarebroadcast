import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/config/env";
import { useToast } from "@/hooks/use-toast";

export type RateLimitEndpoint =
  | "auth_signin"
  | "auth_signup"
  | "auth_reset"
  | "content_upload"
  | "booking_create"
  | "payment_create"
  | "api_default";

interface RateLimitResponse {
  allowed: boolean;
  remaining?: number;
  limit?: number;
  window_minutes?: number;
  reset_at?: string;
  error?: string;
  retry_after_seconds?: number;
}

interface RateLimitCheckOptions {
  endpoint: RateLimitEndpoint;
  identifier?: string;
  showToast?: boolean;
}

/**
 * Hook for rate limiting operations
 *
 * Usage:
 * ```tsx
 * const { checkRateLimit, incrementRateLimit, isChecking } = useRateLimit();
 *
 * // Before sensitive operation
 * const canProceed = await checkRateLimit({ endpoint: 'content_upload' });
 * if (canProceed) {
 *   await performUpload();
 *   await incrementRateLimit({ endpoint: 'content_upload' });
 * }
 * ```
 */
export function useRateLimit() {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  /**
   * Get the identifier for rate limiting (user ID or fallback)
   */
  const getIdentifier = useCallback(async (providedIdentifier?: string): Promise<string> => {
    if (providedIdentifier) return providedIdentifier;

    // Try to get user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    // Fallback to a session-based identifier
    const sessionId = sessionStorage.getItem("rate_limit_session_id") || crypto.randomUUID();
    sessionStorage.setItem("rate_limit_session_id", sessionId);
    return sessionId;
  }, []);

  /**
   * Check if an operation is allowed under rate limits
   */
  const checkRateLimit = useCallback(
    async (options: RateLimitCheckOptions): Promise<boolean> => {
      const { endpoint, identifier: providedIdentifier, showToast = true } = options;

      try {
        setIsChecking(true);
        const identifier = await getIdentifier(providedIdentifier);

        const response = await fetch(
          `${env.supabaseUrl}/functions/v1/rate-limit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.supabaseAnonKey}`,
            },
            body: JSON.stringify({
              identifier,
              endpoint,
              action: "check",
            }),
          }
        );

        const data: RateLimitResponse = await response.json();

        if (!data.allowed && showToast) {
          toast({
            title: "Rate Limit Exceeded",
            description: `Too many requests. Please try again later. (${data.remaining || 0} remaining)`,
            variant: "destructive",
          });
        }

        return data.allowed;
      } catch (error) {
        console.error("Rate limit check error:", error);
        // On error, allow the operation (fail open to not break UX)
        return true;
      } finally {
        setIsChecking(false);
      }
    },
    [getIdentifier, toast]
  );

  /**
   * Increment the rate limit counter for an operation
   */
  const incrementRateLimit = useCallback(
    async (options: RateLimitCheckOptions): Promise<boolean> => {
      const { endpoint, identifier: providedIdentifier, showToast = true } = options;

      try {
        const identifier = await getIdentifier(providedIdentifier);

        const response = await fetch(
          `${env.supabaseUrl}/functions/v1/rate-limit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.supabaseAnonKey}`,
            },
            body: JSON.stringify({
              identifier,
              endpoint,
              action: "increment",
            }),
          }
        );

        const data: RateLimitResponse = await response.json();

        if (response.status === 429) {
          if (showToast) {
            const retryMinutes = Math.ceil((data.retry_after_seconds || 60) / 60);
            toast({
              title: "Rate Limit Exceeded",
              description: `You've made too many requests. Please wait ${retryMinutes} minute${retryMinutes > 1 ? 's' : ''} before trying again.`,
              variant: "destructive",
            });
          }
          return false;
        }

        return data.allowed;
      } catch (error) {
        console.error("Rate limit increment error:", error);
        // On error, allow the operation (fail open)
        return true;
      }
    },
    [getIdentifier, toast]
  );

  /**
   * Get rate limit status for an endpoint
   */
  const getRateLimitStatus = useCallback(
    async (options: RateLimitCheckOptions): Promise<RateLimitResponse | null> => {
      const { endpoint, identifier: providedIdentifier } = options;

      try {
        setIsChecking(true);
        const identifier = await getIdentifier(providedIdentifier);

        const response = await fetch(
          `${env.supabaseUrl}/functions/v1/rate-limit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.supabaseAnonKey}`,
            },
            body: JSON.stringify({
              identifier,
              endpoint,
              action: "check",
            }),
          }
        );

        return await response.json();
      } catch (error) {
        console.error("Rate limit status error:", error);
        return null;
      } finally {
        setIsChecking(false);
      }
    },
    [getIdentifier]
  );

  /**
   * Reset rate limit for an endpoint (admin only)
   */
  const resetRateLimit = useCallback(
    async (options: RateLimitCheckOptions): Promise<boolean> => {
      const { endpoint, identifier: providedIdentifier } = options;

      try {
        const identifier = await getIdentifier(providedIdentifier);

        const response = await fetch(
          `${env.supabaseUrl}/functions/v1/rate-limit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.supabaseAnonKey}`,
            },
            body: JSON.stringify({
              identifier,
              endpoint,
              action: "reset",
            }),
          }
        );

        return response.ok;
      } catch (error) {
        console.error("Rate limit reset error:", error);
        return false;
      }
    },
    [getIdentifier]
  );

  return {
    checkRateLimit,
    incrementRateLimit,
    getRateLimitStatus,
    resetRateLimit,
    isChecking,
  };
}
