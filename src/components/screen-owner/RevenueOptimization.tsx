import { useState, useEffect } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  Lightbulb,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RevenueRecommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string;
  potential_revenue_increase: number;
  confidence_score: number;
  implemented: boolean;
  created_at: string;
  expires_at: string;
}

interface PricingAnalytics {
  hour: number;
  average_price: number;
  booking_count: number;
  revenue: number;
  demand_score: number;
  suggested_price: number;
}

interface ScreenData {
  id: string;
  screen_name: string;
  price_per_hour: number;
  revenue_this_month: number;
  occupancy_rate: number;
}

interface RevenueOptimizationProps {
  screens: ScreenData[];
}

export const RevenueOptimization = ({ screens }: RevenueOptimizationProps) => {
  const { toast } = useToast();
  const [selectedScreen, setSelectedScreen] = useState<string>("");
  const [recommendations, setRecommendations] = useState<RevenueRecommendation[]>([]);
  const [pricingAnalytics, setPricingAnalytics] = useState<PricingAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (screens.length > 0 && !selectedScreen) {
      setSelectedScreen(screens[0].id);
    }
  }, [screens, selectedScreen]);

  useEffect(() => {
    if (selectedScreen) {
      fetchRevenueData();
    }
  }, [selectedScreen]);

  const fetchRevenueData = async () => {
    if (!selectedScreen) return;
    
    setLoading(true);
    try {
      // Fetch recommendations
      const { data: recommendationsData, error: recError } = await supabase
        .from('revenue_recommendations')
        .select('*')
        .eq('screen_id', selectedScreen)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (recError) throw recError;

      // Fetch pricing analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('pricing_analytics')
        .select('*')
        .eq('screen_id', selectedScreen)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('hour');

      if (analyticsError) throw analyticsError;

      setRecommendations(recommendationsData || []);
      
      // Process analytics data for hourly view
      const hourlyAnalytics = Array.from({ length: 24 }, (_, hour) => {
        const hourData = analyticsData?.filter(d => d.hour === hour) || [];
        const avgRevenue = hourData.length > 0 
          ? hourData.reduce((sum, d) => sum + d.revenue, 0) / hourData.length 
          : 0;
        const avgDemand = hourData.length > 0 
          ? hourData.reduce((sum, d) => sum + d.demand_score, 0) / hourData.length 
          : 0;
        const avgPrice = hourData.length > 0 
          ? hourData.reduce((sum, d) => sum + d.average_price, 0) / hourData.length 
          : 0;
        const totalBookings = hourData.reduce((sum, d) => sum + d.booking_count, 0);

        return {
          hour,
          average_price: avgPrice,
          booking_count: totalBookings,
          revenue: avgRevenue,
          demand_score: avgDemand,
          suggested_price: avgPrice * (1 + (avgDemand - 0.5) * 0.3) // Simple suggestion logic
        };
      });

      setPricingAnalytics(hourlyAnalytics);

    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast({
        title: "Error loading revenue data",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedScreen) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('calculate_pricing_recommendations', {
        target_screen_id: selectedScreen
      });

      if (error) throw error;

      toast({
        title: "Recommendations generated",
        description: "New pricing recommendations have been created.",
      });
      
      fetchRevenueData();
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error generating recommendations",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const implementRecommendation = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('revenue_recommendations')
        .update({ implemented: true })
        .eq('id', recommendationId);

      if (error) throw error;

      toast({
        title: "Recommendation implemented",
        description: "The recommendation has been marked as implemented.",
      });

      fetchRevenueData();
    } catch (error) {
      console.error("Error implementing recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to update recommendation.",
        variant: "destructive"
      });
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'price_increase':
        return <TrendingUp className="h-5 w-5" />;
      case 'peak_hours':
        return <Clock className="h-5 w-5" />;
      case 'promotional':
        return <Target className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'price_increase':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'peak_hours':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'promotional':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const peakHours = pricingAnalytics
    .filter(p => p.demand_score > 0.7)
    .sort((a, b) => b.demand_score - a.demand_score)
    .slice(0, 6);

  const currentScreen = screens.find(s => s.id === selectedScreen);

  return (
    <div className="space-y-6">
      {/* Screen Selection */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Optimization
              </CardTitle>
              <CardDescription>
                AI-powered pricing recommendations and demand analytics
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select screen" />
                </SelectTrigger>
                <SelectContent>
                  {screens.map((screen) => (
                    <SelectItem key={screen.id} value={screen.id}>
                      {screen.screen_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={generateRecommendations} disabled={loading || !selectedScreen}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate AI Recommendations
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {currentScreen && (
        <>
          {/* Current Performance Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Rate</p>
                    <p className="text-2xl font-bold">${(currentScreen.price_per_hour / 100).toFixed(0)}/hr</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${(currentScreen.revenue_this_month / 100).toFixed(0)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                    <p className="text-2xl font-bold">{currentScreen.occupancy_rate.toFixed(0)}%</p>
                    <Progress value={currentScreen.occupancy_rate} className="mt-2 h-2" />
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Optimize your pricing strategy with data-driven insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getRecommendationColor(rec.recommendation_type)}`}>
                            {getRecommendationIcon(rec.recommendation_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <Badge variant="outline">
                                {(rec.confidence_score * 100).toFixed(0)}% confidence
                              </Badge>
                              {rec.implemented && (
                                <Badge variant="default" className="bg-emerald-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Implemented
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-2">{rec.description}</p>
                            {rec.potential_revenue_increase && (
                              <p className="text-sm font-medium text-emerald-600">
                                Potential increase: +${(rec.potential_revenue_increase / 100).toFixed(0)}/month
                              </p>
                            )}
                          </div>
                        </div>
                        {!rec.implemented && (
                          <Button
                            size="sm"
                            onClick={() => implementRecommendation(rec.id)}
                            className="ml-4"
                          >
                            Implement
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI-powered recommendations based on your screen's performance data
                  </p>
                  <Button onClick={generateRecommendations} disabled={loading}>
                    Generate Recommendations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Peak Hours Analysis */}
          {peakHours.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Peak Hours Analysis
                </CardTitle>
                <CardDescription>
                  Optimize pricing during high-demand periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {peakHours.map((peak) => (
                    <div key={peak.hour} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{formatHour(peak.hour)}</span>
                        <Badge variant="secondary">
                          {(peak.demand_score * 100).toFixed(0)}% demand
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current rate:</span>
                          <span>${(peak.average_price / 100).toFixed(0)}/hr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Suggested rate:</span>
                          <span className="font-medium text-emerald-600">
                            ${(peak.suggested_price / 100).toFixed(0)}/hr
                          </span>
                        </div>
                        <Progress value={peak.demand_score * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hourly Demand Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                24-Hour Demand Pattern
              </CardTitle>
              <CardDescription>
                Visualize demand patterns throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2 lg:grid-cols-12">
                {pricingAnalytics.map((analytics) => (
                  <div
                    key={analytics.hour}
                    className="text-center p-2 rounded border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-xs font-medium mb-1">
                      {formatHour(analytics.hour)}
                    </div>
                    <div
                      className={`h-8 rounded mb-1 ${
                        analytics.demand_score > 0.7
                          ? 'bg-red-500'
                          : analytics.demand_score > 0.4
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{ opacity: Math.max(0.2, analytics.demand_score) }}
                    />
                    <div className="text-xs text-muted-foreground">
                      {(analytics.demand_score * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Low demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span>Medium demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>High demand</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};