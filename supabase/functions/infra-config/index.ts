import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRole = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRole) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const { data, error } = await admin
      .from("app_settings")
      .select("key, value")
      .in("key", [
        "cdn_base_url",
        "read_replica_urls",
        "failover_urls",
        "primary_url",
        "pgbouncer_pool_mode",
        "pgbouncer_pool_size",
      ]);

    if (error) throw error;

    const map = new Map<string, unknown>();
    for (const row of data || []) {
      map.set(row.key as string, row.value);
    }

    const response = {
      cdn_base_url:
        (map.get("cdn_base_url") as { url?: string })?.url ||
        (map.get("cdn_base_url") as string) ||
        null,
      read_replica_urls: (map.get("read_replica_urls") as string[] | null) || null,
      failover_urls: (map.get("failover_urls") as string[] | null) || null,
      primary_url: (map.get("primary_url") as string | null) || null,
      pgbouncer_pool_mode: (map.get("pgbouncer_pool_mode") as string | null) || null,
      pgbouncer_pool_size: (map.get("pgbouncer_pool_size") as number | null) ?? null,
      // Helpful metadata for clients / ops
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
    });
  } catch (e) {
    console.error("infra-config error:", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
