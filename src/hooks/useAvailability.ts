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
      
      // Define start and end of the selected day (local time)
      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(24, 0, 0, 0);
      
      // Fetch existing bookings for the selected date using start_time/duration_minutes
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select("id, user_id, start_time, duration_minutes, status, payment_status")
        .eq("screen_id", screenId)
        .gte("start_time", dayStart.toISOString())
        .lt("start_time", dayEnd.toISOString());

      if (error) throw error;

      // Generate hourly time slots (defaults 09:00-21:00)
      const slots: TimeSlot[] = [];
      const startHour = 9;
      const endHour = 21;

      for (let hour = startHour; hour < endHour; hour++) {
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;

        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);
        
        // Check if this time slot conflicts with any booking
        const conflictingBooking = bookings?.find((b: any) => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(bStart.getTime() + (b.duration_minutes || 0) * 60000);
          const blocks = ['confirmed', 'pending'].includes(b.status || 'pending');
          return blocks && bStart < slotEnd && bEnd > slotStart;
        });

        slots.push({
          time: timeStr,
          available: !conflictingBooking,
          booking: undefined,
        });
      }

      setAvailability({
        date: dateStr,
        timeSlots: slots,
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

  // Realtime: listen to bookings changes for this screen and refetch availability
  useEffect(() => {
    if (!screenId || !screen) return;
    const channel = supabase
      .channel(`availability-${screenId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `screen_id=eq.${screenId}`,
      }, () => {
        // Debounce rapid updates lightly
        setTimeout(() => {
          fetchAvailability();
        }, 50);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [screenId, selectedDate, screen]);

  return {
    availability,
    loading,
    checkConflict,
    refetch: fetchAvailability
  };
};