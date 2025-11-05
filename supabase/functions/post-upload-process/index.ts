import { getEnv } from "../_shared/env.ts";
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Simple in-memory rate limiter per IP+user per minute
const RATE_LIMIT = 60;
const WINDOW_MS = 60 * 1000;
const store = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string) {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  if (entry.count >= RATE_LIMIT) return { allowed: false, remaining: 0 };
  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

async function logEvent(details: Record<string, unknown>) {
  try {
    const url = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRoleKey) return;
    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
    await admin.from('event_logs').insert({
      event_type: 'post_upload_process',
      context: 'post-upload-process',
      user_id: (details.user_id as string) || null,
      client_ip: (details.client_ip as string) || null,
      details
    });
  } catch (e) {
    console.error('log insert error:', e);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { bucket = 'content', file_path, content_type, file_size } = await req.json();

    if (!file_path || !content_type) {
      return new Response(JSON.stringify({ error: 'file_path and content_type are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = getEnv("SUPABASE_ANON_KEY");

    const authHeader = req.headers.get('Authorization') ?? '';

    // Resolve user id from JWT
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData } = await authClient.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const rl = rateLimit(`${ip}|${userId}|post-upload-process`);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const jobs: Array<{ job_type: string; metadata: Record<string, unknown> }> = [];

    // Always run moderation first
    jobs.push({ job_type: 'moderation', metadata: { content_type, file_size } });

    if (content_type.startsWith('image/')) {
      jobs.push({ job_type: 'thumbnail', metadata: { sizes: [256, 512] } });
    } else if (content_type === 'image/gif') {
      jobs.push({ job_type: 'thumbnail', metadata: { sizes: [256, 512] } });
    } else if (content_type.startsWith('video/')) {
      jobs.push({ job_type: 'transcode_hls', metadata: { variant: '720p' } });
    }

    // Insert jobs
    const payload = jobs.map((j) => ({
      user_id: userId,
      bucket,
      file_path,
      job_type: j.job_type,
      metadata: j.metadata,
    }));
    const { error: insertErr } = await admin.from('media_jobs').insert(payload);
    if (insertErr) {
      console.error('Failed to insert media_jobs:', insertErr.message);
    }

    // Optional: fire-and-forget moderation function call in background
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil?.((async () => {
      try {
        await logEvent({ user_id: userId, client_ip: ip, bucket, file_path, content_type, file_size, jobs: jobs.map(j => j.job_type) });
      } catch (_) {}
    })());

    return new Response(JSON.stringify({ status: 'queued', jobs: jobs.map(j => j.job_type), rate_limit_remaining: rl.remaining }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders },
    });
  } catch (e) {
    console.error('post-upload-process error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
