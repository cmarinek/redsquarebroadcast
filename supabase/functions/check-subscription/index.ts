import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (msg: string, details?: unknown) => console.log(`[check-subscription] ${msg}`, details ?? "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Service role client for upserts
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Missing STRIPE_SECRET_KEY secret");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    const hasActive = subs.data.length > 0;

    let tier: string | null = null;
    let endsAt: string | null = null;

    if (hasActive) {
      const sub = subs.data[0];
      endsAt = new Date(sub.current_period_end * 1000).toISOString();
      const price = sub.items.data[0].price;
      const amount = price.unit_amount || 0;
      if (amount <= 999) tier = "Basic"; else if (amount <= 1999) tier = "Premium"; else tier = "Enterprise";
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActive,
      subscription_tier: tier,
      subscription_end: endsAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    return new Response(JSON.stringify({ subscribed: hasActive, subscription_tier: tier, subscription_end: endsAt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("check-subscription error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unexpected error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});