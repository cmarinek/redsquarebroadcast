import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { getEnv } from "../_shared/env.ts";
import { BookingConfirmationEmail } from "./_templates/booking-confirmation.tsx";

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

    // Fetch booking details with related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        screen:screens(id, name, location),
        user:profiles!bookings_user_id_fkey(display_name, user_id)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
      booking.user_id
    );

    if (userError || !user?.email) {
      throw new Error("User email not found");
    }

    // Render email template
    const html = await renderAsync(
      React.createElement(BookingConfirmationEmail, {
        bookingId: booking.id,
        screenName: booking.screen.name,
        screenLocation: booking.screen.location,
        startTime: booking.start_time,
        endTime: booking.end_time,
        duration: booking.duration_minutes,
        totalAmount: booking.total_amount_cents / 100,
        currency: booking.currency,
        userName: booking.user.display_name || "there",
        confirmationUrl: `https://redsquare.app/confirmation?booking=${booking.id}`,
      })
    );

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "Red Square <bookings@redsquare.app>",
      to: [user.email],
      subject: `Booking Confirmed - ${booking.screen.name}`,
      html,
    });

    if (emailError) {
      throw emailError;
    }

    console.log(`Booking confirmation email sent to ${user.email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
