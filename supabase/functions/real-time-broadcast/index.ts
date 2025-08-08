import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BroadcastRequest {
  action: 'start' | 'stop' | 'status' | 'schedule';
  screenId: string;
  bookingId?: string;
  contentUrl?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  // Handle WebSocket connections for real-time broadcasting
  if (upgradeHeader.toLowerCase() === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    socket.onopen = () => {
      console.log("Broadcast WebSocket connected");
    };

    socket.onmessage = async (event) => {
      try {
        const message: BroadcastRequest = JSON.parse(event.data);
        
        switch (message.action) {
          case 'start':
            await handleStartBroadcast(message, supabaseService, socket);
            break;
          case 'stop':
            await handleStopBroadcast(message, supabaseService, socket);
            break;
          case 'status':
            await handleStatusCheck(message, supabaseService, socket);
            break;
          case 'schedule':
            await handleScheduleCheck(message, supabaseService, socket);
            break;
        }
      } catch (error) {
        console.error("Broadcast message error:", error);
        socket.send(JSON.stringify({ error: error.message }));
      }
    };

    socket.onclose = () => {
      console.log("Broadcast WebSocket disconnected");
    };

    return response;
  }

  // Handle HTTP requests for broadcast management
  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, screenId, bookingId, contentUrl }: BroadcastRequest = await req.json();

    switch (action) {
      case 'start':
        return await startBroadcast(screenId, bookingId!, contentUrl!, supabaseService);
      case 'stop':
        return await stopBroadcast(screenId, supabaseService);
      case 'status':
        return await getBroadcastStatus(screenId, supabaseService);
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error("Broadcast error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleStartBroadcast(message: BroadcastRequest, supabase: any, socket: WebSocket) {
  const { screenId, bookingId, contentUrl } = message;
  
  // Update device status
  await supabase
    .from('device_status')
    .upsert({
      screen_id: screenId,
      status: 'broadcasting',
      current_content: contentUrl,
      last_heartbeat: new Date().toISOString()
    });

  // Update booking status
  await supabase
    .from('bookings')
    .update({ status: 'broadcasting' })
    .eq('id', bookingId);

  socket.send(JSON.stringify({
    action: 'broadcast_started',
    screenId,
    contentUrl,
    timestamp: new Date().toISOString()
  }));
}

async function handleStopBroadcast(message: BroadcastRequest, supabase: any, socket: WebSocket) {
  const { screenId } = message;
  
  // Update device status
  await supabase
    .from('device_status')
    .upsert({
      screen_id: screenId,
      status: 'idle',
      current_content: null,
      last_heartbeat: new Date().toISOString()
    });

  socket.send(JSON.stringify({
    action: 'broadcast_stopped',
    screenId,
    timestamp: new Date().toISOString()
  }));
}

async function handleStatusCheck(message: BroadcastRequest, supabase: any, socket: WebSocket) {
  const { screenId } = message;
  
  const { data } = await supabase
    .from('device_status')
    .select('*')
    .eq('screen_id', screenId)
    .single();

  socket.send(JSON.stringify({
    action: 'status_response',
    screenId,
    status: data,
    timestamp: new Date().toISOString()
  }));
}

async function handleScheduleCheck(message: BroadcastRequest, supabase: any, socket: WebSocket) {
  const { screenId } = message;
  
  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0];
  const currentDate = now.toISOString().split('T')[0];

  const { data: activeBookings } = await supabase
    .from('bookings')
    .select(`
      *,
      content_uploads(file_url, file_name)
    `)
    .eq('screen_id', screenId)
    .eq('scheduled_date', currentDate)
    .eq('payment_status', 'completed')
    .lte('scheduled_start_time', currentTime)
    .gte('scheduled_end_time', currentTime);

  socket.send(JSON.stringify({
    action: 'schedule_response',
    screenId,
    activeBookings,
    timestamp: new Date().toISOString()
  }));
}

async function startBroadcast(screenId: string, bookingId: string, contentUrl: string, supabase: any) {
  await supabase
    .from('device_status')
    .upsert({
      screen_id: screenId,
      status: 'broadcasting',
      current_content: contentUrl,
      last_heartbeat: new Date().toISOString()
    });

  await supabase
    .from('bookings')
    .update({ status: 'broadcasting' })
    .eq('id', bookingId);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function stopBroadcast(screenId: string, supabase: any) {
  await supabase
    .from('device_status')
    .upsert({
      screen_id: screenId,
      status: 'idle',
      current_content: null,
      last_heartbeat: new Date().toISOString()
    });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getBroadcastStatus(screenId: string, supabase: any) {
  const { data } = await supabase
    .from('device_status')
    .select('*')
    .eq('screen_id', screenId)
    .single();

  return new Response(JSON.stringify({ status: data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}