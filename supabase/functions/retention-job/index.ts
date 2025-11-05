import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RetentionRequest {
  days_old?: number;
  source?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error("Missing Supabase env vars");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { days_old = 60 } = (await req.json().catch(() => ({}))) as RetentionRequest;

    const [a, b] = await Promise.all([
      supabase.rpc("purge_frontend_metrics", { days_old }),
      supabase.rpc("purge_performance_metrics", { days_old }),
    ]);

    const purged_frontend = (a.data as number) || 0;
    const purged_perf = (b.data as number) || 0;

    const result = { purged_frontend, purged_perf, total: purged_frontend + purged_perf };
    console.log("retention-job result", result);

    return new Response(JSON.stringify({ status: "ok", ...result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("retention-job error", err);
    return new Response(JSON.stringify({ error: err?.message || "unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
