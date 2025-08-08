import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Clock, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { format, addDays, isSameDay } from "date-fns";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { useAvailability } from "@/hooks/useAvailability";

interface Screen {
  id: string;
  screen_name: string;
  price_per_hour: number;
  availability_start: string;
  availability_end: string;
}

interface ContentUpload {
  id: string;
  file_name: string;
  file_type: string;
}

export default function Scheduling() {
  const { screenId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const contentId = searchParams.get('contentId');
  const [screen, setScreen] = useState<Screen | null>(null);
  const [content, setContent] = useState<ContentUpload | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const { checkConflict } = useAvailability(screenId, selectedDate);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [screenResponse, contentResponse] = await Promise.all([
        supabase.from("screens").select("*").eq("id", screenId).single(),
        contentId ? supabase.from("content_uploads").select("*").eq("id", contentId).single() : Promise.resolve({ data: null, error: null })
      ]);

      if (screenResponse.error) throw screenResponse.error;
      if ('error' in contentResponse && contentResponse.error && contentId) throw contentResponse.error;

      setScreen(screenResponse.data);
      setContent(contentResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error loading data",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    if (!screen) return [];
    
    const slots = [];
    const start = parseInt(screen.availability_start.split(':')[0]);
    const end = parseInt(screen.availability_end.split(':')[0]);
    
    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    
    return slots;
  };

  const calculateTotal = () => {
    if (!screen) return 0;
    const baseAmount = screen.price_per_hour * duration;
    const platformFee = baseAmount * 0.05;
    return baseAmount + platformFee;
  };

  const proceedToPayment = async () => {
    if (!selectedDate || !selectedStartTime || !screen || !content) {
      toast({
        title: "Missing information",
        description: "Please select date, time, and duration.",
        variant: "destructive"
      });
      return;
    }

    // Check for conflicts before proceeding
    if (checkConflict(selectedStartTime, duration)) {
      toast({
        title: "Time slot unavailable",
        description: "The selected time slot conflicts with existing bookings. Please choose a different time.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue.",
          variant: "destructive"
        });
        return;
      }

      const startTime = selectedStartTime;
      const endHour = parseInt(startTime.split(':')[0]) + duration;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;

      // Double-check availability before creating booking
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('screen_id', screen.id)
        .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'))
        .in('status', ['confirmed', 'paid', 'active'])
        .gte('scheduled_end_time', startTime)
        .lte('scheduled_start_time', endTime);

      if (checkError) throw checkError;

      if (existingBookings && existingBookings.length > 0) {
        toast({
          title: "Time slot no longer available",
          description: "Someone just booked this time slot. Please choose a different time.",
          variant: "destructive"
        });
        return;
      }

      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          screen_id: screen.id,
          content_id: content.id,
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_start_time: startTime,
          scheduled_end_time: endTime,
          total_amount: calculateTotal(),
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Navigate to payment with booking ID
      navigate(`/book/${screenId}/payment?bookingId=${booking.id}`);

    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!screen || !content) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Data Not Found</h1>
            <Button onClick={() => navigate("/discover")}>
              Back to Discovery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();
  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/book/${screenId}/upload`)}
              className="mb-4"
            >
              ← Back to Upload
            </Button>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Schedule Your Broadcast
            </h1>
            <p className="text-muted-foreground">
              Choose when to display your content on {screen.screen_name || "the selected screen"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Scheduling Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Content Ready
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      {content.file_type === 'video' ? '🎥' : '🖼️'}
                    </div>
                    <div>
                      <p className="font-medium">{content.file_name}</p>
                      <Badge variant="outline" className="capitalize mt-1">
                        {content.file_type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Duration Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Duration
                  </CardTitle>
                  <CardDescription>
                    Select how long you want to broadcast
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 6, 8, 12].map((hours) => (
                        <SelectItem key={hours} value={hours.toString()}>
                          {hours} hour{hours > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Enhanced Calendar with Availability */}
              <AvailabilityCalendar
                screenId={screenId!}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedStartTime}
                selectedTime={selectedStartTime}
                duration={duration}
              />

              {/* Conflict Warning */}
              {selectedStartTime && selectedDate && checkConflict(selectedStartTime, duration) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The selected time slot conflicts with existing bookings. Please choose a different time.
                  </AlertDescription>
                </Alert>
              )}

              {/* Booking Summary */}
              {selectedStartTime && selectedDate && !checkConflict(selectedStartTime, duration) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Booking Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>Broadcast time:</strong> {selectedStartTime} - {
                          `${(parseInt(selectedStartTime.split(':')[0]) + duration).toString().padStart(2, '0')}:00`
                        }
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Screen:</span>
                      <span className="text-right">{screen.screen_name || "Digital Screen"}</span>
                    </div>
                    
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="text-right">{format(selectedDate, 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    
                    {selectedStartTime && (
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="text-right">
                          {selectedStartTime} - {
                            `${(parseInt(selectedStartTime.split(':')[0]) + duration).toString().padStart(2, '0')}:00`
                          }
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{duration} hour{duration > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base rate:</span>
                      <span>${(screen.price_per_hour / 100).toFixed(2)} × {duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${((screen.price_per_hour * duration) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform fee (5%):</span>
                      <span>${((screen.price_per_hour * duration * 0.05) / 100).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-base">
                      <span>Total:</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {(totalAmount / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6"
                    onClick={proceedToPayment}
                    disabled={!selectedDate || !selectedStartTime || (selectedStartTime && checkConflict(selectedStartTime, duration))}
                  >
                    Proceed to Payment
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    You'll be charged after confirming your booking
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}