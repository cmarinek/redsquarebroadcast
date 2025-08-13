import { useState, useEffect } from "react";
import { Plus, PlayCircle, PauseCircle, BarChart3, Target, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface ABTestCampaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date: string;
  end_date: string;
  traffic_split: { variant_a: number; variant_b: number };
  target_metric: string;
  confidence_level: number;
  created_at: string;
}

interface ABTestResult {
  variant_id: string;
  variant_name: string;
  views: number;
  impressions: number;
  engagement_rate: number;
  click_through_rate: number;
  conversion_rate: number;
}

export const ABTestingTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<ABTestCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [results, setResults] = useState<ABTestResult[]>([]);

  // New campaign form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_metric: 'engagement_rate',
    confidence_level: 95,
    traffic_split_a: 50,
    traffic_split_b: 50
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ab_test_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error loading campaigns",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (campaignId: string) => {
    try {
      // Mock results for now - in production this would come from analytics
      const mockResults: ABTestResult[] = [
        {
          variant_id: 'a',
          variant_name: 'Variant A',
          views: 2340,
          impressions: 12500,
          engagement_rate: 8.4,
          click_through_rate: 3.2,
          conversion_rate: 1.8
        },
        {
          variant_id: 'b',
          variant_name: 'Variant B',
          views: 2180,
          impressions: 11800,
          engagement_rate: 9.1,
          click_through_rate: 3.8,
          conversion_rate: 2.1
        }
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const createCampaign = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ab_test_campaigns')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          target_metric: formData.target_metric,
          confidence_level: formData.confidence_level,
          traffic_split: {
            variant_a: formData.traffic_split_a,
            variant_b: formData.traffic_split_b
          }
        });

      if (error) throw error;

      toast({
        title: "A/B Test Created",
        description: "Your campaign has been created successfully."
      });

      setShowCreateDialog(false);
      fetchCampaigns();
      resetForm();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error creating campaign",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('ab_test_campaigns')
        .update({ status })
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Updated",
        description: `Campaign ${status === 'active' ? 'started' : 'paused'} successfully.`
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error updating campaign",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      target_metric: 'engagement_rate',
      confidence_level: 95,
      traffic_split_a: 50,
      traffic_split_b: 50
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.draft}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getWinner = () => {
    if (results.length < 2) return null;
    
    const [variantA, variantB] = results;
    const metricA = variantA.conversion_rate;
    const metricB = variantB.conversion_rate;
    
    if (Math.abs(metricA - metricB) < 0.5) return 'tie';
    return metricA > metricB ? 'a' : 'b';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                A/B Testing Tools
              </CardTitle>
              <CardDescription>
                Create and analyze split tests to optimize your campaigns
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New A/B Test
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create A/B Test Campaign</DialogTitle>
                  <DialogDescription>
                    Set up a new split test to compare different variations of your content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Holiday Promotion A/B Test"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Testing different call-to-action buttons..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="target_metric">Target Metric</Label>
                    <Select value={formData.target_metric} onValueChange={(value) => setFormData(prev => ({ ...prev, target_metric: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engagement_rate">Engagement Rate</SelectItem>
                        <SelectItem value="click_through_rate">Click-Through Rate</SelectItem>
                        <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                        <SelectItem value="views">Total Views</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="traffic_split_a">Variant A (%)</Label>
                      <Input
                        id="traffic_split_a"
                        type="number"
                        min="1"
                        max="99"
                        value={formData.traffic_split_a}
                        onChange={(e) => {
                          const valueA = parseInt(e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            traffic_split_a: valueA,
                            traffic_split_b: 100 - valueA
                          }));
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="traffic_split_b">Variant B (%)</Label>
                      <Input
                        id="traffic_split_b"
                        type="number"
                        value={formData.traffic_split_b}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createCampaign} disabled={!formData.name || !formData.start_date || !formData.end_date}>
                      Create Campaign
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Metric</TableHead>
                <TableHead>Traffic Split</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell className="capitalize">{campaign.target_metric.replace('_', ' ')}</TableCell>
                  <TableCell>
                    {campaign.traffic_split.variant_a}% / {campaign.traffic_split.variant_b}%
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(campaign.start_date), 'MMM dd')}</div>
                      <div>{format(new Date(campaign.end_date), 'MMM dd')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {campaign.status === 'draft' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCampaignStatus(campaign.id, 'active')}
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {campaign.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                        >
                          <PauseCircle className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCampaign(campaign.id);
                          fetchResults(campaign.id);
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Results
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {campaigns.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No A/B tests created yet</p>
              <p className="text-sm text-muted-foreground">Create your first test to start optimizing your campaigns</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {selectedCampaign && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription>
              Performance comparison between variants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {results.map((result, index) => {
                const isWinner = getWinner();
                const variantLetter = result.variant_id;
                const isWinning = isWinner === variantLetter;
                
                return (
                  <div key={result.variant_id} className={`p-4 border rounded-lg ${isWinning ? 'border-emerald-200 bg-emerald-50' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{result.variant_name}</h3>
                      {isWinning && (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          Winner
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Views</span>
                        <span className="font-medium">{result.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Impressions</span>
                        <span className="font-medium">{result.impressions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Engagement Rate</span>
                        <span className="font-medium">{result.engagement_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Click-Through Rate</span>
                        <span className="font-medium">{result.click_through_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Conversion Rate</span>
                        <span className="font-medium">{result.conversion_rate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {getWinner() === 'tie' && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-600" />
                  <p className="text-yellow-800 font-medium">Inconclusive Results</p>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  The difference between variants is too small to determine a clear winner. Consider running the test longer or increasing traffic.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};