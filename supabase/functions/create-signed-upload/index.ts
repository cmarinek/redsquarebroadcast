// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Simple in-memory rate limiter per IP per minute
const RATE_LIMIT = 30;
const WINDOW_MS = 60 * 1000;
const rateStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  if (entry.count >= RATE_LIMIT) return { allowed: false, remaining: 0 };
  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4',
  'application/zip', 'application/vnd.microsoft.portable-executable', 'application/octet-stream'
]);
const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

async function insertLog(details: Record<string, unknown>) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) return;
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    await admin.from('event_logs').insert({
      event_type: 'signed_upload_issued',
      context: 'create-signed-upload',
      user_id: (details.user_id as string) || null,
      client_ip: (details.client_ip as string) || null,
      details,
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
    const { bucket, file_name, content_type, content_size } = await req.json();
    if (!bucket || !file_name || !content_type) {
      return new Response(JSON.stringify({ error: 'bucket, file_name and content_type are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!['content', 'avatars', 'app_artifacts'].includes(bucket)) {
      return new Response(JSON.stringify({ error: 'Invalid bucket' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!ALLOWED_TYPES.has(content_type)) {
      return new Response(JSON.stringify({ error: 'Unsupported content_type' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (typeof content_size === 'number' && content_size > MAX_SIZE_BYTES) {
      return new Response(JSON.stringify({ error: 'File too large', max_size_bytes: MAX_SIZE_BYTES }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // Check if this is a service role request (for automated builds)
    const isServiceRoleRequest = authHeader.includes(serviceRoleKey);
    
    let userId: string;
    
    if (isServiceRoleRequest) {
      // For service role requests (GitHub Actions), use a system user ID
      userId = 'system';
    } else {
      // For regular user requests, authenticate normally
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      userId = userData.user.id;
    }

    // Rate limit per IP+user
    const rl = rateLimit(`${ip}|${userId}|create-signed-upload`);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const safeName = sanitizeFilename(file_name);
    const path = `${userId}/${Date.now()}-${safeName}`;

    // Create admin client for storage operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await adminClient.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error('createSignedUploadUrl error:', error);
      return new Response(JSON.stringify({ error: error?.message || 'Failed to create signed upload URL' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Background log
    // deno-lint-ignore no-explicit-any
    (globalThis as any).EdgeRuntime?.waitUntil?.(insertLog({
      user_id: userId,
      client_ip: ip,
      bucket,
      file_name,
      content_type,
      content_size: typeof content_size === 'number' ? content_size : null,
      path: data.path,
      rate_limit_remaining: rl.remaining,
    }));

    return new Response(
      JSON.stringify({ 
        bucket, 
        path: data.path, 
        signedUrl: data.signedUrl,
        url: data.signedUrl, // For PowerShell compatibility
        headers: null, // PowerShell handles null better than empty object
        max_size_bytes: MAX_SIZE_BYTES, 
        rate_limit_remaining: rl.remaining 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders } }
    );
  } catch (e) {
    console.error('Unexpected error in create-signed-upload:', e);
    return new Response(JSON.stringify({ error: 'Bad Request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});