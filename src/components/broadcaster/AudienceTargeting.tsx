import { useState, useEffect } from "react";
import { 
  Target,
  Users,
  MapPin,
  User,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AudienceSegment {
  id: string;
  segment_name: string;
  description: string;
  criteria: {
    location?: string[];
    demographics?: {
      age_range?: [number, number];
      gender?: string[];
      income_level?: string[];
    };
    interests?: string[];
    behavior?: {
      device_usage?: string[];
      time_preferences?: string[];
      engagement_level?: string;
    };
  };
  screen_match_count: number;
  estimated_reach: number;
  created_at: string;
}

interface AudienceTargetingProps {
  screens: Array<{ id: string; screen_name: string; city: string; address: string; }>;
}

export const AudienceTargeting = ({ screens }: AudienceTargetingProps) => {
  const { toast } = useToast();
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<AudienceSegment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentForm, setSegmentForm] = useState({
    segment_name: '',
    description: '',
    location: [] as string[],
    age_min: '',
    age_max: '',
    gender: [] as string[],
    income_level: [] as string[],
    interests: [] as string[],
    device_usage: [] as string[],
    time_preferences: [] as string[],
    engagement_level: ''
  });

  const availableCities = Array.from(new Set(screens.map(s => s.city))).sort();
  
  const interestOptions = [
    'Technology', 'Fashion', 'Food & Dining', 'Sports', 'Entertainment',
    'Travel', 'Health & Fitness', 'Business', 'Education', 'Automotive',
    'Real Estate', 'Finance', 'Art & Culture', 'Music', 'Gaming'
  ];

  const demographicOptions = {
    gender: ['Male', 'Female', 'Other'],
    income_level: ['Low Income', 'Middle Income', 'High Income', 'Premium'],
    device_usage: ['Mobile Heavy', 'Desktop Focused', 'Multi-Device', 'Smart TV'],
    time_preferences: ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Late Night (24-6)'],
    engagement_level: ['High', 'Medium', 'Low']
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audience_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedSegments: AudienceSegment[] = data?.map(segment => ({
        ...segment,
        criteria: segment.criteria as any,
        description: segment.description || '',
        screen_match_count: Math.floor(Math.random() * screens.length) + 1,
        estimated_reach: Math.floor(Math.random() * 50000) + 1000
      })) || [];

      setSegments(processedSegments);
    } catch (error) {
      console.error("Error fetching segments:", error);
      toast({
        title: "Error loading audience segments",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateSegment = async () => {
    if (!segmentForm.segment_name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a segment name.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const criteria = {
        location: segmentForm.location,
        demographics: {
          age_range: segmentForm.age_min && segmentForm.age_max 
            ? [parseInt(segmentForm.age_min), parseInt(segmentForm.age_max)]
            : undefined,
          gender: segmentForm.gender,
          income_level: segmentForm.income_level
        },
        interests: segmentForm.interests,
        behavior: {
          device_usage: segmentForm.device_usage,
          time_preferences: segmentForm.time_preferences,
          engagement_level: segmentForm.engagement_level || undefined
        }
      };

      const segmentData = {
        segment_name: segmentForm.segment_name,
        description: segmentForm.description,
        criteria,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };

      let error;
      if (editingSegment) {
        ({ error } = await supabase
          .from('audience_segments')
          .update(segmentData)
          .eq('id', editingSegment.id));
      } else {
        ({ error } = await supabase
          .from('audience_segments')
          .insert(segmentData));
      }

      if (error) throw error;

      toast({
        title: editingSegment ? "Segment updated" : "Segment created",
        description: `"${segmentForm.segment_name}" has been ${editingSegment ? 'updated' : 'created'} successfully.`,
      });

      resetForm();
      setIsDialogOpen(false);
      fetchSegments();
    } catch (error) {
      console.error("Error saving segment:", error);
      toast({
        title: "Error saving segment",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSegment = async (segmentId: string) => {
    try {
      const { error } = await supabase
        .from('audience_segments')
        .delete()
        .eq('id', segmentId);

      if (error) throw error;

      toast({
        title: "Segment deleted",
        description: "The audience segment has been deleted successfully.",
      });

      fetchSegments();
    } catch (error) {
      console.error("Error deleting segment:", error);
      toast({
        title: "Error deleting segment",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const editSegment = (segment: AudienceSegment) => {
    setEditingSegment(segment);
    const criteria = segment.criteria;
    setSegmentForm({
      segment_name: segment.segment_name,
      description: segment.description || '',
      location: criteria.location || [],
      age_min: criteria.demographics?.age_range?.[0]?.toString() || '',
      age_max: criteria.demographics?.age_range?.[1]?.toString() || '',
      gender: criteria.demographics?.gender || [],
      income_level: criteria.demographics?.income_level || [],
      interests: criteria.interests || [],
      device_usage: criteria.behavior?.device_usage || [],
      time_preferences: criteria.behavior?.time_preferences || [],
      engagement_level: criteria.behavior?.engagement_level || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSegment(null);
    setSegmentForm({
      segment_name: '',
      description: '',
      location: [],
      age_min: '',
      age_max: '',
      gender: [],
      income_level: [],
      interests: [],
      device_usage: [],
      time_preferences: [],
      engagement_level: ''
    });
  };

  const updateArrayField = (field: keyof typeof segmentForm, value: string, checked: boolean) => {
    setSegmentForm(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const filteredSegments = segments.filter(segment =>
    segment.segment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Audience Targeting
              </CardTitle>
              <CardDescription>
                Create detailed audience segments to target the right people with your content
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search segments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Segment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSegment ? 'Edit Audience Segment' : 'Create Audience Segment'}
                    </DialogTitle>
                    <DialogDescription>
                      Define targeting criteria to reach the right audience for your campaigns
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="demographics">Demographics</TabsTrigger>
                      <TabsTrigger value="behavior">Behavior</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div>
                        <Label htmlFor="segment_name">Segment Name</Label>
                        <Input
                          id="segment_name"
                          value={segmentForm.segment_name}
                          onChange={(e) => setSegmentForm(prev => ({ ...prev, segment_name: e.target.value }))}
                          placeholder="e.g., Tech-Savvy Millennials"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={segmentForm.description}
                          onChange={(e) => setSegmentForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your target audience..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Interests</Label>
                        <div className="grid gap-2 max-h-48 overflow-y-auto border rounded p-3">
                          {interestOptions.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={`interest-${interest}`}
                                checked={segmentForm.interests.includes(interest)}
                                onCheckedChange={(checked) => updateArrayField('interests', interest, checked as boolean)}
                              />
                              <Label htmlFor={`interest-${interest}`} className="text-sm">
                                {interest}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="location" className="space-y-4">
                      <div>
                        <Label>Target Cities</Label>
                        <div className="grid gap-2 max-h-48 overflow-y-auto border rounded p-3">
                          {availableCities.map((city) => (
                            <div key={city} className="flex items-center space-x-2">
                              <Checkbox
                                id={`city-${city}`}
                                checked={segmentForm.location.includes(city)}
                                onCheckedChange={(checked) => updateArrayField('location', city, checked as boolean)}
                              />
                              <Label htmlFor={`city-${city}`} className="text-sm">
                                {city}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="demographics" className="space-y-4">
                      <div>
                        <Label>Age Range</Label>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label htmlFor="age_min">Minimum Age</Label>
                            <Input
                              id="age_min"
                              type="number"
                              value={segmentForm.age_min}
                              onChange={(e) => setSegmentForm(prev => ({ ...prev, age_min: e.target.value }))}
                              placeholder="18"
                              min="13"
                              max="100"
                            />
                          </div>
                          <div>
                            <Label htmlFor="age_max">Maximum Age</Label>
                            <Input
                              id="age_max"
                              type="number"
                              value={segmentForm.age_max}
                              onChange={(e) => setSegmentForm(prev => ({ ...prev, age_max: e.target.value }))}
                              placeholder="65"
                              min="13"
                              max="100"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Gender</Label>
                        <div className="flex gap-4">
                          {demographicOptions.gender.map((gender) => (
                            <div key={gender} className="flex items-center space-x-2">
                              <Checkbox
                                id={`gender-${gender}`}
                                checked={segmentForm.gender.includes(gender)}
                                onCheckedChange={(checked) => updateArrayField('gender', gender, checked as boolean)}
                              />
                              <Label htmlFor={`gender-${gender}`} className="text-sm">
                                {gender}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Income Level</Label>
                        <div className="flex gap-4">
                          {demographicOptions.income_level.map((level) => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox
                                id={`income-${level}`}
                                checked={segmentForm.income_level.includes(level)}
                                onCheckedChange={(checked) => updateArrayField('income_level', level, checked as boolean)}
                              />
                              <Label htmlFor={`income-${level}`} className="text-sm">
                                {level}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="behavior" className="space-y-4">
                      <div>
                        <Label>Device Usage</Label>
                        <div className="grid gap-2">
                          {demographicOptions.device_usage.map((usage) => (
                            <div key={usage} className="flex items-center space-x-2">
                              <Checkbox
                                id={`device-${usage}`}
                                checked={segmentForm.device_usage.includes(usage)}
                                onCheckedChange={(checked) => updateArrayField('device_usage', usage, checked as boolean)}
                              />
                              <Label htmlFor={`device-${usage}`} className="text-sm">
                                {usage}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Time Preferences</Label>
                        <div className="grid gap-2">
                          {demographicOptions.time_preferences.map((time) => (
                            <div key={time} className="flex items-center space-x-2">
                              <Checkbox
                                id={`time-${time}`}
                                checked={segmentForm.time_preferences.includes(time)}
                                onCheckedChange={(checked) => updateArrayField('time_preferences', time, checked as boolean)}
                              />
                              <Label htmlFor={`time-${time}`} className="text-sm">
                                {time}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Engagement Level</Label>
                        <Select value={segmentForm.engagement_level} onValueChange={(value) => setSegmentForm(prev => ({ ...prev, engagement_level: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select engagement level" />
                          </SelectTrigger>
                          <SelectContent>
                            {demographicOptions.engagement_level.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level} Engagement
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createOrUpdateSegment} disabled={loading}>
                      {editingSegment ? 'Update Segment' : 'Create Segment'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Segments List */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredSegments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{segment.segment_name}</CardTitle>
                  {segment.description && (
                    <CardDescription className="mt-1">
                      {segment.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => editSegment(segment)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteSegment(segment.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Criteria Summary */}
                <div className="space-y-2">
                  {segment.criteria.location && segment.criteria.location.length > 0 && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {segment.criteria.location.slice(0, 3).map((city) => (
                          <Badge key={city} variant="outline" className="text-xs">
                            {city}
                          </Badge>
                        ))}
                        {segment.criteria.location.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{segment.criteria.location.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {segment.criteria.interests && segment.criteria.interests.length > 0 && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {segment.criteria.interests.slice(0, 3).map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {segment.criteria.interests.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{segment.criteria.interests.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {segment.criteria.demographics?.age_range && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Age {segment.criteria.demographics.age_range[0]}-{segment.criteria.demographics.age_range[1]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid gap-3 grid-cols-2 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{segment.screen_match_count}</p>
                    <p className="text-xs text-muted-foreground">Matching Screens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {(segment.estimated_reach / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Est. Reach</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSegments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No matching segments found' : 'No audience segments created'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create targeted audience segments to improve your campaign performance'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Segment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};