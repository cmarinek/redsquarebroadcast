import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getEnv } from "../_shared/env.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoadTestConfig {
  testType: 'booking' | 'content_upload' | 'screen_discovery' | 'full_flow';
  concurrentUsers: number;
  duration: number; // seconds
  rampUpTime?: number; // seconds
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      getEnv('SUPABASE_URL'),
      getEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } }
    );

    const config: LoadTestConfig = await req.json();
    
    const testId = crypto.randomUUID();
    const startTime = Date.now();

    console.log(`Starting load test ${testId}:`, config);

    // Record test start
    await supabase.from('performance_metrics').insert({
      test_name: `load_test_${config.testType}`,
      status: 'running',
      details: { config, testId, startTime }
    });

    const results = await runLoadTest(config, supabase);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Record test completion
    await supabase.from('performance_metrics').insert({
      test_name: `load_test_${config.testType}`,
      status: 'completed',
      duration_ms: duration,
      details: { config, testId, results, startTime, endTime }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      testId,
      duration,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Load test error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function runLoadTest(config: LoadTestConfig, supabase: any) {
  const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    responseTimes: [] as number[],
    errors: [] as string[]
  };

  const rampUpDelay = (config.rampUpTime || 0) * 1000 / config.concurrentUsers;
  const testDuration = config.duration * 1000;

  const workers = [];
  
  for (let i = 0; i < config.concurrentUsers; i++) {
    // Stagger worker start times for ramp-up
    await new Promise(resolve => setTimeout(resolve, rampUpDelay));
    
    const worker = runWorker(config.testType, testDuration, supabase, results);
    workers.push(worker);
  }

  await Promise.all(workers);

  // Calculate final metrics
  if (results.responseTimes.length > 0) {
    results.averageResponseTime = 
      results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    results.minResponseTime = Math.min(...results.responseTimes);
    results.maxResponseTime = Math.max(...results.responseTimes);
  }

  // Calculate percentiles
  const sorted = results.responseTimes.sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  return {
    ...results,
    percentiles: { p50, p95, p99 },
    throughput: results.totalRequests / (config.duration || 1),
    errorRate: results.totalRequests > 0 ? results.failedRequests / results.totalRequests : 0
  };
}

async function runWorker(
  testType: string, 
  duration: number, 
  supabase: any,
  results: any
) {
  const endTime = Date.now() + duration;

  while (Date.now() < endTime) {
    const startTime = Date.now();
    results.totalRequests++;

    try {
      switch (testType) {
        case 'booking':
          await testBookingFlow(supabase);
          break;
        case 'content_upload':
          await testContentUpload(supabase);
          break;
        case 'screen_discovery':
          await testScreenDiscovery(supabase);
          break;
        case 'full_flow':
          await testFullFlow(supabase);
          break;
      }

      const responseTime = Date.now() - startTime;
      results.responseTimes.push(responseTime);
      results.successfulRequests++;

    } catch (error) {
      results.failedRequests++;
      results.errors.push(error.message);
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function testBookingFlow(supabase: any) {
  // Simulate booking flow
  const { data: screens } = await supabase
    .from('screens')
    .select('id')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!screens) throw new Error('No active screens found');

  // Check availability
  await supabase
    .from('bookings')
    .select('*')
    .eq('screen_id', screens.id)
    .gte('start_time', new Date().toISOString())
    .limit(10);
}

async function testContentUpload(supabase: any) {
  // Simulate content metadata operation
  await supabase
    .from('content_uploads')
    .select('id, file_name, file_type, moderation_status')
    .limit(10);
}

async function testScreenDiscovery(supabase: any) {
  // Simulate screen discovery
  await supabase
    .from('screens')
    .select('id, screen_name, location_lat, location_lng, price_per_minute')
    .eq('is_active', true)
    .limit(20);
}

async function testFullFlow(supabase: any) {
  // Run all tests sequentially
  await testScreenDiscovery(supabase);
  await testContentUpload(supabase);
  await testBookingFlow(supabase);
}