import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Users, Eye, Target, Download } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AnalyticsRole = 'advertiser' | 'broadcaster' | 'admin';

interface AnalyticsDashboardProps {
  role: AnalyticsRole;
  userId: string;
  campaignId?: string;
}

// A unified data structure for all analytics data
interface AnalyticsData {
    // Common metrics
    impressions?: number;
    views?: number;
    clicks?: number;
    ctr?: number;
    conversions?: number;

    // Broadcaster specific
    engagementRate?: number;
    topPerformingScreen?: string;
    peakHour?: number;

    // Advertiser specific
    reach?: number;
    demographics?: any[]; // Simplified for now
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ role, userId, campaignId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const { data: responseData, error } = await supabase.functions.invoke('get-analytics-data', {
                    body: { role, userId, campaignId }
                });

                if (error) throw error;

                setData(responseData.summary);
                setTimeSeriesData(responseData.timeSeries);

            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
                toast({
                    title: "Error",
                    description: "Could not load analytics data.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [role, userId, campaignId, toast]);

    if (loading) {
        return <div>Loading analytics...</div>;
    }

    if (!data) {
        return <div>No analytics data available.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Advanced Analytics</h2>
                    <p className="text-muted-foreground">
                        {role === 'advertiser' && "Deep insights into your advertising performance"}
                        {role === 'broadcaster' && "Deep insights into your campaign performance"}
                        {role === 'admin' && "Platform-wide analytics overview"}
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Key Metrics - Conditionally rendered based on role */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {role === 'advertiser' && (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.impressions?.toLocaleString() ?? 'N/A'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.ctr?.toFixed(2) ?? 'N/A'}%</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.conversions?.toLocaleString() ?? 'N/A'}</div>
                            </CardContent>
                        </Card>
                    </>
                )}
                {role === 'broadcaster' && (
                     <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.views?.toLocaleString() ?? 'N/A'}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.engagementRate?.toFixed(2) ?? 'N/A'}%</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Top Screen</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data.topPerformingScreen ?? 'N/A'}</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Charts and Tabs would go here, also conditionally rendered */}
        </div>
    );
};
