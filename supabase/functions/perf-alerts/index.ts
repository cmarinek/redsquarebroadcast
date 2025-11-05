import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertRequest {
  to?: string;
  source?: string;
  force?: boolean;
}

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[idx];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { to, source, force } = (await req.json().catch(() => ({}))) as AlertRequest;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Pull last hour metrics for key vitals
    const { data: fm, error: fmErr } = await supabase
      .from("frontend_metrics")
      .select("created_at, metric_name, value, path")
      .gte("created_at", sinceIso);
    if (fmErr) throw fmErr;

    const metrics = ["LCP", "CLS", "INP", "TTFB", "FCP"] as const;
    const thresholds: Record<string, { p95: number }> = {
      LCP: { p95: 4000 }, // ms
      INP: { p95: 200 },
      TTFB: { p95: 800 },
      FCP: { p95: 2000 },
      CLS: { p95: 0.25 },
    };

    const breaches: string[] = [];
    const summary: Record<string, any> = {};

    for (const m of metrics) {
      const vals = (fm || []).filter((r: any) => r.metric_name === m).map((r: any) => Number(r.value || 0)).filter((n) => Number.isFinite(n));
      vals.sort((a, b) => a - b);
      const p95 = percentile(vals, 0.95);
      const p50 = percentile(vals, 0.5);
      summary[m] = { count: vals.length, p50, p95, threshold: thresholds[m].p95 };
      if (vals.length > 20 && p95 > thresholds[m].p95) {
        breaches.push(`${m} p95 ${Math.round(p95)}ms > ${thresholds[m].p95}`);
      }
    }

    // Check latest load-test runs
    const { data: lt, error: ltErr } = await supabase
      .from("performance_metrics")
      .select("created_at, duration_ms, status")
      .order("created_at", { ascending: false })
      .limit(5);
    if (ltErr) throw ltErr;

    const avgLoad = (lt || []).reduce((a: number, r: any) => a + (r.duration_ms || 0), 0) / Math.max(1, (lt || []).length);
    summary["load_test"] = { avg_ms: Math.round(avgLoad), latest_status: lt?.[0]?.status };
    if (avgLoad > 1500) breaches.push(`Load-test avg ${Math.round(avgLoad)}ms > 1500ms`);

    const payload = {
      timestamp: new Date().toISOString(),
      summary,
      breaches,
      source: source ?? null,
      force: !!force,
    };

    // Persist breaches to admin_security_alerts (aggregate entry)
    if (breaches.length > 0) {
      try {
        await supabase.rpc('create_security_alert', {
          alert_type: 'performance',
          severity: 'warning',
          title: `Performance threshold breaches (${breaches.length})`,
          message: breaches.join('; '),
          affected_user_id: null,
          ip_address: null,
          user_agent: null,
          metadata: payload as any,
        });
      } catch (e) {
        console.warn('perf-alerts create_security_alert failed', e);
      }
    }

    // Optionally send email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY && to && (breaches.length > 0 || force)) {
      const resend = new Resend(RESEND_API_KEY);
      const html = `
        <h2>Performance Alerts</h2>
        <p>Time: ${payload.timestamp}</p>
        <pre>${JSON.stringify(summary, null, 2)}</pre>
        <p><strong>Breaches:</strong></p>
        <ul>${breaches.map((b) => `<li>${b}</li>`).join("")}</ul>
      `;
      try {
        const emailRes = await resend.emails.send({
          from: "RedSquare Alerts <alerts@redsquare.app>",
          to: [to],
          subject: `Perf Alerts: ${breaches.length} breach(es)`,
          html,
        });
        console.log("perf-alerts email sent", emailRes);
      } catch (e) {
        console.warn("perf-alerts email failed", e);
      }
    }

    return new Response(JSON.stringify({ status: "ok", ...payload }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("perf-alerts error", err);
    return new Response(JSON.stringify({ error: err?.message || "unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
