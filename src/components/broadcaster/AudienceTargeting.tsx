import { useState, useEffect } from "react";
import { Target, Users, MapPin, Clock, Smartphone, TrendingUp, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AudienceTarget {
  id: string;
  campaign_id?: string;
  booking_id?: string;
  target_demographics: {
    age_range?: [number, number];
    gender?: 'male' | 'female' | 'all';
    interests?: string[];
    income_range?: string;
    education_level?: string;
  };
  location_radius_km?: number;
  location_lat?: number;
  location_lng?: number;
  time_slots: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
  device_types: string[];
}

interface TargetingFormData {
  demographics: {
    age_range: [number, number];
    gender: 'male' | 'female' | 'all';
    interests: string[];
    income_range: string;
    education_level: string;
  };
  location: {
    radius_km: number;
    latitude?: number;
    longitude?: number;
    use_current_location: boolean;
  };
  timing: {
    time_slots: Array<{
      day: string;
      start_time: string;
      end_time: string;
      enabled: boolean;
    }>;
    peak_hours_only: boolean;
  };
  devices: string[];
}

const AudienceTargeting = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [targets, setTargets] = useState<AudienceTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TargetingFormData>({
    demographics: {
      age_range: [18, 65],
      gender: 'all',
      interests: [],
      income_range: 'all',
      education_level: 'all'
    },
    location: {
      radius_km: 10,
      use_current_location: false
    },
    timing: {
      time_slots: [
        { day: 'monday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'tuesday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'wednesday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'thursday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'friday', start_time: '09:00', end_time: '17:00', enabled: true },
        { day: 'saturday', start_time: '10:00', end_time: '16:00', enabled: false },
        { day: 'sunday', start_time: '10:00', end_time: '16:00', enabled: false }
      ],
      peak_hours_only: false
    },
    devices: ['smartphone', 'tablet', 'desktop']
  });

  const interestOptions = [
    'Technology', 'Fashion', 'Sports', 'Travel', 'Food & Dining', 
    'Entertainment', 'Health & Fitness', 'Business', 'Education',
    'Automotive', 'Real Estate', 'Finance', 'Gaming', 'Music',
    'Art & Culture', 'Home & Garden', 'Parenting', 'Pets'
  ];

  const deviceOptions = [
    { id: 'smartphone', label: 'Smartphones', icon: '📱' },
    { id: 'tablet', label: 'Tablets', icon: '📱' },
    { id: 'desktop', label: 'Desktop/Laptop', icon: '💻' },
    { id: 'smart_tv', label: 'Smart TV', icon: '📺' },
    { id: 'digital_signage', label: 'Digital Signage', icon: '🖥️' }
  ];

  useEffect(() => {
    if (user) {
      fetchTargets();
    }
  }, [user]);

  const fetchTargets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audience_targets')
        .select('*')
        .or(`campaign_id.in.(${await getUserCampaignIds()}),booking_id.in.(${await getUserBookingIds()})`);

      if (error) throw error;
      setTargets(data || []);
    } catch (error) {
      console.error('Error fetching targets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserCampaignIds = async (): Promise<string> => {
    const { data } = await supabase
      .from('ab_test_campaigns')
      .select('id')
      .eq('user_id', user?.id);
    return (data || []).map(c => c.id).join(',') || 'null';
  };

  const getUserBookingIds = async (): Promise<string> => {
    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', user?.id);
    return (data || []).map(b => b.id).join(',') || 'null';
  };

  const saveTargeting = async () => {
    if (!user) return;

    try {
      const targetData = {
        user_id: user.id,
        target_demographics: formData.demographics,
        location_radius_km: formData.location.radius_km,
        location_lat: formData.location.latitude,
        location_lng: formData.location.longitude,
        time_slots: formData.timing.time_slots.filter(slot => slot.enabled).map(slot => ({
          day: slot.day,
          start_time: slot.start_time,
          end_time: slot.end_time
        })),
        device_types: formData.devices
      };

      const { error } = await supabase
        .from('audience_targets')
        .insert(targetData);

      if (error) throw error;

      toast({
        title: "Targeting saved",
        description: "Your audience targeting preferences have been saved."
      });

      fetchTargets();
    } catch (error) {
      console.error('Error saving targeting:', error);
      toast({
        title: "Error saving targeting",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        interests: prev.demographics.interests.includes(interest)
          ? prev.demographics.interests.filter(i => i !== interest)
          : [...prev.demographics.interests, interest]
      }
    }));
  };

  const handleDeviceToggle = (deviceId: string) => {
    setFormData(prev => ({
      ...prev,
      devices: prev.devices.includes(deviceId)
        ? prev.devices.filter(d => d !== deviceId)
        : [...prev.devices, deviceId]
    }));
  };

  const updateTimeSlot = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      timing: {
        ...prev.timing,
        time_slots: prev.timing.time_slots.map(slot =>
          slot.day === day ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const getLocationFromBrowser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              use_current_location: true
            }
          }));
          toast({
            title: "Location detected",
            description: "Using your current location for targeting."
          });
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enable location access or enter coordinates manually.",
            variant: "destructive"
          });
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Audience Targeting
          </CardTitle>
          <CardDescription>
            Define your target audience with precision to maximize campaign effectiveness
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="demographics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Demographic Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Age Range */}
              <div className="space-y-3">
                <Label>Age Range: {formData.demographics.age_range[0]} - {formData.demographics.age_range[1]} years</Label>
                <Slider
                  value={formData.demographics.age_range}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    demographics: { ...prev.demographics, age_range: value as [number, number] }
                  }))}
                  min={13}
                  max={80}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Gender */}
              <div className="space-y-3">
                <Label>Gender</Label>
                <Select 
                  value={formData.demographics.gender} 
                  onValueChange={(value: 'male' | 'female' | 'all') => 
                    setFormData(prev => ({
                      ...prev,
                      demographics: { ...prev.demographics, gender: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label>Interests ({formData.demographics.interests.length} selected)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {interestOptions.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.demographics.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <Label htmlFor={interest} className="text-sm font-normal">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Income Range */}
              <div className="space-y-3">
                <Label>Income Range</Label>
                <Select 
                  value={formData.demographics.income_range} 
                  onValueChange={(value) => 
                    setFormData(prev => ({
                      ...prev,
                      demographics: { ...prev.demographics, income_range: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Income Levels</SelectItem>
                    <SelectItem value="low">$0 - $30,000</SelectItem>
                    <SelectItem value="medium">$30,000 - $75,000</SelectItem>
                    <SelectItem value="high">$75,000 - $150,000</SelectItem>
                    <SelectItem value="premium">$150,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Education Level */}
              <div className="space-y-3">
                <Label>Education Level</Label>
                <Select 
                  value={formData.demographics.education_level} 
                  onValueChange={(value) => 
                    setFormData(prev => ({
                      ...prev,
                      demographics: { ...prev.demographics, education_level: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Education Levels</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="some_college">Some College</SelectItem>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD/Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Location */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Use Current Location</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getLocationFromBrowser}
                    disabled={formData.location.use_current_location}
                  >
                    {formData.location.use_current_location ? 'Location Set' : 'Get Location'}
                  </Button>
                </div>
                {formData.location.use_current_location && (
                  <div className="text-sm text-muted-foreground">
                    Lat: {formData.location.latitude?.toFixed(4)}, 
                    Lng: {formData.location.longitude?.toFixed(4)}
                  </div>
                )}
              </div>

              {/* Manual Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="40.7128"
                    value={formData.location.latitude || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, latitude: parseFloat(e.target.value) || undefined }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="-74.0060"
                    value={formData.location.longitude || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: { ...prev.location, longitude: parseFloat(e.target.value) || undefined }
                    }))}
                  />
                </div>
              </div>

              {/* Radius */}
              <div className="space-y-3">
                <Label>Target Radius: {formData.location.radius_km} km</Label>
                <Slider
                  value={[formData.location.radius_km]}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    location: { ...prev.location, radius_km: value[0] }
                  }))}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 km</span>
                  <span>100 km</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timing Tab */}
        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time-based Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Slots */}
              <div className="space-y-4">
                <Label>Active Days & Hours</Label>
                {formData.timing.time_slots.map((slot) => (
                  <div key={slot.day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Checkbox
                      checked={slot.enabled}
                      onCheckedChange={(checked) => updateTimeSlot(slot.day, 'enabled', checked)}
                    />
                    <div className="flex-1 capitalize font-medium">
                      {slot.day}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateTimeSlot(slot.day, 'start_time', e.target.value)}
                        disabled={!slot.enabled}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateTimeSlot(slot.day, 'end_time', e.target.value)}
                        disabled={!slot.enabled}
                        className="w-24"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Peak Hours Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="peak_hours"
                  checked={formData.timing.peak_hours_only}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    timing: { ...prev.timing, peak_hours_only: !!checked }
                  }))}
                />
                <Label htmlFor="peak_hours">Focus on peak traffic hours only</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Device Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                {deviceOptions.map((device) => (
                  <div key={device.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={device.id}
                      checked={formData.devices.includes(device.id)}
                      onCheckedChange={() => handleDeviceToggle(device.id)}
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{device.icon}</span>
                      <Label htmlFor={device.id} className="font-medium">
                        {device.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveTargeting} className="px-8">
          <Filter className="h-4 w-4 mr-2" />
          Save Targeting Settings
        </Button>
      </div>

      {/* Existing Targets */}
      {targets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Active Targeting Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {targets.slice(0, 3).map((target) => (
                <div key={target.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {target.target_demographics.gender || 'All'} • 
                          {target.target_demographics.age_range?.[0] || 18}-{target.target_demographics.age_range?.[1] || 65}
                        </Badge>
                        {target.location_radius_km && (
                          <Badge variant="outline">
                            {target.location_radius_km}km radius
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {target.target_demographics.interests?.slice(0, 3).join(', ')}
                        {(target.target_demographics.interests?.length || 0) > 3 && 
                          ` +${(target.target_demographics.interests?.length || 0) - 3} more`
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Devices: {target.device_types.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudienceTargeting;
