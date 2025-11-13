import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Download, Calendar, MapPin, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BookingDetails {
  id: string;
  screen_id: string;
  screen_name: string;
  screen_location: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  amount_cents: number;
  currency: string;
  status: string;
  payment_intent_id: string;
  created_at: string;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const bookingId = searchParams.get("booking_id");
  const paymentIntentId = searchParams.get("payment_intent");

  useEffect(() => {
    if (!bookingId && !paymentIntentId) {
      toast({
        title: "Missing booking information",
        description: "Redirecting to dashboard...",
        variant: "destructive",
      });
      setTimeout(() => navigate("/dashboard"), 2000);
      return;
    }

    fetchBookingDetails();
  }, [bookingId, paymentIntentId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);

      // Query booking by ID or payment intent
      let query = supabase
        .from("bookings")
        .select(`
          id,
          screen_id,
          start_time,
          end_time,
          duration_minutes,
          amount_cents,
          currency,
          status,
          payment_intent_id,
          created_at,
          screens (
            screen_name,
            location
          )
        `);

      if (bookingId) {
        query = query.eq("id", bookingId);
      } else if (paymentIntentId) {
        query = query.eq("payment_intent_id", paymentIntentId);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      if (data) {
        const screen = (data.screens as any);
        setBooking({
          id: data.id,
          screen_id: data.screen_id,
          screen_name: screen?.screen_name || "Unknown Screen",
          screen_location: screen?.location || "Unknown Location",
          start_time: data.start_time,
          end_time: data.end_time,
          duration_minutes: data.duration_minutes,
          amount_cents: data.amount_cents,
          currency: data.currency || "USD",
          status: data.status,
          payment_intent_id: data.payment_intent_id,
          created_at: data.created_at,
        });

        // Send confirmation email
        await sendConfirmationEmail(data.id);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Unable to load booking details",
        description: "Please check your bookings in the dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationEmail = async (bookingId: string) => {
    try {
      const { error } = await supabase.functions.invoke("send-booking-confirmation", {
        body: { booking_id: bookingId },
      });

      if (error) throw error;
      setEmailSent(true);
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      // Don't show error to user - email is nice-to-have
    }
  };

  const downloadInvoice = async () => {
    toast({
      title: "Generating invoice...",
      description: "Your invoice will download shortly.",
    });

    // TODO: Implement invoice generation
    // This would call an edge function to generate a PDF invoice
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full mx-auto"></div>
              <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Booking not found</h1>
            <p className="text-muted-foreground mb-8">
              We couldn't find the booking details. Please check your dashboard.
            </p>
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Payment Successful!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your screen booking has been confirmed
            </p>
            {emailSent && (
              <p className="text-sm text-muted-foreground mt-2">
                📧 Confirmation email sent to your inbox
              </p>
            )}
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Booking Confirmation</CardTitle>
                  <CardDescription>Booking ID: {booking.id.slice(0, 8)}</CardDescription>
                </div>
                <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Screen Details */}
              <div>
                <h3 className="font-semibold mb-3">Screen Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{booking.screen_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pl-6">
                    {booking.screen_location}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Booking Schedule */}
              <div>
                <h3 className="font-semibold mb-3">Schedule</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Start Time</span>
                    </div>
                    <p className="font-medium pl-6">
                      {format(new Date(booking.start_time), "PPpp")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Duration</span>
                    </div>
                    <p className="font-medium pl-6">
                      {Math.floor(booking.duration_minutes / 60)} hours{" "}
                      {booking.duration_minutes % 60 > 0 && `${booking.duration_minutes % 60} minutes`}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking Amount</span>
                    <span className="font-medium">
                      ${(booking.amount_cents / 100).toFixed(2)} {booking.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Payment Method</span>
                    <span>Card ending in ••••</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Transaction ID</span>
                    <span className="font-mono">{booking.payment_intent_id.slice(-12)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={downloadInvoice}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/screen/${booking.screen_id}`)}
            >
              View Screen Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Next Steps Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  </div>
                  <span>
                    Upload your content in the{" "}
                    <button
                      onClick={() => navigate(`/content-upload/${booking.screen_id}`)}
                      className="text-primary hover:underline font-medium"
                    >
                      content manager
                    </button>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  </div>
                  <span>
                    Track your campaign performance in your{" "}
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="text-primary hover:underline font-medium"
                    >
                      dashboard
                    </button>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  </div>
                  <span>You'll receive notifications when your content goes live</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Support Section */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Need help? Contact our support team at{" "}
              <a href="mailto:support@redsquare.app" className="text-primary hover:underline">
                support@redsquare.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
