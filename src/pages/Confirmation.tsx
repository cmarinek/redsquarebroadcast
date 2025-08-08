import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Calendar, MapPin, FileText, Share2, Download, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface BookingDetails {
  id: string;
  screen: {
    screen_name: string;
    address: string;
    city: string;
  };
  content: {
    file_name: string;
    file_type: string;
    file_url: string;
  };
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  total_amount: number;
  status: string;
  payment_status: string;
}

export default function Confirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (bookingId) {
      fetchBookingDetails();
      
      // Verify payment if session_id is present
      if (sessionId) {
        verifyPayment();
      }
    }
  }, [bookingId, sessionId, user, navigate]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId },
      });

      if (error) throw error;

      if (data?.status === 'completed') {
        setPaymentVerified(true);
        toast({
          title: "Payment confirmed!",
          description: "Your booking has been successfully processed.",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast({
        title: "Payment verification failed",
        description: "Please contact support if you were charged.",
        variant: "destructive"
      });
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          screen:screens(screen_name, address, city),
          content:content_uploads(file_name, file_type, file_url)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error loading booking",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <Button onClick={() => navigate("/discover")}>
              Back to Discovery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const shareBooking = () => {
    const shareText = `I've booked a screen broadcast on Red Square! 🎬\n\nScreen: ${booking.screen.screen_name}\nDate: ${format(new Date(booking.scheduled_date), 'EEEE, MMMM d, yyyy')}\nTime: ${booking.scheduled_start_time} - ${booking.scheduled_end_time}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Red Square Booking Confirmation',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Booking details copied to clipboard."
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {paymentVerified || booking.payment_status === 'completed' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {paymentVerified || booking.payment_status === 'completed' 
                  ? "Booking Confirmed!" 
                  : "Processing Payment..."}
              </h1>
              <p className="text-muted-foreground mb-6">
                {paymentVerified || booking.payment_status === 'completed'
                  ? "Your content has been scheduled for broadcast. You'll receive updates as your slot approaches."
                  : "Please wait while we verify your payment. This may take a few moments."}
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Booking ID: {booking.id.slice(0, 8).toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Screen Information */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{booking.screen.screen_name || "Digital Screen"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.screen.address}, {booking.screen.city}
                  </p>
                </div>
              </div>

              {/* Content Information */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{booking.content.file_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {booking.content.file_type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Broadcast Date:</span>
                  <span>{format(new Date(booking.scheduled_date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Time Slot:</span>
                  <span>{booking.scheduled_start_time} - {booking.scheduled_end_time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Duration:</span>
                  <span>
                    {Math.round(
                      (new Date(`1970-01-01T${booking.scheduled_end_time}`).getTime() - 
                       new Date(`1970-01-01T${booking.scheduled_start_time}`).getTime()) / 
                      (1000 * 60 * 60)
                    )} hour(s)
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Paid:</span>
                    <span>${(booking.total_amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                Your broadcast is all set! Here's what happens next.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>Your content will be automatically delivered to the screen</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>We'll send you a reminder 24 hours before your broadcast</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span>Your content will go live at the scheduled time</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={shareBooking}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Booking
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/discover")}
              className="flex-1"
            >
              Book Another Screen
            </Button>
            <Button 
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}