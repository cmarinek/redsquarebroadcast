// Frontend telemetry receiver for Web Vitals & client performance
// Logs incoming metrics into public.frontend_metrics
// CORS enabled and public access (verify_jwt = false in config)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};

function getClientIp(req: Request): string | null {
  const xfwd = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
  if (!xfwd) return null;
  return xfwd.split(',')[0].trim();
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json().catch(() => ({}));
    const { events = [], session_id = null, path = null, device_info = null } = body || {};
    const ip = getClientIp(req);
    const ua = (req.headers.get('user-agent') || '').toLowerCase();
    const botRe = /(bot|crawl|spider|slurp|facebookexternalhit|preview|curl|wget|monitor|uptime|headless|puppeteer)/i;
    if (botRe.test(ua)) {
      return new Response(JSON.stringify({ ok: true, inserted: 0, ignored: 'bot' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const normalized = Array.isArray(events) ? events : [events];

    const rows = normalized
      .filter((e: any) => e && typeof e.metric_name === 'string' && typeof e.value !== 'undefined')
      .map((e: any) => ({
        metric_name: String(e.metric_name),
        value: typeof e.value === 'number' ? e.value : Number(e.value),
        delta: typeof e.delta === 'number' ? e.delta : (typeof e.delta !== 'undefined' ? Number(e.delta) : null),
        id_value: e.id_value ? String(e.id_value) : null,
        navigation_type: e.navigation_type ? String(e.navigation_type) : null,
        session_id,
        path,
        device_info: device_info ?? e.device_info ?? null,
        client_ip: ip,
      }));

    if (!rows.length) {
      return new Response(JSON.stringify({ ok: true, inserted: 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { error } = await supabase.from('frontend_metrics').insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, inserted: rows.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('frontend-telemetry error:', e);
    return new Response(JSON.stringify({ error: 'Failed to record telemetry' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};

Deno.serve(handler);
