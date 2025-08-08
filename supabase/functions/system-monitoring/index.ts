import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'health_check';

    switch (action) {
      case 'health_check':
        return await performHealthCheck(supabaseService);
      case 'update_analytics':
        return await updateAnalytics(supabaseService);
      case 'monitor_devices':
        return await monitorDevices(supabaseService);
      case 'check_payments':
        return await checkPayments(supabaseService);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error("System monitoring error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function performHealthCheck(supabase: any) {
  const checks = [];
  const startTime = Date.now();

  try {
    // Database connectivity check
    const dbStart = Date.now();
    await supabase.from('profiles').select('count').limit(1);
    const dbTime = Date.now() - dbStart;
    
    checks.push({
      service: 'database',
      status: 'healthy',
      responseTime: dbTime,
      details: 'Database connection successful'
    });

    // Storage check
    const storageStart = Date.now();
    const { data: buckets } = await supabase.storage.listBuckets();
    const storageTime = Date.now() - storageStart;
    
    checks.push({
      service: 'storage',
      status: buckets ? 'healthy' : 'degraded',
      responseTime: storageTime,
      details: `Found ${buckets?.length || 0} storage buckets`
    });

    // Active screens check
    const { data: activeScreens, count: screenCount } = await supabase
      .from('device_status')
      .select('*', { count: 'exact' })
      .eq('status', 'online');

    checks.push({
      service: 'screens',
      status: screenCount > 0 ? 'healthy' : 'warning',
      responseTime: null,
      details: `${screenCount} active screens`
    });

    // Recent bookings check
    const { count: recentBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    checks.push({
      service: 'bookings',
      status: 'healthy',
      responseTime: null,
      details: `${recentBookings} bookings in last 24h`
    });

    // Record health check
    for (const check of checks) {
      await supabase.rpc('record_system_health', {
        service_name: check.service,
        status: check.status,
        response_time_ms: check.responseTime,
        error_message: check.status !== 'healthy' ? check.details : null,
        metadata: { details: check.details }
      });
    }

  } catch (error) {
    checks.push({
      service: 'system',
      status: 'error',
      responseTime: Date.now() - startTime,
      details: error.message
    });
  }

  const overallStatus = checks.every(c => c.status === 'healthy') ? 'healthy' :
                       checks.some(c => c.status === 'error') ? 'error' : 'degraded';

  return new Response(JSON.stringify({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function updateAnalytics(supabase: any) {
  const today = new Date().toISOString().split('T')[0];
  
  // Daily user registrations
  const { count: newUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`);

  await supabase.rpc('record_analytics_metric', {
    metric_name: 'daily_user_registrations',
    metric_value: newUsers || 0,
    metric_date: today
  });

  // Daily bookings
  const { count: dailyBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`);

  await supabase.rpc('record_analytics_metric', {
    metric_name: 'daily_bookings',
    metric_value: dailyBookings || 0,
    metric_date: today
  });

  // Daily revenue
  const { data: dailyRevenue } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`);

  const totalRevenue = dailyRevenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  await supabase.rpc('record_analytics_metric', {
    metric_name: 'daily_revenue',
    metric_value: totalRevenue,
    metric_date: today
  });

  return new Response(JSON.stringify({ success: true, metrics_updated: 3 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function monitorDevices(supabase: any) {
  const threshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
  
  const { data: offlineDevices } = await supabase
    .from('device_status')
    .select(`
      *,
      screens(screen_name, owner_id)
    `)
    .lt('last_heartbeat', threshold.toISOString());

  for (const device of offlineDevices || []) {
    // Update device status to offline
    await supabase
      .from('device_status')
      .update({ status: 'offline' })
      .eq('id', device.id);

    // Create security alert for offline device
    await supabase.rpc('create_security_alert', {
      alert_type: 'device_offline',
      severity: 'medium',
      title: 'Device Offline',
      message: `Screen "${device.screens.screen_name}" has been offline for more than 5 minutes`,
      affected_user_id: device.screens.owner_id,
      metadata: { device_id: device.id, screen_id: device.screen_id }
    });
  }

  return new Response(JSON.stringify({ 
    offline_devices: offlineDevices?.length || 0,
    checked_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function checkPayments(supabase: any) {
  // Check for stuck payments (pending for more than 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const { data: stuckPayments } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', oneHourAgo.toISOString());

  for (const payment of stuckPayments || []) {
    // Create alert for stuck payment
    await supabase.rpc('create_security_alert', {
      alert_type: 'payment_stuck',
      severity: 'high',
      title: 'Payment Processing Issue',
      message: `Payment ${payment.id} has been pending for over 1 hour`,
      metadata: { payment_id: payment.id, booking_id: payment.booking_id }
    });
  }

  return new Response(JSON.stringify({ 
    stuck_payments: stuckPayments?.length || 0,
    checked_at: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}