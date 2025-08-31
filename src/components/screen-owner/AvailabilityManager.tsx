import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isSameDay, parseISO } from "date-fns";

interface AvailabilitySlot {
  id?: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
  is_available: boolean;
  special_pricing?: number;
}

interface SpecialSchedule {
  id?: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  reason?: string;
  special_pricing?: number;
}

interface AvailabilityManagerProps {
  screenId: string;
}

export const AvailabilityManager = ({ screenId }: AvailabilityManagerProps) => {
  const { toast } = useToast();
  const [regularSchedule, setRegularSchedule] = useState<AvailabilitySlot[]>([]);
  const [specialSchedules, setSpecialSchedules] = useState<SpecialSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [showAddSpecialSchedule, setShowAddSpecialSchedule] = useState(false);
  const [isAlwaysAvailable, setIsAlwaysAvailable] = useState(false);

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  useEffect(() => {
    fetchAvailabilityData();
  }, [screenId]);

  const fetchAvailabilityData = async () => {
    setLoading(true);
    try {
      // Fetch current screen data
      const { data: screenData, error: screenError } = await supabase
        .from('screens')
        .select('availability_start, availability_end')
        .eq('id', screenId)
        .single();

      if (screenError && screenError.code !== 'PGRST116') {
        throw screenError;
      }

      // Initialize default 24/7 schedule if no custom schedule exists
      if (!screenData?.availability_start && !screenData?.availability_end) {
        setIsAlwaysAvailable(true);
        const defaultSchedule: AvailabilitySlot[] = daysOfWeek.map((_, index) => ({
          day_of_week: index,
          start_time: '00:00',
          end_time: '23:59',
          is_available: true
        }));
        setRegularSchedule(defaultSchedule);
      } else {
        // Parse existing availability data (simplified)
        const schedule: AvailabilitySlot[] = daysOfWeek.map((_, index) => ({
          day_of_week: index,
          start_time: screenData?.availability_start || '09:00',
          end_time: screenData?.availability_end || '17:00',
          is_available: true
        }));
        setRegularSchedule(schedule);
      }

      // Fetch special schedules (mock data for now)
      const mockSpecialSchedules: SpecialSchedule[] = [
        {
          id: '1',
          date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
          start_time: '00:00',
          end_time: '23:59',
          is_available: false,
          reason: 'Maintenance',
        },
        {
          id: '2',
          date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
          start_time: '18:00',
          end_time: '22:00',
          is_available: true,
          reason: 'Extended Hours',
          special_pricing: 75
        }
      ];
      setSpecialSchedules(mockSpecialSchedules);

    } catch (error) {
      console.error('Error fetching availability data:', error);
      toast({
        title: "Error",
        description: "Failed to load availability data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRegularSchedule = async () => {
    setSaving(true);
    try {
      // Find the most common start and end times for database storage
      const startTimes = regularSchedule.filter(slot => slot.is_available).map(slot => slot.start_time);
      const endTimes = regularSchedule.filter(slot => slot.is_available).map(slot => slot.end_time);
      
      const mostCommonStart = startTimes.sort((a,b) => 
        startTimes.filter(v => v === a).length - startTimes.filter(v => v === b).length
      ).pop() || '09:00';
      
      const mostCommonEnd = endTimes.sort((a,b) => 
        endTimes.filter(v => v === a).length - endTimes.filter(v => v === b).length
      ).pop() || '17:00';

      const { error } = await supabase
        .from('screens')
        .update({
          availability_start: isAlwaysAvailable ? null : mostCommonStart,
          availability_end: isAlwaysAvailable ? null : mostCommonEnd,
          updated_at: new Date().toISOString()
        })
        .eq('id', screenId);

      if (error) throw error;

      // In a real app, you'd also save the detailed schedule to a separate table
      
      toast({
        title: "Schedule Updated",
        description: "Your availability schedule has been saved successfully",
      });
      
      setEditingSlot(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save availability schedule",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSlot = (dayOfWeek: number, updates: Partial<AvailabilitySlot>) => {
    setRegularSchedule(prev => 
      prev.map(slot => 
        slot.day_of_week === dayOfWeek 
          ? { ...slot, ...updates }
          : slot
      )
    );
  };

  const addSpecialSchedule = (schedule: Omit<SpecialSchedule, 'id'>) => {
    const newSchedule: SpecialSchedule = {
      ...schedule,
      id: Date.now().toString()
    };
    setSpecialSchedules(prev => [...prev, newSchedule]);
    setShowAddSpecialSchedule(false);
    
    toast({
      title: "Special Schedule Added",
      description: `Schedule for ${format(parseISO(schedule.date), 'MMM d, yyyy')} has been added`,
    });
  };

  const removeSpecialSchedule = (id: string) => {
    setSpecialSchedules(prev => prev.filter(schedule => schedule.id !== id));
    toast({
      title: "Special Schedule Removed",
      description: "The special schedule has been removed",
    });
  };

  const getScheduleForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const special = specialSchedules.find(s => s.date === dateStr);
    
    if (special) {
      return special;
    }
    
    const dayOfWeek = date.getDay();
    const regular = regularSchedule.find(slot => slot.day_of_week === dayOfWeek);
    
    return regular ? {
      start_time: regular.start_time,
      end_time: regular.end_time,
      is_available: regular.is_available
    } : null;
  };

  const hasSpecialSchedule = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return specialSchedules.some(s => s.date === dateStr);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Availability Management</h2>
          <p className="text-muted-foreground">
            Set your screen's operating hours and special schedules
          </p>
        </div>
        <Button onClick={saveRegularSchedule} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Always Available Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>24/7 Availability</CardTitle>
              <CardDescription>
                Make your screen available around the clock
              </CardDescription>
            </div>
            <Switch
              checked={isAlwaysAvailable}
              onCheckedChange={(checked) => {
                setIsAlwaysAvailable(checked);
                if (checked) {
                  // Set all days to 24/7
                  setRegularSchedule(prev => 
                    prev.map(slot => ({
                      ...slot,
                      start_time: '00:00',
                      end_time: '23:59',
                      is_available: true
                    }))
                  );
                }
              }}
            />
          </div>
        </CardHeader>
        {isAlwaysAvailable && (
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Your screen is available 24 hours a day, 7 days a week
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Regular Schedule */}
      {!isAlwaysAvailable && (
        <Card>
          <CardHeader>
            <CardTitle>Regular Schedule</CardTitle>
            <CardDescription>
              Set your default operating hours for each day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regularSchedule.map((slot) => (
                <div key={slot.day_of_week} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-20">
                    <Label className="font-medium">
                      {daysOfWeek[slot.day_of_week]}
                    </Label>
                  </div>
                  
                  <Switch
                    checked={slot.is_available}
                    onCheckedChange={(checked) => 
                      updateSlot(slot.day_of_week, { is_available: checked })
                    }
                  />
                  
                  {slot.is_available && (
                    <>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => 
                            updateSlot(slot.day_of_week, { start_time: e.target.value })
                          }
                          className="w-32"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => 
                            updateSlot(slot.day_of_week, { end_time: e.target.value })
                          }
                          className="w-32"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Special Rate:</Label>
                        <Input
                          type="number"
                          placeholder="$/hour"
                          value={slot.special_pricing || ''}
                          onChange={(e) => 
                            updateSlot(slot.day_of_week, { 
                              special_pricing: e.target.value ? parseFloat(e.target.value) : undefined 
                            })
                          }
                          className="w-24"
                        />
                      </div>
                    </>
                  )}
                  
                  {!slot.is_available && (
                    <Badge variant="secondary" className="text-muted-foreground">
                      Closed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>
              Click on dates to view or modify schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                specialSchedule: (date) => hasSpecialSchedule(date),
                unavailable: (date) => {
                  const schedule = getScheduleForDate(date);
                  return !schedule?.is_available;
                }
              }}
              modifiersStyles={{
                specialSchedule: { backgroundColor: '#fef3c7' },
                unavailable: { backgroundColor: '#fee2e2', color: '#991b1b' }
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </CardTitle>
                <CardDescription>
                  {selectedDate && daysOfWeek[selectedDate.getDay()]}
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddSpecialSchedule(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Special
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedDate && (
              <div className="space-y-4">
                {(() => {
                  const schedule = getScheduleForDate(selectedDate);
                  const special = specialSchedules.find(s => 
                    s.date === format(selectedDate, 'yyyy-MM-dd')
                  );
                  
                  if (special) {
                    return (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Special Schedule
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSpecialSchedule(special.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {special.is_available ? (
                          <div>
                            <p className="font-medium text-green-600">Available</p>
                            <p className="text-sm text-muted-foreground">
                              {special.start_time} - {special.end_time}
                            </p>
                            {special.special_pricing && (
                              <p className="text-sm text-muted-foreground">
                                Special rate: ${special.special_pricing}/hour
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="font-medium text-red-600">Unavailable</p>
                        )}
                        
                        {special.reason && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Reason: {special.reason}
                          </p>
                        )}
                      </div>
                    );
                  }
                  
                  if (schedule) {
                    return (
                      <div className="p-4 border rounded-lg">
                        <Badge variant="outline">Regular Schedule</Badge>
                        <div className="mt-2">
                          {schedule.is_available ? (
                            <div>
                              <p className="font-medium text-green-600">Available</p>
                              <p className="text-sm text-muted-foreground">
                                {schedule.start_time} - {schedule.end_time}
                              </p>
                            </div>
                          ) : (
                            <p className="font-medium text-red-600">Closed</p>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="p-4 border rounded-lg text-center">
                      <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No schedule set for this date</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Special Schedules List */}
      {specialSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Special Schedules</CardTitle>
            <CardDescription>
              Override your regular schedule for specific dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {specialSchedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="font-medium">
                        {format(parseISO(schedule.date), 'MMM d, yyyy')}
                      </span>
                      <Badge className={schedule.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {schedule.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    
                    {schedule.is_available && (
                      <p className="text-sm text-muted-foreground">
                        {schedule.start_time} - {schedule.end_time}
                        {schedule.special_pricing && ` • $${schedule.special_pricing}/hour`}
                      </p>
                    )}
                    
                    {schedule.reason && (
                      <p className="text-sm text-muted-foreground">
                        {schedule.reason}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSpecialSchedule(schedule.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Special Schedule Modal */}
      {showAddSpecialSchedule && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Special Schedule</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddSpecialSchedule(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                {format(selectedDate, 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const isAvailable = formData.get('available') === 'on';
                  
                  addSpecialSchedule({
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    start_time: formData.get('start_time') as string || '09:00',
                    end_time: formData.get('end_time') as string || '17:00',
                    is_available: isAvailable,
                    reason: formData.get('reason') as string || undefined,
                    special_pricing: formData.get('special_pricing') 
                      ? parseFloat(formData.get('special_pricing') as string)
                      : undefined
                  });
                }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    defaultChecked
                    className="rounded"
                  />
                  <Label htmlFor="available">Available on this date</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      type="time"
                      id="start_time"
                      name="start_time"
                      defaultValue="09:00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      type="time"
                      id="end_time"
                      name="end_time"
                      defaultValue="17:00"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="special_pricing">Special Rate ($/hour)</Label>
                  <Input
                    type="number"
                    id="special_pricing"
                    name="special_pricing"
                    placeholder="Leave blank for regular rate"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    name="reason"
                    placeholder="e.g., Extended hours, Maintenance, Holiday"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Add Schedule
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddSpecialSchedule(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};