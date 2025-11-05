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
    const { role, userId } = await req.json();
    const supabaseAdmin = createAdminClient(req);
    let query;

    switch (role) {
      case 'advertiser':
        // Advertisers need to see the variants to select content for them
        query = supabaseAdmin
          .from('ab_test_campaigns')
          .select('*, ab_test_variants(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        break;

      case 'broadcaster':
        // Broadcasters may only need a high-level view
        query = supabaseAdmin
          .from('ab_test_campaigns')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        break;

      default:
        throw new Error('Invalid role specified for A/B testing data');
    }

    const { data, error } = await query;

    if (error) throw error;

    const responseData = {
      campaigns: data || [],
    };

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
