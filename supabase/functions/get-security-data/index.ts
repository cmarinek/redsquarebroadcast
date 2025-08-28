import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// This is a placeholder implementation.
// In a real production environment, this data would be fetched from a database,
// analyzed, and compiled from various security monitoring sources.
const mockApiData = {
  alerts: [
    {
      id: 'api-alert-1',
      type: 'api_test_type',
      severity: 'critical',
      title: 'API Security Alert',
      description: 'This alert came from the mocked API.',
      timestamp: new Date().toISOString(),
      status: 'open',
    },
     {
      id: 'api-alert-2',
      type: 'failed_login_attempts',
      severity: 'medium',
      title: 'Multiple Failed Login Attempts',
      description: 'Detected 15 failed login attempts from IP 192.168.1.100',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'open',
      affectedUsers: 1
    },
  ],
  complianceChecks: [
    {
      id: 'api-compliance-1',
      name: 'API GDPR Check',
      description: 'This check came from the mocked API.',
      status: 'compliant',
      lastChecked: new Date().toISOString(),
      category: 'data_protection',
    },
    {
      id: 'api-compliance-2',
      name: 'API Content Moderation Policy',
      description: 'Verifies content moderation workflows meet platform standards',
      status: 'warning',
      lastChecked: '2024-01-15T07:30:00Z',
      category: 'content_policy'
    },
  ],
};

serve(async (_req) => {
  // This is required for the Supabase client library to work
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Supabase functions are by default deployed with a pre-flight OPTIONS request handler
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Here you would add logic to fetch real data from your database
    // For example: const { data, error } = await supabase.from('security_alerts').select('*');

    return new Response(
      JSON.stringify(mockApiData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
