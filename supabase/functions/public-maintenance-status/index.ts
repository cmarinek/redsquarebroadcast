import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv("SUPABASE_URL");
    const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Only expose maintenance mode status - no other settings
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .maybeSingle();

    if (error) {
      console.error('Error fetching maintenance status:', error);
      return new Response(
        JSON.stringify({ 
          maintenance_mode: false, // Default to false on error
          message: 'Unable to check maintenance status'
        }),
        {
          status: 200, // Still return 200 to avoid breaking client apps
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const maintenanceMode = data?.value?.enabled || false;

    return new Response(
      JSON.stringify({ 
        maintenance_mode: maintenanceMode,
        message: maintenanceMode ? 'System is under maintenance' : 'System is operational'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60' // Cache for 1 minute
        },
      }
    );
  } catch (error) {
    console.error('Error in public-maintenance-status function:', error);
    return new Response(
      JSON.stringify({ 
        maintenance_mode: false,
        message: 'Unable to check maintenance status'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});