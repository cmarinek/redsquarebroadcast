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

    // Client with service role for DB operations (we will validate before use)
    const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Authenticated client using the caller's JWT (for enqueue path)
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json().catch(() => ({}));
    const { action } = body as { action?: 'enqueue' | 'poll' | 'ack' };

    if (!action) {
      return new Response(JSON.stringify({ error: 'missing_action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'enqueue') {
      // Owner/Admin enqueue command to a device or to all devices on a screen
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { screen_id, device_id, command, payload } = body as { screen_id?: string; device_id?: string; command?: string; payload?: Record<string, unknown> };
      if (!screen_id && !device_id) {
        return new Response(JSON.stringify({ error: 'target_required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!command) {
        return new Response(JSON.stringify({ error: 'command_required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Basic authorization: is the user the owner of the screen or an admin?
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

      const insertPayload = {
        screen_id: screen_id || null,
        device_id: device_id || null,
        command,
        payload: payload ?? {},
        status: 'pending',
      };

      const { error: insErr } = await service.from('device_commands').insert(insertPayload);
      if (insErr) {
        console.error('enqueue insert error', insErr);
        return new Response(JSON.stringify({ error: 'insert_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'poll') {
      const { device_id, screen_id } = body as { device_id?: string; screen_id?: string };
      if (!device_id || !screen_id) {
        return new Response(JSON.stringify({ error: 'device_id_and_screen_id_required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Fetch pending commands specific to device OR broadcast to the screen
      const { data: cmds, error: cmdErr } = await service
        .from('device_commands')
        .select('id, command, payload')
        .eq('status', 'pending')
        .or(`device_id.eq.${device_id},and(device_id.is.null,screen_id.eq.${screen_id})`)
        .order('created_at', { ascending: true })
        .limit(10);

      if (cmdErr) {
        console.error('poll error', cmdErr);
        return new Response(JSON.stringify({ error: 'poll_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ commands: cmds || [] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'ack') {
      const { device_id, ack_ids } = body as { device_id?: string; ack_ids?: string[] };
      if (!device_id || !Array.isArray(ack_ids) || ack_ids.length === 0) {
        return new Response(JSON.stringify({ error: 'invalid_ack' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { error: updErr } = await service
        .from('device_commands')
        .update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() })
        .in('id', ack_ids);

      if (updErr) {
        console.error('ack error', updErr);
        return new Response(JSON.stringify({ error: 'ack_failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'unknown_action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('device-commands error', e);
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
