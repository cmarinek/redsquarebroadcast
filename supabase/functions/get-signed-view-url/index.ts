import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter per IP+path per minute
const RATE_LIMIT = 60; // requests per window
const WINDOW_MS = 60 * 1000;
const rateStore = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: now + WINDOW_MS };
  }
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetAt: entry.resetAt };
}

async function insertLog(details: Record<string, unknown>) {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRole) return;
    const admin = createClient(url, serviceRole, { auth: { persistSession: false } });
    await admin.from("event_logs").insert({
      event_type: "signed_url_issued",
      context: "get-signed-view-url",
      user_id: (details.user_id as string) || null,
      client_ip: (details.client_ip as string) || null,
      details,
    });
  } catch (e) {
    console.error("log insert error:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  try {
    const { bucket = "content", file_path, expires_in = 600 } = await req.json();

    if (!file_path || typeof file_path !== "string") {
      return new Response(JSON.stringify({ error: "file_path is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowedBuckets = new Set(["content", "avatars"]);
    if (!allowedBuckets.has(bucket)) {
      return new Response(JSON.stringify({ error: "Bucket not allowed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rlKey = `${ip}|${bucket}|${file_path}`;
    const rl = rateLimit(rlKey);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded", resetAt: rl.resetAt }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !serviceRole || !anonKey) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve user from Authorization header (JWT is already verified by Supabase if verify_jwt = true)
    const authHeader = req.headers.get("Authorization") || "";
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData } = await authClient.auth.getUser();
    const userId = userData?.user?.id || null;

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    let signedUrl: string | null = null;
    let publicUrl: string | null = null;

    if (bucket === "avatars") {
      const { data } = admin.storage.from(bucket).getPublicUrl(file_path);
      publicUrl = data.publicUrl ?? null;
    } else {
      const { data, error } = await admin.storage.from(bucket).createSignedUrl(file_path, expires_in, {
        download: false,
      });
      if (error) {
        console.error("createSignedUrl error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      signedUrl = data?.signedUrl ?? null;
    }

    // Optional: compute CDN URL variant if configured in app_settings
    let cdnUrl: string | null = null;
    try {
      const { data: settings } = await admin
        .from('app_settings')
        .select('key, value')
        .eq('key', 'cdn_base_url')
        .maybeSingle();

      const cdnBase = (settings?.value as { url?: string } | null)?.url || (settings?.value as string | null);
      const originUrl = signedUrl || publicUrl;
      if (originUrl && cdnBase) {
        try {
          const u = new URL(originUrl);
          // Preserve the full path and query, just swap the origin
          const cdn = new URL(cdnBase);
          u.protocol = cdn.protocol;
          u.host = cdn.host;
          cdnUrl = u.toString();
        } catch (_) {
          cdnUrl = null;
        }
      }
    } catch (_) {
      // ignore cdn compute errors
    }

    const responseBody = {
      origin_url: signedUrl || publicUrl,
      cdn_url: cdnUrl,
      bucket,
      file_path,
      expires_in,
      rate_limit_remaining: rl.remaining,
    };

    // Compute ETag from response body
    const bodyString = JSON.stringify(responseBody);
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(bodyString)
    );
    const etag = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Background log (non-blocking)
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil?.(insertLog({
      user_id: userId,
      client_ip: ip,
      bucket,
      file_path,
      expires_in,
      rate_limit_remaining: rl.remaining,
    }));

    return new Response(bodyString, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        // Allow short-lived caching of the signed URL response
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'ETag': `W/"${etag}"`,
      },
    });
  } catch (e) {
    console.error("get-signed-view-url error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
