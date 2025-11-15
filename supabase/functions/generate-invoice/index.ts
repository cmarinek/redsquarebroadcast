import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { getEnv } from "../_shared/env.ts";
import jsPDF from "npm:jspdf@2.5.1";

const resend = new Resend(getEnv("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingData {
  id: string;
  user_id: string;
  screen_id: string;
  start_time: string;
  duration_minutes: number;
  amount_cents: number;
  currency: string;
  status: string;
  payment_status: string;
  payment_intent_id?: string;
  created_at: string;
}

interface ScreenData {
  screen_name: string;
  location?: string;
}

interface UserData {
  display_name?: string;
  email?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, sendEmail = false } = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "bookingId is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create client with user's auth token for authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabase = createClient(
      getEnv("SUPABASE_URL"),
      getEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Fetch booking details with related data
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const bookingData = booking as BookingData;

    // CRITICAL SECURITY CHECK: Verify user owns this booking
    if (bookingData.user_id !== user.id) {
      console.warn(`Unauthorized invoice access attempt: user ${user.id} tried to access booking ${bookingId} owned by ${bookingData.user_id}`);
      return new Response(
        JSON.stringify({ error: "You are not authorized to access this invoice" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Fetch screen details
    const { data: screen } = await supabase
      .from("screens")
      .select("screen_name, location")
      .eq("id", bookingData.screen_id)
      .single();

    const screenData = screen as ScreenData || { screen_name: "Unknown Screen" };

    // Fetch user details
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", bookingData.user_id)
      .single();

    const { data: { user } } = await supabase.auth.admin.getUserById(bookingData.user_id);

    const userData: UserData = {
      display_name: profile?.display_name || "Customer",
      email: user?.email
    };

    // Generate PDF
    const pdf = new jsPDF();

    // Set font
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("INVOICE", 105, 20, { align: "center" });

    // Company info
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("RedSquare Digital Advertising", 20, 40);
    pdf.text("San Francisco, CA", 20, 46);
    pdf.text("support@redsquare.app", 20, 52);

    // Invoice details (right side)
    pdf.text(`Invoice #: INV-${bookingData.id.slice(0, 8).toUpperCase()}`, 120, 40);
    pdf.text(`Date: ${new Date(bookingData.created_at).toLocaleDateString()}`, 120, 46);
    pdf.text(`Status: ${bookingData.payment_status.toUpperCase()}`, 120, 52);

    // Customer info
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Bill To:", 20, 70);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(userData.display_name || "Customer", 20, 76);
    if (userData.email) {
      pdf.text(userData.email, 20, 82);
    }

    // Line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 95, 190, 95);

    // Booking details
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Booking Details", 20, 105);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Screen: ${screenData.screen_name}`, 20, 115);
    if (screenData.location) {
      pdf.text(`Location: ${screenData.location}`, 20, 121);
    }
    pdf.text(`Start Time: ${new Date(bookingData.start_time).toLocaleString()}`, 20, 127);
    pdf.text(`Duration: ${Math.floor(bookingData.duration_minutes / 60)} hours ${bookingData.duration_minutes % 60} minutes`, 20, 133);

    // Line separator
    pdf.line(20, 145, 190, 145);

    // Table header
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Description", 20, 155);
    pdf.text("Amount", 170, 155, { align: "right" });

    pdf.setFont("helvetica", "normal");

    // Calculate amounts
    const subtotal = bookingData.amount_cents;
    const platformFee = Math.round(subtotal * 0.10); // 10% platform fee
    const baseAmount = subtotal - platformFee;
    const currencySymbol = bookingData.currency === "USD" ? "$" : bookingData.currency;

    // Line items
    pdf.text("Screen Booking Fee", 20, 165);
    pdf.text(`${currencySymbol}${(baseAmount / 100).toFixed(2)}`, 170, 165, { align: "right" });

    pdf.text("Platform Fee (10%)", 20, 172);
    pdf.text(`${currencySymbol}${(platformFee / 100).toFixed(2)}`, 170, 172, { align: "right" });

    // Line separator
    pdf.line(20, 180, 190, 180);

    // Total
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Total", 20, 190);
    pdf.text(`${currencySymbol}${(subtotal / 100).toFixed(2)} ${bookingData.currency}`, 170, 190, { align: "right" });

    // Line separator
    pdf.line(20, 195, 190, 195);

    // Payment info
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Payment Method: Card", 20, 210);
    if (bookingData.payment_intent_id) {
      pdf.text(`Transaction ID: ${bookingData.payment_intent_id.slice(-16)}`, 20, 216);
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Thank you for your business!", 105, 270, { align: "center" });
    pdf.text("For support, contact us at support@redsquare.app", 105, 275, { align: "center" });

    // Get PDF as base64
    const pdfBase64 = pdf.output("datauristring").split(",")[1];
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    // Send email if requested
    if (sendEmail && userData.email) {
      try {
        await resend.emails.send({
          from: "RedSquare <invoices@redsquare.app>",
          to: [userData.email],
          subject: `Invoice for Booking ${bookingData.id.slice(0, 8)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your RedSquare Invoice</h2>
              <p>Hi ${userData.display_name},</p>
              <p>Thank you for your booking! Your invoice is attached to this email.</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Booking Summary</h3>
                <p><strong>Screen:</strong> ${screenData.screen_name}</p>
                <p><strong>Start Time:</strong> ${new Date(bookingData.start_time).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${Math.floor(bookingData.duration_minutes / 60)} hours ${bookingData.duration_minutes % 60} minutes</p>
                <p><strong>Total:</strong> ${currencySymbol}${(subtotal / 100).toFixed(2)} ${bookingData.currency}</p>
              </div>
              <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
              <p>Best regards,<br>The RedSquare Team</p>
            </div>
          `,
          attachments: [
            {
              filename: `invoice-${bookingData.id.slice(0, 8)}.pdf`,
              content: pdfBase64,
            },
          ],
        });
        console.log(`Invoice email sent to ${userData.email}`);
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
        // Don't throw - still return the PDF
      }
    }

    // Return PDF as response
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${bookingData.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    const message = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
