import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Target, TrendingUp, Users, Brain, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function AdvancedAdvertising() {
  const { toast } = useToast();
  const [campaign, setCampaign] = useState({
    name: '',
    budget: '',
    targetAudience: '',
    duration: '',
    autoOptimize: false
  });

  const handleCreateCampaign = () => {
    toast({
      title: "Campaign Created",
      description: `Advanced advertising campaign "${campaign.name}" has been created successfully.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Advertising</h2>
          <p className="text-muted-foreground">AI-powered advertising campaigns and audience targeting</p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          <Brain className="h-4 w-4 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Smart Campaigns</TabsTrigger>
          <TabsTrigger value="targeting">Audience Targeting</TabsTrigger>
          <TabsTrigger value="optimization">Auto-Optimization</TabsTrigger>
          <TabsTrigger value="marketplace">Ad Marketplace</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Smart Campaign Builder
              </CardTitle>
              <CardDescription>
                Create AI-optimized advertising campaigns that automatically adjust for maximum ROI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input
                    id="campaignName"
                    value={campaign.name}
                    onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Holiday Promotion 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget</Label>
                  <Input
                    id="budget"
                    value={campaign.budget}
                    onChange={(e) => setCampaign(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="$5,000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target demographic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="young-professionals">Young Professionals (25-35)</SelectItem>
                    <SelectItem value="families">Families with Children</SelectItem>
                    <SelectItem value="seniors">Senior Citizens (55+)</SelectItem>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="custom">Custom Audience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Campaign Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="2-weeks">2 Weeks</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="3-months">3 Months</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={campaign.autoOptimize}
                  onCheckedChange={(checked) => 
                    setCampaign(prev => ({ ...prev, autoOptimize: checked }))
                  }
                />
                <Label>Enable AI Auto-Optimization</Label>
              </div>

              <Button onClick={handleCreateCampaign} className="w-full">
                Create Smart Campaign
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">12</div>
                <p className="text-sm text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">145K</div>
                <p className="text-sm text-muted-foreground">Impressions this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">285%</div>
                <p className="text-sm text-muted-foreground">Return on ad spend</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targeting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Advanced Audience Targeting
              </CardTitle>
              <CardDescription>
                Use AI to target the most relevant audiences for your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Demographic Targeting</h4>
                      <p className="text-sm text-muted-foreground">Age, gender, income, education</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Behavioral Targeting</h4>
                      <p className="text-sm text-muted-foreground">Shopping habits, interests, device usage</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Geographic Targeting</h4>
                      <p className="text-sm text-muted-foreground">Location-based audience selection</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Temporal Targeting</h4>
                      <p className="text-sm text-muted-foreground">Time-of-day and seasonal preferences</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Auto-Optimization
              </CardTitle>
              <CardDescription>
                Let AI automatically optimize your campaigns for better performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Budget Optimization</h4>
                    <p className="text-sm text-muted-foreground">Automatically adjust budget allocation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Audience Optimization</h4>
                    <p className="text-sm text-muted-foreground">Find the best performing audience segments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Creative Optimization</h4>
                    <p className="text-sm text-muted-foreground">Test and optimize ad creatives automatically</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Scheduling Optimization</h4>
                    <p className="text-sm text-muted-foreground">Optimize display times for maximum impact</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Card className="p-4 bg-primary/5">
                <h4 className="font-semibold mb-2">Optimization Results</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">+45%</div>
                    <div className="text-sm text-muted-foreground">CTR Improvement</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">-32%</div>
                    <div className="text-sm text-muted-foreground">Cost Reduction</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">+78%</div>
                    <div className="text-sm text-muted-foreground">ROI Increase</div>
                  </div>
                </div>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ad Marketplace
              </CardTitle>
              <CardDescription>
                Buy and sell premium advertising slots in a marketplace environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Premium Times Square Slot</h4>
                      <p className="text-sm text-muted-foreground">
                        High-traffic location • 50,000 daily impressions
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>Prime Time</Badge>
                        <Badge variant="outline">High Traffic</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">$2,500</div>
                      <div className="text-sm text-muted-foreground">per week</div>
                      <Button className="mt-2">Bid Now</Button>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Shopping Mall Network</h4>
                      <p className="text-sm text-muted-foreground">
                        25 screens across 5 malls • 125,000 weekly reach
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>Network Deal</Badge>
                        <Badge variant="outline">Retail Focused</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">$8,900</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                      <Button className="mt-2">Bid Now</Button>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}