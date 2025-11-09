import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Users, Calendar, Download, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { format } from "date-fns";

interface FinancialMetrics {
  totalRevenue: number;
  platformFees: number;
  ownerEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
  activeScreens: number;
  revenueGrowth: number;
}

interface PayoutRequest {
  id: string;
  screen_owner_id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at: string | null;
  owner_email: string;
  owner_name: string;
}

export default function AdminFinancials() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Fetch payments data
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount_cents, platform_fee_cents, owner_amount_cents, status");

      if (paymentsError) throw paymentsError;

      // Fetch payout requests with owner info
      const { data: payoutData, error: payoutsError } = await supabase
        .from("payout_requests")
        .select(`
          *,
          profiles:screen_owner_id (
            user_id,
            display_name,
            email
          )
        `)
        .order("requested_at", { ascending: false });

      if (payoutsError) throw payoutsError;

      // Fetch active screens count
      const { count: screensCount, error: screensError } = await supabase
        .from("screens")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (screensError) throw screensError;

      // Calculate metrics
      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0;
      const platformFees = payments?.reduce((sum, p) => sum + (p.platform_fee_cents || 0), 0) || 0;
      const ownerEarnings = payments?.reduce((sum, p) => sum + (p.owner_amount_cents || 0), 0) || 0;

      const pendingPayouts = payoutData?.filter(p => p.status === "pending").length || 0;
      const completedPayouts = payoutData?.filter(p => p.status === "completed").length || 0;

      setMetrics({
        totalRevenue: totalRevenue / 100,
        platformFees: platformFees / 100,
        ownerEarnings: ownerEarnings / 100,
        pendingPayouts,
        completedPayouts,
        activeScreens: screensCount || 0,
        revenueGrowth: 12.5, // TODO: Calculate from historical data
      });

      setPayouts(
        payoutData?.map((p: any) => ({
          id: p.id,
          screen_owner_id: p.screen_owner_id,
          amount: p.amount / 100,
          status: p.status,
          requested_at: p.requested_at,
          processed_at: p.processed_at,
          owner_email: p.profiles?.email || "N/A",
          owner_name: p.profiles?.display_name || "Unknown",
        })) || []
      );
    } catch (error: any) {
      toast({
        title: "Error loading financial data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processPayout = async (payoutId: string) => {
    try {
      const { error } = await supabase.functions.invoke("payout-automation", {
        body: { payout_id: payoutId },
      });

      if (error) throw error;

      toast({
        title: "Payout processed",
        description: "The payout has been processed successfully",
      });

      fetchFinancialData();
    } catch (error: any) {
      toast({
        title: "Error processing payout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportFinancialReport = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .csv();

      if (error) throw error;

      const blob = new Blob([data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();

      toast({
        title: "Report exported",
        description: "Financial report downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const payoutColumns = [
    {
      key: "owner_name",
      header: "Owner",
      render: (item: PayoutRequest) => item.owner_name,
    },
    {
      key: "owner_email",
      header: "Email",
      render: (item: PayoutRequest) => item.owner_email,
    },
    {
      key: "amount",
      header: "Amount",
      render: (item: PayoutRequest) => `$${item.amount.toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (item: PayoutRequest) => (
        <Badge variant={item.status === "completed" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "requested_at",
      header: "Requested",
      render: (item: PayoutRequest) => format(new Date(item.requested_at), "MMM d, yyyy"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: PayoutRequest) =>
        item.status === "pending" ? (
          <Button size="sm" onClick={() => processPayout(item.id)}>
            Process
          </Button>
        ) : null,
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Platform revenue and payout management</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportFinancialReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={fetchFinancialData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{metrics?.revenueGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.platformFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue share</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owner Earnings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.ownerEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Paid to screen owners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Screens</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeScreens}</div>
            <p className="text-xs text-muted-foreground">Generating revenue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">
            Payout Requests ({metrics?.pendingPayouts} pending)
          </TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Requests</CardTitle>
              <CardDescription>Manage screen owner payout requests</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={payoutColumns} 
                data={payouts}
                keyExtractor={(item) => item.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all platform transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Transaction history view coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
