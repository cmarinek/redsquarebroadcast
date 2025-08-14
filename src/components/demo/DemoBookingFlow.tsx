import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Clock, DollarSign, Calendar as CalendarIcon, CreditCard, Check } from "lucide-react";

const timeSlots = [
  { id: "slot-1", time: "09:00 AM", price: 25, available: true, popularity: "Low" },
  { id: "slot-2", time: "12:00 PM", price: 45, available: true, popularity: "High" },
  { id: "slot-3", time: "03:00 PM", price: 35, available: false, popularity: "Medium" },
  { id: "slot-4", time: "06:00 PM", price: 55, available: true, popularity: "Peak" },
  { id: "slot-5", time: "09:00 PM", price: 30, available: true, popularity: "Medium" }
];

export const DemoBookingFlow = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [bookingStep, setBookingStep] = useState<'select' | 'confirm' | 'payment' | 'success'>('select');

  const selectedSlotData = timeSlots.find(slot => slot.id === selectedSlot);
  const totalCost = selectedSlotData ? selectedSlotData.price * duration : 0;
  const platformFee = Math.round(totalCost * 0.1);
  const finalTotal = totalCost + platformFee;

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'Low': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'Peak': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const proceedToConfirm = () => {
    if (selectedSlot) {
      setBookingStep('confirm');
    }
  };

  const proceedToPayment = () => {
    setBookingStep('payment');
  };

  const completeBooking = () => {
    setBookingStep('success');
  };

  const resetBooking = () => {
    setBookingStep('select'); 
    setSelectedSlot(null);
    setDuration(1);
  };

  if (bookingStep === 'success') {
    return (
      <Card className="border-muted/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
          <p className="text-muted-foreground mb-6">
            Your content will be broadcast on {selectedDate?.toLocaleDateString()} at {selectedSlotData?.time}
          </p>
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="text-sm text-muted-foreground">Booking ID</div>
            <div className="font-mono text-lg">#RS-2024-0001</div>
          </div>
          <Button onClick={resetBooking} className="bg-gradient-primary">
            Book Another Slot
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (bookingStep === 'payment') {
    return (
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-3">Booking Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedDate?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{selectedSlotData?.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{duration} hour{duration > 1 ? 's' : ''}</span>
              </div>
              <div className="border-t border-muted/20 pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Slot Cost:</span>
                  <span>${totalCost}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee (10%):</span>
                  <span>${platformFee}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-muted/20 pt-1 mt-1">
                  <span>Total:</span>
                  <span>${finalTotal}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-dashed border-primary/20 rounded-lg bg-primary/5">
              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment form would appear here
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={completeBooking} className="bg-gradient-primary flex-1">
                Complete Payment
              </Button>
              <Button variant="outline" onClick={() => setBookingStep('confirm')}>
                Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookingStep === 'confirm') {
    return (
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle>Confirm Your Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium mb-3">Booking Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Date</div>
                <div className="font-medium">{selectedDate?.toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Time</div>
                <div className="font-medium">{selectedSlotData?.time}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Duration</div>
                <div className="font-medium">{duration} hour{duration > 1 ? 's' : ''}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Cost</div>
                <div className="font-medium text-primary">${finalTotal}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Duration (hours)</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4].map(hours => (
                  <Button
                    key={hours}
                    size="sm"
                    variant={duration === hours ? "default" : "outline"}
                    onClick={() => setDuration(hours)}
                  >
                    {hours}h
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={proceedToPayment} className="bg-gradient-primary flex-1">
                Proceed to Payment
              </Button>
              <Button variant="outline" onClick={() => setBookingStep('select')}>
                Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            className="rounded-md border border-muted/20"
          />
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Available Time Slots
            {selectedDate && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                for {selectedDate.toLocaleDateString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {timeSlots.map((slot) => (
            <div
              key={slot.id}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                !slot.available 
                  ? 'opacity-50 cursor-not-allowed border-muted/20 bg-muted/10'
                  : selectedSlot === slot.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted/20 hover:border-primary/20 hover:shadow-sm'
              }`}
              onClick={() => slot.available && setSelectedSlot(slot.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="font-medium">{slot.time}</div>
                <Badge className={getPopularityColor(slot.popularity)}>
                  {slot.popularity}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-semibold text-primary">${slot.price}/hr</div>
                  {!slot.available && (
                    <div className="text-xs text-muted-foreground">Booked</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {selectedSlot && (
            <div className="border-t border-muted/20 pt-4 mt-4">
              <Button onClick={proceedToConfirm} className="w-full bg-gradient-primary">
                Continue with Selected Slot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};