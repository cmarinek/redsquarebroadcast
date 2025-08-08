import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { addDays, format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useAvailability } from "@/hooks/useAvailability";

interface AvailabilityCalendarProps {
  screenId: string;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  selectedTime?: string;
  duration: number;
}

export function AvailabilityCalendar({ 
  screenId, 
  selectedDate, 
  onDateSelect, 
  onTimeSelect,
  selectedTime,
  duration 
}: AvailabilityCalendarProps) {
  const { availability, loading, checkConflict } = useAvailability(screenId, selectedDate);

  const getAvailableTimeSlots = () => {
    if (!availability) return [];
    
    return availability.timeSlots.filter(slot => {
      if (!slot.available) return false;
      
      // Check if booking this slot with the given duration would conflict
      const startHour = parseInt(slot.time.split(':')[0]);
      const endHour = startHour + duration;
      
      // Make sure the booking doesn't exceed screen availability
      for (let hour = startHour; hour < endHour; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        const checkSlot = availability.timeSlots.find(s => s.time === timeStr);
        if (!checkSlot || !checkSlot.available) {
          return false;
        }
      }
      
      return true;
    });
  };

  const getUnavailableTimeSlots = () => {
    if (!availability) return [];
    return availability.timeSlots.filter(slot => !slot.available);
  };

  const isConflict = (time: string) => {
    return checkConflict(time, duration);
  };

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
            className={cn("rounded-md border pointer-events-auto")}
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Available Time Slots</CardTitle>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')} • Duration: {duration} hour{duration > 1 ? 's' : ''}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Available Slots */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Available</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {getAvailableTimeSlots().map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => onTimeSelect(slot.time)}
                        className={cn(
                          "p-2 text-sm border rounded transition-colors",
                          selectedTime === slot.time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted border-input"
                        )}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  {getAvailableTimeSlots().length === 0 && (
                    <p className="text-sm text-muted-foreground">No available slots for {duration} hour{duration > 1 ? 's' : ''}</p>
                  )}
                </div>

                {/* Unavailable Slots */}
                {getUnavailableTimeSlots().length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Booked</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {getUnavailableTimeSlots().map((slot) => (
                        <Badge
                          key={slot.time}
                          variant="secondary"
                          className="justify-center opacity-50"
                        >
                          {slot.time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}