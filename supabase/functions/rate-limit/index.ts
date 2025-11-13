import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Will be restricted in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitRule {
  endpoint: string;
  maxRequests: number;
  windowMinutes: number;
}

// Rate limit rules
const RATE_LIMITS: Record<string, RateLimitRule> = {
  auth_signin: { endpoint: "auth/signin", maxRequests: 5, windowMinutes: 15 },
  auth_signup: { endpoint: "auth/signup", maxRequests: 3, windowMinutes: 60 },
  auth_reset: { endpoint: "auth/reset", maxRequests: 3, windowMinutes: 60 },
  content_upload: { endpoint: "content/upload", maxRequests: 10, windowMinutes: 60 },
  booking_create: { endpoint: "booking/create", maxRequests: 20, windowMinutes: 60 },
  payment_create: { endpoint: "payment/create", maxRequests: 10, windowMinutes: 30 },
  api_default: { endpoint: "default", maxRequests: 100, windowMinutes: 60 },
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, endpoint = "default", action = "check" } = await req.json();

    if (!identifier) {
      return new Response(
        JSON.stringify({ error: "identifier is required (user_id or ip_address)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } }
    );

    // Get rate limit rule
    const rule = RATE_LIMITS[endpoint] || RATE_LIMITS.api_default;

    // Calculate window start time
    const windowStart = new Date(Date.now() - rule.windowMinutes * 60 * 1000).toISOString();

    if (action === "check") {
      // Check if rate limit exceeded
      const { count, error } = await supabase
        .from("rate_limits")
        .select("*", { count: "exact", head: true })
        .eq("identifier", identifier)
        .eq("endpoint", rule.endpoint)
        .gte("created_at", windowStart);

      if (error) throw error;

      const requestCount = count || 0;
      const allowed = requestCount < rule.maxRequests;
      const remaining = Math.max(0, rule.maxRequests - requestCount);

      return new Response(
        JSON.stringify({
          allowed,
          remaining,
          limit: rule.maxRequests,
          window_minutes: rule.windowMinutes,
          reset_at: new Date(Date.now() + rule.windowMinutes * 60 * 1000).toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else if (action === "increment") {
      // Check current count
      const { count } = await supabase
        .from("rate_limits")
        .select("*", { count: "exact", head: true })
        .eq("identifier", identifier)
        .eq("endpoint", rule.endpoint)
        .gte("created_at", windowStart);

      const requestCount = count || 0;

      if (requestCount >= rule.maxRequests) {
        return new Response(
          JSON.stringify({
            allowed: false,
            error: "Rate limit exceeded",
            retry_after_seconds: rule.windowMinutes * 60,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }

      // Increment count
      const { error: insertError } = await supabase.from("rate_limits").insert({
        identifier,
        endpoint: rule.endpoint,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        user_agent: req.headers.get("user-agent"),
      });

      if (insertError) throw insertError;

      const remaining = rule.maxRequests - requestCount - 1;

      return new Response(
        JSON.stringify({
          allowed: true,
          remaining,
          limit: rule.maxRequests,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else if (action === "reset") {
      // Admin action to reset rate limits
      const { error: deleteError } = await supabase
        .from("rate_limits")
        .delete()
        .eq("identifier", identifier)
        .eq("endpoint", rule.endpoint);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true, message: "Rate limit reset" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'check', 'increment', or 'reset'" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    console.error("Rate limit error:", error);
    const message = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
