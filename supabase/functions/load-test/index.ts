import { getEnv } from "../_shared/env.ts";
// Synthetic load test & performance probe
// Measures read/query latencies against core tables and stores results in performance_metrics

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function getActorId(authHeader: string | null) {
  try {
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return null;

    const supabaseUrl = getEnv("SUPABASE_URL");
    const anonKey = getEnv("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) return null;
    const sb = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data } = await sb.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

async function isAdmin(authHeader: string | null) {
  try {
    if (!authHeader) return false;
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return false;
    const supabaseUrl = getEnv("SUPABASE_URL");
    const anonKey = getEnv("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) return false;
    const sb = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data, error } = await sb.rpc('is_admin');
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  // Enforce admin access
  const isAdminUser = await isAdmin(req.headers.get('authorization'));
  if (!isAdminUser) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { action = 'run' } = await req.json().catch(() => ({ action: 'run' }));

    if (action === 'summary') {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const actor = await getActorId(req.headers.get('authorization'));

    const results: Record<string, any> = {};

    const measure = async (name: string, fn: () => Promise<any>) => {
      const start = performance.now();
      try {
        const out = await fn();
        const ms = Math.round(performance.now() - start);
        results[name] = { ok: true, duration_ms: ms, ...out };
      } catch (e) {
        const ms = Math.round(performance.now() - start);
        results[name] = { ok: false, duration_ms: ms, error: String(e) };
      }
    };

    await measure('count_screens', async () => {
      const { count, error } = await supabase.from('screens').select('id', { count: 'exact', head: true });
      if (error) throw error;
      return { count };
    });

    await measure('recent_uploads', async () => {
      const { data, error } = await supabase
        .from('content_uploads')
        .select('id, file_type, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return { rows: data?.length ?? 0 };
    });

    await measure('count_devices', async () => {
      const { count, error } = await supabase.from('devices').select('id', { count: 'exact', head: true });
      if (error) throw error;
      return { count };
    });

    // Aggregate total duration
    const total = Object.values(results).reduce((acc: number, r: any) => acc + (r?.duration_ms || 0), 0);
    const status = Object.values(results).every((r: any) => r?.ok) ? 'ok' : 'partial';

    const { error: insertErr } = await supabase.from('performance_metrics').insert({
      test_name: 'edge_load_test',
      status,
      duration_ms: total,
      details: results,
      actor,
    });
    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ ok: true, status, duration_ms: total, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('load-test error:', e);
    return new Response(JSON.stringify({ error: 'Load test failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
};

Deno.serve(handler);
