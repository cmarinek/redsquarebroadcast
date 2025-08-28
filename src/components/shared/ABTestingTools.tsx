import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Play, Pause, BarChart3, Target, Edit, Trash2, PlayCircle, PauseCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

type ABTestingRole = 'advertiser' | 'broadcaster';

interface ABTestingToolsProps {
  role: ABTestingRole;
}

// Unified data structures
interface ABTestCampaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'active';
  target_metric: string;
  start_date: string;
  end_date: string;
  variants?: ABTestVariant[];
}

interface ABTestVariant {
  id: string;
  variant_name: string;
  content_upload_id: string;
}

export const ABTestingTools: React.FC<ABTestingToolsProps> = ({ role }) => {
  const [campaigns, setCampaigns] = useState<ABTestCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-ab-test-campaigns', {
        body: { role, userId: user.id }
      });
      if (error) throw error;
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error("Error fetching A/B test campaigns:", err);
      toast({
        title: "Error",
        description: "Could not load A/B test campaigns.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [role, user, toast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (loading) {
    return <div>Loading A/B testing tools...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                A/B Testing Tools
              </CardTitle>
              <CardDescription>
                Create and analyze split tests to optimize your campaigns.
              </CardDescription>
            </div>
            {/* The creation dialog would be conditionally rendered here */}
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New A/B Test
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No A/B Tests Yet</h3>
              <p className="text-muted-foreground">
                Create your first test to start optimizing.
              </p>
            </div>
          ) : (
            <>
              {role === 'advertiser' && <AdvertiserCampaignView campaigns={campaigns} />}
              {role === 'broadcaster' && <BroadcasterCampaignView campaigns={campaigns} />}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// --- Advertiser-specific view ---
const AdvertiserCampaignView = ({ campaigns }: { campaigns: ABTestCampaign[] }) => (
    <div className="space-y-4">
        {campaigns.map((campaign) => (
            <Card key={campaign.id} className="p-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{campaign.name}</h4>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{campaign.description}</p>
            </Card>
        ))}
    </div>
);


// --- Broadcaster-specific view ---
const BroadcasterCampaignView = ({ campaigns }: { campaigns: ABTestCampaign[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Target Metric</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell><Badge variant="secondary">{campaign.status}</Badge></TableCell>
                    <TableCell>{campaign.target_metric}</TableCell>
                    <TableCell>
                        <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Results
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);
