import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiter per IP+user per minute
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 1000;
const rateStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string) {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  if (entry.count >= RATE_LIMIT) return { allowed: false, remaining: 0 };
  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

function makeIdemKey(userId: string, bookingId: string, headerKey?: string | null) {
  return headerKey && headerKey.length > 0 ? headerKey : `create-payment:${userId}:${bookingId}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using service role key for admin operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user with anon key client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    // Get request body
    const { bookingId, successUrl, cancelUrl } = await req.json();

    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = rateLimit(`${ip}|${user.id}|create-payment`);
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Idempotency key handling
    const headerIdem = req.headers.get('Idempotency-Key') || req.headers.get('idempotency-key');
    const idemKey = makeIdemKey(user.id, bookingId, headerIdem);

    // Try to register idempotency key (best-effort)
    const { error: idemErr } = await supabaseService
      .from('idempotency_keys')
      .insert({ idempotency_key: idemKey, function_name: 'create-payment', user_id: user.id, status: 'started' });

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseService
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Fetch screen and content
    const [{ data: screen }, { data: content }] = await Promise.all([
      supabaseService.from('screens').select('screen_name, owner_user_id').eq('id', booking.screen_id).maybeSingle(),
      supabaseService.from('content_uploads').select('file_name').eq('id', booking.content_upload_id).maybeSingle(),
    ]);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate platform fee (10% of total)
    const platformFee = Math.round((booking.amount_cents || 0) * 0.10);
    const screenOwnerAmount = (booking.amount_cents || 0) - platformFee;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Screen Broadcast: ${screen?.screen_name || 'Screen'}`,
              description: `Broadcasting "${content?.file_name || 'Content'}" starting ${new Date(booking.start_time).toLocaleString()}`,
            },
            unit_amount: booking.amount_cents, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingId: booking.id,
        userId: user.id,
        screenOwnerId: screen?.owner_user_id || '',
        platformFee: platformFee.toString(),
        screenOwnerAmount: screenOwnerAmount.toString(),
      },
    }, { idempotencyKey: idemKey });

    // Create payment record
    const { error: paymentError } = await supabaseService
      .from('payments')
      .insert({
        booking_id: booking.id,
        user_id: user.id,
        amount_cents: booking.amount_cents,
        platform_fee_cents: platformFee,
        owner_amount_cents: screenOwnerAmount,
        currency: booking.currency || 'USD',
        stripe_session_id: session.id,
        status: 'pending',
      });

    if (paymentError) {
      console.error("Payment record creation error:", paymentError);
    }

    // Update booking with stripe session ID
    await supabaseService
      .from('bookings')
      .update({ 
        stripe_session_id: session.id,
        payment_status: 'pending'
      })
      .eq('id', booking.id);

    // Mark idempotency as processed (best-effort)
    await supabaseService
      .from('idempotency_keys')
      .update({ status: 'processed', last_seen: new Date().toISOString() })
      .eq('idempotency_key', idemKey);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", 'Cache-Control': 'no-store' },
      status: 200,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});