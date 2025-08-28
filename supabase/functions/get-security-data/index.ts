import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Fetch alerts and compliance checks in parallel
    const [alertsRes, complianceChecksRes] = await Promise.all([
      supabaseClient.from('admin_security_alerts').select('*').order('created_at', { ascending: false }).limit(10),
      supabaseClient.from('admin_compliance_checks').select('*').order('last_checked', { ascending: false })
    ]);

    if (alertsRes.error) throw alertsRes.error;
    if (complianceChecksRes.error) throw complianceChecksRes.error;

    const responseData = {
      alerts: alertsRes.data,
      complianceChecks: complianceChecksRes.data,
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
