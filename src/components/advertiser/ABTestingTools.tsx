import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Play, 
  Pause, 
  BarChart3, 
  Target,
  TrendingUp,
  Eye,
  MousePointer,
  Users,
  Calendar,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface ABTestCampaign {
  id?: string;
  name: string;
  description: string;
  target_metric: 'engagement_rate' | 'click_through_rate' | 'conversion_rate';
  status: 'draft' | 'running' | 'completed' | 'paused';
  start_date: string;
  end_date: string;
  confidence_level: number;
  traffic_split: {
    variant_a: number;
    variant_b: number;
  };
  variants: ABTestVariant[];
}

interface ABTestVariant {
  id?: string;
  variant_name: string;
  content_upload_id: string;
  allocation_percentage: number;
}

interface ABTestResult {
  variant_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  engagement_rate: number;
  click_through_rate: number;
  conversion_rate: number;
}

export const ABTestingTools = () => {
  const [campaigns, setCampaigns] = useState<ABTestCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<ABTestCampaign | null>(null);
  const [contentUploads, setContentUploads] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [targetMetric, setTargetMetric] = useState<'engagement_rate' | 'click_through_rate' | 'conversion_rate'>('engagement_rate');
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [trafficSplit, setTrafficSplit] = useState({ variant_a: 50, variant_b: 50 });
  const [variantAContent, setVariantAContent] = useState("");
  const [variantBContent, setVariantBContent] = useState("");

  useEffect(() => {
    fetchCampaigns();
    fetchContentUploads();
  }, []);

  const fetchCampaigns = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ab_test_campaigns')
        .select(`
          *,
          ab_test_variants (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching A/B test campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load A/B test campaigns",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContentUploads = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('content_uploads')
        .select('id, file_name, file_type')
        .eq('user_id', user.id)
        .eq('moderation_status', 'approved');

      if (error) throw error;
      setContentUploads(data || []);
    } catch (error) {
      console.error('Error fetching content uploads:', error);
    }
  };

  const createOrUpdateCampaign = async () => {
    if (!user || !campaignName || !variantAContent || !variantBContent) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const campaignData = {
        name: campaignName,
        description,
        target_metric: targetMetric,
        start_date: startDate,
        end_date: endDate,
        confidence_level: confidenceLevel,
        traffic_split: trafficSplit,
        status: 'draft' as const,
        user_id: user.id
      };

      let campaignId;
      if (editingCampaign) {
        const { error } = await supabase
          .from('ab_test_campaigns')
          .update(campaignData)
          .eq('id', editingCampaign.id);
        
        if (error) throw error;
        campaignId = editingCampaign.id;
      } else {
        const { data, error } = await supabase
          .from('ab_test_campaigns')
          .insert([campaignData])
          .select()
          .single();
        
        if (error) throw error;
        campaignId = data.id;
      }

      // Create or update variants
      const variants = [
        {
          campaign_id: campaignId,
          variant_name: 'Variant A',
          content_upload_id: variantAContent,
          allocation_percentage: trafficSplit.variant_a
        },
        {
          campaign_id: campaignId,
          variant_name: 'Variant B',
          content_upload_id: variantBContent,
          allocation_percentage: trafficSplit.variant_b
        }
      ];

      if (editingCampaign) {
        // Delete existing variants and create new ones
        await supabase
          .from('ab_test_variants')
          .delete()
          .eq('campaign_id', campaignId);
      }

      const { error: variantsError } = await supabase
        .from('ab_test_variants')
        .insert(variants);

      if (variantsError) throw variantsError;

      toast({
        title: "Success",
        description: `A/B test campaign ${editingCampaign ? 'updated' : 'created'} successfully`
      });

      resetForm();
      setDialogOpen(false);
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving A/B test campaign:', error);
      toast({
        title: "Error",
        description: "Failed to save A/B test campaign",
        variant: "destructive"
      });
    }
  };

  const toggleCampaignStatus = async (campaign: ABTestCampaign) => {
    try {
      const newStatus = campaign.status === 'running' ? 'paused' : 'running';
      const { error } = await supabase
        .from('ab_test_campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Campaign ${newStatus === 'running' ? 'started' : 'paused'}`
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive"
      });
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('ab_test_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Deleted",
        description: "A/B test campaign has been removed"
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive"
      });
    }
  };

  const editCampaign = (campaign: ABTestCampaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.name);
    setDescription(campaign.description);
    setTargetMetric(campaign.target_metric);
    setStartDate(campaign.start_date);
    setEndDate(campaign.end_date);
    setConfidenceLevel(campaign.confidence_level);
    setTrafficSplit(campaign.traffic_split);
    
    if (campaign.variants && campaign.variants.length >= 2) {
      setVariantAContent(campaign.variants[0].content_upload_id);
      setVariantBContent(campaign.variants[1].content_upload_id);
    }
    
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCampaign(null);
    setCampaignName("");
    setDescription("");
    setTargetMetric('engagement_rate');
    setStartDate("");
    setEndDate("");
    setConfidenceLevel(95);
    setTrafficSplit({ variant_a: 50, variant_b: 50 });
    setVariantAContent("");
    setVariantBContent("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  // Sample performance data for charts
  const samplePerformanceData = [
    { day: 'Day 1', variant_a: 85, variant_b: 72 },
    { day: 'Day 2', variant_a: 90, variant_b: 78 },
    { day: 'Day 3', variant_a: 87, variant_b: 85 },
    { day: 'Day 4', variant_a: 92, variant_b: 89 },
    { day: 'Day 5', variant_a: 88, variant_b: 91 },
    { day: 'Day 6', variant_a: 95, variant_b: 88 },
    { day: 'Day 7', variant_a: 91, variant_b: 93 }
  ];

  if (loading) return <div>Loading A/B testing campaigns...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">A/B Testing Tools</h3>
          <p className="text-sm text-muted-foreground">
            Run controlled experiments to optimize your advertising performance
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create A/B Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? 'Edit' : 'Create'} A/B Test Campaign
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="target-metric">Target Metric</Label>
                  <Select value={targetMetric} onValueChange={(value) => setTargetMetric(value as typeof targetMetric)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engagement_rate">Engagement Rate</SelectItem>
                      <SelectItem value="click_through_rate">Click-Through Rate</SelectItem>
                      <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your test hypothesis"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence-level">Confidence Level: {confidenceLevel}%</Label>
                <Input
                  id="confidence-level"
                  type="range"
                  min="90"
                  max="99"
                  value={confidenceLevel}
                  onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Traffic Split</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Variant A: {trafficSplit.variant_a}%</Label>
                    <Select value={variantAContent} onValueChange={setVariantAContent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content for Variant A" />
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
                  
                  <div className="space-y-2">
                    <Label>Variant B: {trafficSplit.variant_b}%</Label>
                    <Select value={variantBContent} onValueChange={setVariantBContent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content for Variant B" />
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
                  <Label>Split Ratio</Label>
                  <Input
                    type="range"
                    min="10"
                    max="90"
                    value={trafficSplit.variant_a}
                    onChange={(e) => {
                      const variantA = Number(e.target.value);
                      setTrafficSplit({ variant_a: variantA, variant_b: 100 - variantA });
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createOrUpdateCampaign}>
                {editingCampaign ? 'Update' : 'Create'} Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Campaigns */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No A/B Tests Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first A/B test to optimize your advertising performance
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create A/B Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold">{campaign.name}</h4>
                      <Badge variant="secondary" className={`${getStatusColor(campaign.status)} text-white`}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1 capitalize">{campaign.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{campaign.target_metric.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(campaign.start_date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{campaign.confidence_level}% confidence</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>{campaign.traffic_split.variant_a}%/{campaign.traffic_split.variant_b}% split</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCampaignStatus(campaign)}
                      disabled={campaign.status === 'completed'}
                    >
                      {campaign.status === 'running' ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editCampaign(campaign)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCampaign(campaign.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {campaign.status === 'running' && (
                  <div className="mt-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={samplePerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="variant_a" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Variant A"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="variant_b" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Variant B"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};