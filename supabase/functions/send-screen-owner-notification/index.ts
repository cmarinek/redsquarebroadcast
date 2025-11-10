import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { getEnv } from "../_shared/env.ts";
import { ScreenOwnerNotificationEmail } from "./_templates/screen-owner-notification.tsx";

const resend = new Resend(getEnv("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { bookingId } = await req.json();

    // Fetch booking with screen owner details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        screen:screens(
          id,
          name,
          location,
          owner:profiles!screens_owner_user_id_fkey(display_name, user_id)
        ),
        payment:payments(amount_cents, owner_amount_cents, currency, status)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Get screen owner email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
      booking.screen.owner.user_id
    );

    if (userError || !user?.email) {
      throw new Error("Screen owner email not found");
    }

    const ownerEarnings = booking.payment?.[0]?.owner_amount_cents / 100 || 0;
    const currency = booking.payment?.[0]?.currency || "usd";

    // Render email template
    const html = await renderAsync(
      React.createElement(ScreenOwnerNotificationEmail, {
        screenName: booking.screen.name,
        ownerName: booking.screen.owner.display_name || "Screen Owner",
        bookingId: booking.id,
        startTime: booking.start_time,
        endTime: booking.end_time,
        duration: booking.duration_minutes,
        earnings: ownerEarnings,
        currency: currency,
        dashboardUrl: `https://redsquare.app/screen-owner/dashboard`,
      })
    );

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "Red Square <notifications@redsquare.app>",
      to: [user.email],
      subject: `New Booking - ${booking.screen.name}`,
      html,
    });

    if (emailError) {
      throw emailError;
    }

    console.log(`Screen owner notification sent to ${user.email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending screen owner notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
