import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  MapPin, 
  Clock, 
  Target,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AudienceSegment {
  id?: string;
  name: string;
  demographics: {
    age_min: number;
    age_max: number;
    gender: 'all' | 'male' | 'female' | 'other';
    interests: string[];
  };
  location: {
    radius_km: number;
    latitude?: number;
    longitude?: number;
    cities: string[];
  };
  behavior: {
    device_types: string[];
    time_preferences: string[];
    engagement_history: 'high' | 'medium' | 'low' | 'all';
  };
  estimated_reach: number;
}

const AudienceTargeting = () => {
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSegment, setEditingSegment] = useState<AudienceSegment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [segmentName, setSegmentName] = useState("");
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [gender, setGender] = useState<'all' | 'male' | 'female' | 'other'>('all');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [radiusKm, setRadiusKm] = useState([10]);
  const [cities, setCities] = useState<string[]>([]);
  const [newCity, setNewCity] = useState("");
  const [deviceTypes, setDeviceTypes] = useState<string[]>(['mobile', 'desktop']);
  const [timePreferences, setTimePreferences] = useState<string[]>([]);
  const [engagementHistory, setEngagementHistory] = useState<'high' | 'medium' | 'low' | 'all'>('all');

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    if (!user) return;
    
    try {
      // Mock data for demo purposes since audience_segments table doesn't exist yet
      const mockSegments: AudienceSegment[] = [
        {
          id: '1',
          name: 'Tech Enthusiasts',
          demographics: { 
            age_min: 25, 
            age_max: 35, 
            gender: 'all' as const,
            interests: ['technology', 'gadgets']
          },
          location: { 
            radius_km: 50,
            cities: ['San Francisco', 'New York'] 
          },
          behavior: { 
            device_types: ['mobile', 'desktop'],
            time_preferences: ['evening'],
            engagement_history: 'high' as const
          },
          estimated_reach: 15000
        }
      ];
      setSegments(mockSegments);
    } catch (error) {
      console.error('Error fetching audience segments:', error);
      toast({
        title: "Error",
        description: "Failed to load audience segments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedReach = (): number => {
    // Simple estimation algorithm based on demographics and location
    let baseReach = 10000;
    
    // Age range impact
    const ageSpan = ageRange[1] - ageRange[0];
    baseReach = baseReach * (ageSpan / 47); // 47 is max age span (18-65)
    
    // Gender impact
    if (gender !== 'all') {
      baseReach = baseReach * 0.5;
    }
    
    // Location impact
    baseReach = baseReach * (radiusKm[0] / 50); // Normalize to 50km
    
    // Cities impact
    baseReach = baseReach + (cities.length * 5000);
    
    // Interests impact (more specific = smaller reach)
    if (interests.length > 0) {
      baseReach = baseReach * (1 - (interests.length * 0.1));
    }
    
    return Math.max(1000, Math.floor(baseReach));
  };

  const saveSegment = async () => {
    if (!user || !segmentName) {
      toast({
        title: "Missing Information",
        description: "Please provide a segment name",
        variant: "destructive"
      });
      return;
    }

    const segmentData = {
      name: segmentName,
      demographics: {
        age_min: ageRange[0],
        age_max: ageRange[1],
        gender,
        interests
      },
      location: {
        radius_km: radiusKm[0],
        cities
      },
      behavior: {
        device_types: deviceTypes,
        time_preferences: timePreferences,
        engagement_history: engagementHistory
      },
      estimated_reach: calculateEstimatedReach(),
      user_id: user.id
    };

    try {
      if (editingSegment) {
        // Mock update - update local state
        setSegments(segments.map(s => s.id === editingSegment.id ? { ...segmentData, id: editingSegment.id } : s));
      } else {
        // Mock creation - add to local state
        const mockSegment = { ...segmentData, id: Math.random().toString() };
        setSegments([mockSegment, ...segments]);
      }

      toast({
        title: "Success",
        description: `Segment ${editingSegment ? 'updated' : 'created'} successfully`
      });

      resetForm();
    } catch (error) {
      console.error('Error saving segment:', error);
      toast({
        title: "Error",
        description: "Failed to save audience segment",
        variant: "destructive"
      });
    }
  };

  const deleteSegment = async (segmentId: string) => {
    try {
      // Mock deletion - remove from local state
      setSegments(segments.filter(s => s.id !== segmentId));

      toast({
        title: "Segment Deleted",
        description: "Audience segment has been removed"
      });
    } catch (error) {
      console.error('Error deleting segment:', error);
      toast({
        title: "Error",
        description: "Failed to delete segment",
        variant: "destructive"
      });
    }
  };

  const editSegment = (segment: AudienceSegment) => {
    setEditingSegment(segment);
    setSegmentName(segment.name);
    setAgeRange([segment.demographics.age_min, segment.demographics.age_max]);
    setGender(segment.demographics.gender);
    setInterests(segment.demographics.interests);
    setCities(segment.location.cities);
    setRadiusKm([segment.location.radius_km]);
    setDeviceTypes(segment.behavior.device_types);
    setTimePreferences(segment.behavior.time_preferences);
    setEngagementHistory(segment.behavior.engagement_history);
    setIsCreating(true);
  };

  const resetForm = () => {
    setEditingSegment(null);
    setSegmentName("");
    setAgeRange([18, 65]);
    setGender('all');
    setInterests([]);
    setNewInterest("");
    setCities([]);
    setNewCity("");
    setRadiusKm([10]);
    setDeviceTypes(['mobile', 'desktop']);
    setTimePreferences([]);
    setEngagementHistory('all');
    setIsCreating(false);
  };

  const addInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const addCity = () => {
    if (newCity && !cities.includes(newCity)) {
      setCities([...cities, newCity]);
      setNewCity("");
    }
  };

  const removeCity = (city: string) => {
    setCities(cities.filter(c => c !== city));
  };

  if (loading) return <div>Loading audience segments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Audience Targeting</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage custom audience segments for precise targeting
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSegment ? 'Edit' : 'Create'} Audience Segment</CardTitle>
            <CardDescription>
              Define your target audience with demographic, geographic, and behavioral criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="demographics" className="space-y-4">
              <TabsList>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="demographics" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="segment-name">Segment Name *</Label>
                  <Input
                    id="segment-name"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    placeholder="e.g., Young Professionals"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Age Range: {ageRange[0]} - {ageRange[1]} years</Label>
                  <Slider
                    value={ageRange}
                    onValueChange={setAgeRange}
                    max={80}
                    min={13}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={(value) => setGender(value as typeof gender)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add interest"
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <Button onClick={addInterest} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="cursor-pointer" onClick={() => removeInterest(interest)}>
                        {interest} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Radius: {radiusKm[0]} km</Label>
                  <Slider
                    value={radiusKm}
                    onValueChange={setRadiusKm}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cities</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="Add city"
                      onKeyPress={(e) => e.key === 'Enter' && addCity()}
                    />
                    <Button onClick={addCity} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {cities.map((city) => (
                      <Badge key={city} variant="secondary" className="cursor-pointer" onClick={() => removeCity(city)}>
                        {city} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <div className="space-y-2">
                  <Label>Device Types</Label>
                  <div className="space-y-2">
                    {['mobile', 'desktop', 'tablet', 'smart_tv'].map((device) => (
                      <div key={device} className="flex items-center space-x-2">
                        <Checkbox
                          id={device}
                          checked={deviceTypes.includes(device)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setDeviceTypes([...deviceTypes, device]);
                            } else {
                              setDeviceTypes(deviceTypes.filter(d => d !== device));
                            }
                          }}
                        />
                        <Label htmlFor={device} className="capitalize">{device.replace('_', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Time Preferences</Label>
                  <div className="space-y-2">
                    {['morning', 'afternoon', 'evening', 'night', 'weekend', 'weekday'].map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <Checkbox
                          id={time}
                          checked={timePreferences.includes(time)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTimePreferences([...timePreferences, time]);
                            } else {
                              setTimePreferences(timePreferences.filter(t => t !== time));
                            }
                          }}
                        />
                        <Label htmlFor={time} className="capitalize">{time}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Engagement History</Label>
                  <Select value={engagementHistory} onValueChange={(value) => setEngagementHistory(value as typeof engagementHistory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engagement level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="high">High Engagement</SelectItem>
                      <SelectItem value="medium">Medium Engagement</SelectItem>
                      <SelectItem value="low">Low Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <span>Segment Preview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{segmentName || 'Untitled Segment'}</h4>
                        <div className="text-2xl font-bold text-primary flex items-center space-x-2">
                          <TrendingUp className="h-6 w-6" />
                          <span>{calculateEstimatedReach().toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Estimated Reach</p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium mb-1">Demographics</h5>
                          <p>Age: {ageRange[0]}-{ageRange[1]}</p>
                          <p>Gender: {gender}</p>
                          <p>Interests: {interests.length} selected</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">Location</h5>
                          <p>Radius: {radiusKm[0]} km</p>
                          <p>Cities: {cities.length} selected</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">Behavior</h5>
                          <p>Devices: {deviceTypes.length} types</p>
                          <p>Times: {timePreferences.length} preferences</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-1">Engagement</h5>
                          <p>Level: {engagementHistory}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={saveSegment}>
                <Save className="h-4 w-4 mr-2" />
                {editingSegment ? 'Update' : 'Create'} Segment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Segments */}
      <div className="space-y-4">
        {segments.length === 0 && !isCreating ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Audience Segments</h3>
              <p className="text-muted-foreground mb-4">
                Create your first audience segment to start targeting specific demographics
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </CardContent>
          </Card>
        ) : (
          segments.map((segment) => (
            <Card key={segment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{segment.name}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{segment.demographics.age_min}-{segment.demographics.age_max} years</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{segment.location.radius_km}km radius</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{segment.behavior.device_types.length} devices</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{segment.estimated_reach.toLocaleString()} reach</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editSegment(segment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSegment(segment.id!)}
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

export default AudienceTargeting;
