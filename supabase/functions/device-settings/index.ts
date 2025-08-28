import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json().catch(() => ({}));
    const { mode } = body as { mode?: 'get' | 'set' };

    if (!mode) {
      return new Response(JSON.stringify({ error: 'missing_mode' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'get') {
      const { device_id, screen_id } = body as { device_id?: string; screen_id?: string };
      if (!device_id && !screen_id) {
        return new Response(JSON.stringify({ error: 'target_required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Try device-specific settings first, then screen-level fallback
      const { data: byDevice } = await service
        .from('device_settings')
        .select('*')
        .eq('device_id', device_id || '')
        .maybeSingle();

      if (byDevice) {
        return new Response(JSON.stringify({ settings: byDevice.settings || {} }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (screen_id) {
        const { data: byScreen } = await service
          .from('device_settings')
          .select('*')
          .eq('screen_id', screen_id)
          .maybeSingle();
        return new Response(JSON.stringify({ settings: byScreen?.settings || {} }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ settings: {} }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'set') {
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { screen_id, device_id, settings } = body as { screen_id?: string; device_id?: string; settings?: Record<string, unknown> };
      if (!screen_id && !device_id) {
        return new Response(JSON.stringify({ error: 'target_required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Basic authorization: either screen owner or admin
      let isAuthorized = false;
      if (screen_id) {
        const { data: screen } = await service
          .from('screens')
          .select('owner_user_id')
          .eq('id', screen_id)
          .maybeSingle();
        if (screen?.owner_user_id === userData.user.id) isAuthorized = true;
      }
      if (!isAuthorized) {
        const { data: roles } = await service
          .from('user_roles')
          .select('role')
          .eq('user_id', userData.user.id)
          .returns<{ role: string }[]>();
        if ((roles || []).some((r) => r.role === 'admin')) isAuthorized = true;
      }
      if (!isAuthorized) {
        return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const upsertRow: {
        screen_id: string | null;
        device_id: string | null;
        settings: Record<string, unknown>;
        updated_at: string;
      } = {
        screen_id: screen_id || null,
        device_id: device_id || null,
        settings: settings ?? {},
        updated_at: new Date().toISOString(),
      };

      const { error: upErr } = await service.from('device_settings').upsert(upsertRow, { onConflict: 'device_id,screen_id' });
      if (upErr) {
        console.error('settings upsert error', upErr);
        return new Response(JSON.stringify({ error: 'upsert_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'unknown_mode' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('device-settings error', e);
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
