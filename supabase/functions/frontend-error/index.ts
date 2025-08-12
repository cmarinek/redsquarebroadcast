import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FrontendError = {
  message: string;
  stack?: string | null;
  path?: string | null;
  session_id?: string | null;
  user_agent?: string | null;
  created_at?: string | null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization") ?? undefined;
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    const body = (await req.json().catch(() => ({}))) as {
      errors?: FrontendError[];
      events?: FrontendError[]; // alias
    };

    const items = (body.errors ?? body.events ?? []).slice(0, 20); // hard cap
    if (!items.length) {
      return new Response(JSON.stringify({ ok: true, inserted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const now = new Date().toISOString();
    const rows = items.map((e) => ({
      message: String(e.message).slice(0, 2000),
      stack: e.stack ? String(e.stack).slice(0, 8000) : null,
      path: e.path ?? null,
      session_id: e.session_id ?? null,
      user_agent: e.user_agent ?? (req.headers.get('user-agent') || null),
      user_id: userId,
      created_at: e.created_at ?? now,
    }));

    // Rate limit errors per session/user to avoid floods
    try {
      const key = `fe:${rows[0]?.session_id ?? userId ?? 'anon'}`;
      const { data: allowed } = await supabase.rpc('check_rate_limit', { _key: key, _limit: 50, _window_seconds: 300 });
      if (allowed === false) {
        return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        });
      }
    } catch (_) {
      // proceed if rate-limit rpc fails
    }

    const { error } = await supabase.from("frontend_errors").insert(rows);
    if (error) {
      console.error("insert frontend_errors failed", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("frontend-error exception", e?.message ?? String(e));
    return new Response(JSON.stringify({ error: e?.message ?? "unknown" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
