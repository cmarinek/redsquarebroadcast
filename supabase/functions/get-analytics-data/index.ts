import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getEnv } from "../_shared/env.ts";

// Helper function to create an authenticated Supabase client
const createAdminClient = (req: Request) => {
  return createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"), // Use service role for admin queries
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  )
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { role, userId, campaignId, startDate, endDate } = await req.json();
    const supabaseAdmin = createAdminClient(req);
    let responseData;

    switch (role) {
      case 'admin': {
        const { data, error } = await supabaseAdmin.rpc('get_platform_analytics', {
          p_start_date: startDate ?? null,
          p_end_date: endDate ?? null
        });
        if (error) throw error;
        responseData = { summary: data?.summary ?? {}, timeSeries: data?.timeSeries ?? {} };
        break;
      }

      case 'advertiser': {
        if (!userId) {
          throw new Error('userId is required for advertiser analytics');
        }
        const { data, error } = await supabaseAdmin.rpc('get_advertiser_dashboard_metrics', {
          p_user_id: userId,
          p_start_date: startDate ?? null,
          p_end_date: endDate ?? null,
        });
        if (error) throw error;
        responseData = { summary: data?.summary ?? {}, timeSeries: data?.timeSeries ?? {} };
        break;
      }

      case 'broadcaster': {
        if (!userId) {
          throw new Error('userId is required for broadcaster analytics');
        }
        const { data, error } = await supabaseAdmin.rpc('get_screen_owner_dashboard_metrics', {
          p_user_id: userId,
          p_start_date: startDate ?? null,
          p_end_date: endDate ?? null,
        });
        if (error) throw error;
        responseData = { summary: data?.summary ?? {}, timeSeries: data?.timeSeries ?? {} };
        break;
      }

      case 'public': {
        const { data, error } = await supabaseAdmin.rpc('get_public_dashboard_metrics', {
          p_start_date: startDate ?? null,
          p_end_date: endDate ?? null,
        });
        if (error) throw error;
        responseData = { summary: data?.summary ?? {}, timeSeries: data?.timeSeries ?? {} };
        break;
      }

      default:
        throw new Error('Invalid role specified');
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
