import { useState, useEffect } from "react";
import { 
  Calendar,
  Clock,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Target,
  DollarSign,
  Repeat,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface ContentSchedule {
  id: string;
  schedule_name: string;
  content_id: string;
  target_screens: string[];
  start_date: string;
  end_date?: string;
  time_slots: TimeSlot[];
  repeat_pattern: 'none' | 'daily' | 'weekly' | 'monthly';
  budget_limit?: number;
  status: 'active' | 'paused' | 'completed' | 'expired';
  auto_book: boolean;
  created_at: string;
  content?: {
    file_name: string;
    file_type: string;
  };
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  days_of_week: number[]; // 0-6 (Sunday-Saturday)
}

interface ContentSchedulingAutomationProps {
  contentUploads: Array<{ id: string; file_name: string; file_type: string; }>;
  screens: Array<{ id: string; screen_name: string; city: string; }>;
}

export const ContentSchedulingAutomation = ({ contentUploads, screens }: ContentSchedulingAutomationProps) => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ContentSchedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    schedule_name: '',
    content_id: '',
    target_screens: [] as string[],
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    time_slots: [{ start_time: '09:00', end_time: '17:00', days_of_week: [1, 2, 3, 4, 5] }] as TimeSlot[],
    repeat_pattern: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    budget_limit: '',
    auto_book: true
  });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_schedules')
        .select(`
          *,
          content_uploads(file_name, file_type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedSchedules: ContentSchedule[] = data?.map(schedule => ({
        ...schedule,
        time_slots: (schedule.time_slots as any) || [],
        content: (schedule as any).content_uploads,
        status: schedule.status as 'active' | 'paused' | 'completed' | 'expired',
        repeat_pattern: (schedule.repeat_pattern as 'none' | 'daily' | 'weekly' | 'monthly') || 'none'
      })) || [];

      setSchedules(processedSchedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error loading schedules",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateSchedule = async () => {
    if (!scheduleForm.schedule_name.trim() || !scheduleForm.content_id) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const scheduleData = {
        schedule_name: scheduleForm.schedule_name,
        content_id: scheduleForm.content_id,
        target_screens: scheduleForm.target_screens,
        start_date: scheduleForm.start_date,
        end_date: scheduleForm.end_date || null,
        time_slots: scheduleForm.time_slots as any,
        repeat_pattern: scheduleForm.repeat_pattern,
        budget_limit: scheduleForm.budget_limit ? parseInt(scheduleForm.budget_limit) * 100 : null,
        auto_book: scheduleForm.auto_book,
        user_id: (await supabase.auth.getUser()).data.user?.id
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
          .insert(scheduleData));
      }

      if (error) throw error;

      toast({
        title: editingSchedule ? "Schedule updated" : "Schedule created",
        description: `"${scheduleForm.schedule_name}" has been ${editingSchedule ? 'updated' : 'created'} successfully.`,
      });

      resetForm();
      setIsDialogOpen(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Error saving schedule",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleScheduleStatus = async (scheduleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('content_schedules')
        .update({ status: newStatus })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: `Schedule ${newStatus}`,
        description: `The schedule has been ${newStatus}.`,
      });

      fetchSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error updating schedule",
        description: "Please try again.",
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
        title: "Schedule deleted",
        description: "The schedule has been deleted successfully.",
      });

      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error deleting schedule",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const editSchedule = (schedule: ContentSchedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      schedule_name: schedule.schedule_name,
      content_id: schedule.content_id,
      target_screens: schedule.target_screens,
      start_date: schedule.start_date,
      end_date: schedule.end_date || '',
      time_slots: schedule.time_slots,
      repeat_pattern: schedule.repeat_pattern,
      budget_limit: schedule.budget_limit ? (schedule.budget_limit / 100).toString() : '',
      auto_book: schedule.auto_book
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setScheduleForm({
      schedule_name: '',
      content_id: '',
      target_screens: [],
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: '',
      time_slots: [{ start_time: '09:00', end_time: '17:00', days_of_week: [1, 2, 3, 4, 5] }],
      repeat_pattern: 'none',
      budget_limit: '',
      auto_book: true
    });
  };

  const addTimeSlot = () => {
    setScheduleForm(prev => ({
      ...prev,
      time_slots: [...prev.time_slots, { start_time: '09:00', end_time: '17:00', days_of_week: [1, 2, 3, 4, 5] }]
    }));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    setScheduleForm(prev => ({
      ...prev,
      time_slots: prev.time_slots.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const removeTimeSlot = (index: number) => {
    setScheduleForm(prev => ({
      ...prev,
      time_slots: prev.time_slots.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'paused':
        return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'expired':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-emerald-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Content Scheduling Automation
              </CardTitle>
              <CardDescription>
                Automate your content broadcasting with intelligent scheduling
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  <DialogDescription>
                    Set up automated content broadcasting with custom scheduling rules
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="targeting">Targeting</TabsTrigger>
                    <TabsTrigger value="timing">Timing</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="schedule_name">Schedule Name</Label>
                      <Input
                        id="schedule_name"
                        value={scheduleForm.schedule_name}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, schedule_name: e.target.value }))}
                        placeholder="e.g., Morning Rush Campaign"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="content_id">Content</Label>
                      <Select value={scheduleForm.content_id} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, content_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select content to schedule" />
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
                    
                    <div>
                      <Label htmlFor="budget_limit">Budget Limit (Optional)</Label>
                      <Input
                        id="budget_limit"
                        type="number"
                        value={scheduleForm.budget_limit}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, budget_limit: e.target.value }))}
                        placeholder="Maximum spend in dollars"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto_book"
                        checked={scheduleForm.auto_book}
                        onCheckedChange={(checked) => setScheduleForm(prev => ({ ...prev, auto_book: checked }))}
                      />
                      <Label htmlFor="auto_book">Automatically book available slots</Label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="targeting" className="space-y-4">
                    <div>
                      <Label>Target Screens</Label>
                      <div className="grid gap-2 max-h-48 overflow-y-auto border rounded p-3">
                        {screens.map((screen) => (
                          <div key={screen.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`screen-${screen.id}`}
                              checked={scheduleForm.target_screens.includes(screen.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setScheduleForm(prev => ({
                                    ...prev,
                                    target_screens: [...prev.target_screens, screen.id]
                                  }));
                                } else {
                                  setScheduleForm(prev => ({
                                    ...prev,
                                    target_screens: prev.target_screens.filter(id => id !== screen.id)
                                  }));
                                }
                              }}
                              className="rounded"
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
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={scheduleForm.start_date}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date (Optional)</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={scheduleForm.end_date}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Repeat Pattern</Label>
                      <Select value={scheduleForm.repeat_pattern} onValueChange={(value: any) => setScheduleForm(prev => ({ ...prev, repeat_pattern: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Repeat</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Time Slots</Label>
                      <div className="space-y-3">
                        {scheduleForm.time_slots.map((slot, index) => (
                          <div key={index} className="p-3 border rounded">
                            <div className="grid gap-3 md:grid-cols-2 mb-3">
                              <div>
                                <Label>Start Time</Label>
                                <Input
                                  type="time"
                                  value={slot.start_time}
                                  onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>End Time</Label>
                                <Input
                                  type="time"
                                  value={slot.end_time}
                                  onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <Label>Days of Week</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {daysOfWeek.map((day, dayIndex) => (
                                  <label key={dayIndex} className="flex items-center space-x-1 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={slot.days_of_week.includes(dayIndex)}
                                      onChange={(e) => {
                                        const newDays = e.target.checked
                                          ? [...slot.days_of_week, dayIndex]
                                          : slot.days_of_week.filter(d => d !== dayIndex);
                                        updateTimeSlot(index, 'days_of_week', newDays);
                                      }}
                                      className="rounded"
                                    />
                                    <span>{day.slice(0, 3)}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            {scheduleForm.time_slots.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeTimeSlot(index)}
                                className="mt-2"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" onClick={addTimeSlot}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Time Slot
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createOrUpdateSchedule} disabled={loading}>
                    {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Schedules</CardTitle>
          <CardDescription>Manage your automated content schedules</CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{schedule.schedule_name}</h4>
                      <Badge className={`${getStatusColor(schedule.status)} border flex items-center gap-1`}>
                        {getStatusIcon(schedule.status)}
                        {schedule.status}
                      </Badge>
                      {schedule.repeat_pattern !== 'none' && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          {schedule.repeat_pattern}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Content: {schedule.content?.file_name}</p>
                      <p>Period: {format(new Date(schedule.start_date), 'MMM d, yyyy')} 
                        {schedule.end_date && ` - ${format(new Date(schedule.end_date), 'MMM d, yyyy')}`}
                      </p>
                      <p>Screens: {schedule.target_screens.length} targeted</p>
                      {schedule.budget_limit && (
                        <p>Budget: ${(schedule.budget_limit / 100).toFixed(2)} limit</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleScheduleStatus(schedule.id, schedule.status)}
                    >
                      {schedule.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editSchedule(schedule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No schedules created</h3>
              <p className="text-muted-foreground mb-4">
                Create automated schedules to streamline your content broadcasting
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};