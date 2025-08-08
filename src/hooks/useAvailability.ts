import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO } from "date-fns";

export interface TimeSlot {
  time: string;
  available: boolean;
  booking?: {
    id: string;
    user_id: string;
    content_id: string;
    scheduled_start_time: string;
    scheduled_end_time: string;
  };
}

export interface AvailabilityData {
  date: string;
  timeSlots: TimeSlot[];
}

export const useAvailability = (screenId: string | undefined, selectedDate: Date | undefined) => {
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<any>(null);

  const fetchScreenData = async () => {
    if (!screenId) return;
    
    const { data, error } = await supabase
      .from("screens")
      .select("*")
      .eq("id", screenId)
      .single();
    
    if (!error && data) {
      setScreen(data);
    }
  };

  const fetchAvailability = async () => {
    if (!screenId || !selectedDate || !screen) return;
    
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Fetch existing bookings for the selected date
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("id, user_id, content_id, scheduled_start_time, scheduled_end_time, status")
        .eq("screen_id", screenId)
        .eq("scheduled_date", dateStr)
        .in("status", ["confirmed", "paid", "active"]);

      if (error) throw error;

      // Generate time slots based on screen availability
      const slots: TimeSlot[] = [];
      const start = parseInt(screen.availability_start.split(':')[0]);
      const end = parseInt(screen.availability_end.split(':')[0]);

      for (let hour = start; hour < end; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
        
        // Check if this time slot conflicts with any booking
        const conflictingBooking = bookings?.find(booking => {
          const bookingStart = parseInt(booking.scheduled_start_time.split(':')[0]);
          const bookingEnd = parseInt(booking.scheduled_end_time.split(':')[0]);
          return hour >= bookingStart && hour < bookingEnd;
        });

        slots.push({
          time: timeStr,
          available: !conflictingBooking,
          booking: conflictingBooking || undefined
        });
      }

      setAvailability({
        date: dateStr,
        timeSlots: slots
      });
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkConflict = (startTime: string, duration: number): boolean => {
    if (!availability) return false;
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = startHour + duration;
    
    for (let hour = startHour; hour < endHour; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const slot = availability.timeSlots.find(s => s.time === timeStr);
      if (slot && !slot.available) {
        return true; // Conflict found
      }
    }
    
    return false; // No conflict
  };

  useEffect(() => {
    fetchScreenData();
  }, [screenId]);

  useEffect(() => {
    if (screen && selectedDate) {
      fetchAvailability();
    }
  }, [screenId, selectedDate, screen]);

  return {
    availability,
    loading,
    checkConflict,
    refetch: fetchAvailability
  };
};