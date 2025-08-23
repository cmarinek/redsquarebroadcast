import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BarChart3, TrendingUp, Users, Eye, Target, Download, Calendar, MapPin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  impressions: number;
  clicks: number;
  ctr: number;
  reach: number;
  engagement: number;
  conversions: number;
}

interface AdvancedAnalyticsDashboardProps {
  bookings?: Array<{
    id: string;
    screen: {
      screen_name: string;
    };
  }>;
}

export const AdvancedAnalyticsDashboard = ({ bookings = [] }: AdvancedAnalyticsDashboardProps) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    impressions: 25430,
    clicks: 1847,
    ctr: 7.3,
    reach: 18250,
    engagement: 12.4,
    conversions: 234
  });

  const [timeRange, setTimeRange] = useState("7d");
  const { toast } = useToast();

  // Sample data for charts
  const performanceData = [
    { date: '2024-01-01', impressions: 4500, clicks: 320, conversions: 28 },
    { date: '2024-01-02', impressions: 5200, clicks: 380, conversions: 35 },
    { date: '2024-01-03', impressions: 4800, clicks: 340, conversions: 31 },
    { date: '2024-01-04', impressions: 6100, clicks: 420, conversions: 42 },
    { date: '2024-01-05', impressions: 5800, clicks: 390, conversions: 38 },
    { date: '2024-01-06', impressions: 5500, clicks: 365, conversions: 33 },
    { date: '2024-01-07', impressions: 6200, clicks: 445, conversions: 41 }
  ];

  const screenPerformance = bookings.slice(0, 5).map((booking, index) => ({
    screen: booking.screen.screen_name,
    impressions: Math.floor(Math.random() * 5000) + 1000,
    ctr: Math.floor(Math.random() * 10) + 2,
    conversions: Math.floor(Math.random() * 50) + 10
  }));

  const demographicsData = [
    { name: '18-24', value: 25, color: '#3b82f6' },
    { name: '25-34', value: 35, color: '#10b981' },
    { name: '35-44', value: 22, color: '#f59e0b' },
    { name: '45-54', value: 12, color: '#ef4444' },
    { name: '55+', value: 6, color: '#8b5cf6' }
  ];

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Your analytics report is being prepared for download."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Deep insights into your advertising performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.ctr}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.conversions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.3%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="screens">Screen Analysis</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Track your advertising metrics across different time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Screens</CardTitle>
              <CardDescription>Compare performance across different screen locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {screenPerformance.map((screen, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{screen.screen}</p>
                        <p className="text-sm text-muted-foreground">{screen.impressions.toLocaleString()} impressions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{screen.ctr}% CTR</Badge>
                      <p className="text-sm text-muted-foreground mt-1">{screen.conversions} conversions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Demographics</CardTitle>
              <CardDescription>Understanding your audience composition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {demographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Automated recommendations to improve your advertising performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🎯 Optimization Opportunity</h4>
                  <p className="text-blue-800">Your ads perform 23% better during evening hours (6-9 PM). Consider increasing your budget allocation for these time slots.</p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">📍 Location Insight</h4>
                  <p className="text-green-800">Screens in downtown areas show 40% higher engagement rates. Prioritize premium locations for better ROI.</p>
                </div>
                
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">👥 Audience Recommendation</h4>
                  <p className="text-amber-800">25-34 age group shows highest conversion rates. Consider creating targeted content for this demographic.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};