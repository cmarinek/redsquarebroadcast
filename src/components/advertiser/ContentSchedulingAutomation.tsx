import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Target,
  Play,
  Pause,
  Edit,
  Trash2,
  DollarSign,
  MapPin,
  Settings,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TimeSlot {
  start_time: string;
  end_time: string;
  days_of_week: number[];
}

interface ContentSchedule {
  id?: string;
  name: string;
  content_id: string;
  target_screens: string[];
  start_date: string;
  end_date: string;
  time_slots: TimeSlot[];
  repeat_pattern: 'daily' | 'weekly' | 'monthly' | 'once';
  budget_limit: number;
  status: 'active' | 'paused' | 'completed';
  auto_booking: boolean;
}

interface ContentSchedulingAutomationProps {
  contentUploads: Array<{
    id: string;
    file_name: string;
    file_type: string;
  }>;
  screens: Array<{
    id: string;
    screen_name: string;
    city: string;
  }>;
}

export const ContentSchedulingAutomation = ({ 
  contentUploads = [], 
  screens = [] 
}: ContentSchedulingAutomationProps) => {
  const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ContentSchedule | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [scheduleName, setScheduleName] = useState("");
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{
    start_time: "09:00",
    end_time: "17:00",
    days_of_week: [1, 2, 3, 4, 5] // Monday to Friday
  }]);
  const [repeatPattern, setRepeatPattern] = useState<'daily' | 'weekly' | 'monthly' | 'once'>('weekly');
  const [budgetLimit, setBudgetLimit] = useState(1000);
  const [autoBooking, setAutoBooking] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('content_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateSchedule = async () => {
    if (!user || !scheduleName || !selectedContent || selectedScreens.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const scheduleData = {
        name: scheduleName,
        content_id: selectedContent,
        target_screens: selectedScreens,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        time_slots: timeSlots,
        repeat_pattern: repeatPattern,
        budget_limit: budgetLimit,
        auto_booking: autoBooking,
        status: 'active' as const,
        user_id: user.id
      };

      let error;
      if (editingSchedule) {
        ({ error } = await supabase
          .from('content_schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id));
      } else {
        ({ error } = await supabase
          .from('content_schedules')
          .insert([scheduleData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Schedule ${editingSchedule ? 'updated' : 'created'} successfully`
      });

      resetForm();
      setDialogOpen(false);
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive"
      });
    }
  };

  const toggleScheduleStatus = async (schedule: ContentSchedule) => {
    try {
      const newStatus = schedule.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('content_schedules')
        .update({ status: newStatus })
        .eq('id', schedule.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Schedule ${newStatus === 'active' ? 'activated' : 'paused'}`
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule status:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        variant: "destructive"
      });
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('content_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Schedule Deleted",
        description: "Schedule has been removed"
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
    }
  };

  const editSchedule = (schedule: ContentSchedule) => {
    setEditingSchedule(schedule);
    setScheduleName(schedule.name);
    setSelectedContent(schedule.content_id);
    setSelectedScreens(schedule.target_screens);
    setStartDate(new Date(schedule.start_date));
    setEndDate(new Date(schedule.end_date));
    setTimeSlots(schedule.time_slots);
    setRepeatPattern(schedule.repeat_pattern);
    setBudgetLimit(schedule.budget_limit);
    setAutoBooking(schedule.auto_booking);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setScheduleName("");
    setSelectedContent("");
    setSelectedScreens([]);
    setStartDate(undefined);
    setEndDate(undefined);
    setTimeSlots([{
      start_time: "09:00",
      end_time: "17:00", 
      days_of_week: [1, 2, 3, 4, 5]
    }]);
    setRepeatPattern('weekly');
    setBudgetLimit(1000);
    setAutoBooking(true);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, {
      start_time: "09:00",
      end_time: "17:00",
      days_of_week: [1, 2, 3, 4, 5]
    }]);
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (loading) return <div>Loading schedules...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Content Scheduling Automation</h3>
          <p className="text-sm text-muted-foreground">
            Automate your advertising campaigns with intelligent scheduling
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="targeting">Targeting</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-name">Schedule Name *</Label>
                    <Input
                      id="schedule-name"
                      value={scheduleName}
                      onChange={(e) => setScheduleName(e.target.value)}
                      placeholder="Enter schedule name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content-select">Content *</Label>
                    <Select value={selectedContent} onValueChange={setSelectedContent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content" />
                      </SelectTrigger>
                      <SelectContent>
                        {contentUploads.map((content) => (
                          <SelectItem key={content.id} value={content.id}>
                            {content.file_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget-limit">Budget Limit ($)</Label>
                  <Input
                    id="budget-limit"
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(Number(e.target.value))}
                    placeholder="1000"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-booking"
                    checked={autoBooking}
                    onCheckedChange={(checked) => setAutoBooking(checked === true)}
                  />
                  <Label htmlFor="auto-booking">Enable automatic booking</Label>
                </div>
              </TabsContent>

              <TabsContent value="targeting" className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Screens *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                    {screens.map((screen) => (
                      <div key={screen.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`screen-${screen.id}`}
                          checked={selectedScreens.includes(screen.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedScreens([...selectedScreens, screen.id]);
                            } else {
                              setSelectedScreens(selectedScreens.filter(id => id !== screen.id));
                            }
                          }}
                        />
                        <Label htmlFor={`screen-${screen.id}`} className="text-sm">
                          {screen.screen_name} - {screen.city}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Repeat Pattern</Label>
                  <Select value={repeatPattern} onValueChange={(value) => setRepeatPattern(value as 'daily' | 'weekly' | 'monthly' | 'once')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select repeat pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Time Slots</Label>
                    <Button size="sm" variant="outline" onClick={addTimeSlot}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Slot
                    </Button>
                  </div>
                  
                  {timeSlots.map((slot, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4 items-end">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={slot.start_time}
                              onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={slot.end_time}
                              onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                            />
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeTimeSlot(index)}
                            disabled={timeSlots.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="mt-4">
                          <Label className="text-sm">Days of Week</Label>
                          <div className="flex space-x-2 mt-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                              <div key={day} className="flex items-center space-x-1">
                                <Checkbox
                                  id={`day-${index}-${dayIndex}`}
                                  checked={slot.days_of_week.includes(dayIndex + 1)}
                                  onCheckedChange={(checked) => {
                                    const currentDays = slot.days_of_week;
                                    const newDays = checked
                                      ? [...currentDays, dayIndex + 1]
                                      : currentDays.filter(d => d !== dayIndex + 1);
                                    updateTimeSlot(index, 'days_of_week', newDays);
                                  }}
                                />
                                <Label htmlFor={`day-${index}-${dayIndex}`} className="text-xs">
                                  {day}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createOrUpdateSchedule}>
                {editingSchedule ? 'Update' : 'Create'} Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Schedules */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Schedules Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first automated schedule to start optimizing your campaigns
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">{schedule.name}</h4>
                      <Badge variant="secondary" className={`${getStatusColor(schedule.status)} text-white`}>
                        {getStatusIcon(schedule.status)}
                        <span className="ml-1 capitalize">{schedule.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{schedule.target_screens.length} screens</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{schedule.repeat_pattern}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${schedule.budget_limit}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Settings className="h-4 w-4" />
                        <span>{schedule.auto_booking ? 'Auto' : 'Manual'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleScheduleStatus(schedule)}
                    >
                      {schedule.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editSchedule(schedule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSchedule(schedule.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};