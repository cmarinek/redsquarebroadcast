import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Shield, 
  Clock, 
  Eye, 
  EyeOff, 
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useDisplayMode } from '@/contexts/DisplayModeContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function SecuritySettings() {
  const {
    isSecured,
    accessPin,
    scheduledModeSwitch,
    emergencyAccessEnabled,
    setAccessPin,
    scheduleAutoSwitch,
    resetSecurity
  } = useDisplayMode();
  
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSetPin = () => {
    if (newPin.length < 4) {
      toast.error('PIN must be at least 4 characters');
      return;
    }
    
    if (newPin !== confirmPin) {
      toast.error('PINs do not match');
      return;
    }
    
    setAccessPin(newPin);
    setNewPin('');
    setConfirmPin('');
  };

  const handleRemovePin = () => {
    setAccessPin(null);
    setNewPin('');
    setConfirmPin('');
  };

  const handleScheduleSwitch = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduleDate = new Date(selectedDate);
    scheduleDate.setHours(hours, minutes, 0, 0);
    
    if (scheduleDate <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }
    
    scheduleAutoSwitch(scheduleDate);
    setShowCalendar(false);
  };

  const handleCancelSchedule = () => {
    scheduleAutoSwitch(null);
  };

  return (
    <div className="space-y-6">
      {/* PIN Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access PIN Protection
          </CardTitle>
          <CardDescription>
            Secure admin mode access with a PIN code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isSecured ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">PIN Protection Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Admin access requires PIN verification
                  </p>
                </div>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Secured
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRemovePin}
                  className="text-destructive"
                >
                  Remove PIN
                </Button>
                <Button variant="outline" onClick={resetSecurity}>
                  Reset All Security
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">No PIN Protection</p>
                  <p className="text-sm text-muted-foreground">
                    Anyone can access admin mode
                  </p>
                </div>
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Unsecured
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-pin">New PIN</Label>
                  <div className="relative">
                    <Input
                      id="new-pin"
                      type={showPins ? 'text' : 'password'}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter PIN"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confirm-pin">Confirm PIN</Label>
                  <div className="relative">
                    <Input
                      id="confirm-pin"
                      type={showPins ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Confirm PIN"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showPins}
                    onCheckedChange={setShowPins}
                  />
                  <Label>Show PINs</Label>
                </div>
                
                <Button 
                  onClick={handleSetPin}
                  disabled={!newPin || !confirmPin}
                >
                  Set PIN
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Mode Switch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Display Mode
          </CardTitle>
          <CardDescription>
            Automatically switch to display mode at scheduled times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scheduledModeSwitch ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Scheduled Switch Active</p>
                  <p className="text-sm text-muted-foreground">
                    Will switch to display mode at {scheduledModeSwitch.toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Scheduled
                </Badge>
              </div>
              
              <Button variant="outline" onClick={handleCancelSchedule}>
                Cancel Schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleScheduleSwitch}
                disabled={!selectedDate}
              >
                Schedule Auto-Switch
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Access
          </CardTitle>
          <CardDescription>
            Emergency methods to access admin mode during display mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Corner Click Access</p>
                <p className="text-sm text-muted-foreground">
                  Click top-right corner 5 times to reveal admin button
                </p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Keyboard Shortcut</p>
                <p className="text-sm text-muted-foreground">
                  Press Ctrl + Shift + A or emergency sequence
                </p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              <strong>Emergency Sequence:</strong> Ctrl + Shift + E + M + E + R + G
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Hold Ctrl + Shift and type "EMERG" to trigger emergency access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}