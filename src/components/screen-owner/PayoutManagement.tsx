import { useState, useEffect } from "react";
import { 
  DollarSign,
  Calendar,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DateRange } from "react-day-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  processed_at?: string;
  earnings_period_start: string;
  earnings_period_end: string;
}

interface EarningsData {
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  current_balance: number;
}

interface PayoutManagementProps {
  screens: Array<{ id: string; screen_name: string; revenue_this_month: number; }>;
}

export const PayoutManagement = ({ screens }: PayoutManagementProps) => {
  const { toast } = useToast();
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({
    total_earnings: 0,
    pending_earnings: 0,
    paid_earnings: 0,
    current_balance: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  useEffect(() => {
    fetchPayoutData();
  }, []);

  useEffect(() => {
    calculateEarnings();
  }, [screens]);

  const fetchPayoutData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      const processedRequests: PayoutRequest[] = (data || []).map(request => ({
        ...request,
        status: request.status as 'pending' | 'processing' | 'completed' | 'failed'
      }));
      
      setPayoutRequests(processedRequests);
    } catch (error) {
      console.error("Error fetching payout data:", error);
      toast({
        title: "Error loading payout data",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = () => {
    const totalRevenue = screens.reduce((sum, screen) => sum + screen.revenue_this_month, 0);
    const platformFee = totalRevenue * 0.15; // 15% platform fee
    const netEarnings = totalRevenue - platformFee;
    
    const paidAmount = payoutRequests
      .filter(req => req.status === 'completed')
      .reduce((sum, req) => sum + req.amount, 0);
    
    const pendingAmount = payoutRequests
      .filter(req => req.status === 'pending' || req.status === 'processing')
      .reduce((sum, req) => sum + req.amount, 0);

    setEarnings({
      total_earnings: totalRevenue,
      pending_earnings: pendingAmount,
      paid_earnings: paidAmount,
      current_balance: Math.max(0, netEarnings - paidAmount - pendingAmount)
    });

    setPayoutAmount(Math.max(0, netEarnings - paidAmount - pendingAmount) / 100);
  };

  const requestPayout = async () => {
    if (!selectedPeriod?.from || !selectedPeriod?.to || payoutAmount <= 0) {
      toast({
        title: "Invalid payout request",
        description: "Please select a valid date range and amount.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payout', {
        body: {
          amount: payoutAmount,
          period_start: format(selectedPeriod.from, 'yyyy-MM-dd'),
          period_end: format(selectedPeriod.to, 'yyyy-MM-dd')
        }
      });

      if (error) throw error;

      toast({
        title: "Payout requested",
        description: `Your payout of $${payoutAmount.toFixed(2)} has been requested.`,
      });

      setIsPayoutDialogOpen(false);
      fetchPayoutData();
      calculateEarnings();
    } catch (error) {
      console.error("Error requesting payout:", error);
      toast({
        title: "Error requesting payout",
        description: (error as any)?.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const exportEarningsReport = () => {
    // Mock CSV generation
    const csvContent = [
      ['Date', 'Screen', 'Revenue', 'Platform Fee', 'Net Earnings'],
      ...screens.map(screen => [
        format(new Date(), 'yyyy-MM-dd'),
        screen.screen_name,
        `$${(screen.revenue_this_month / 100).toFixed(2)}`,
        `$${(screen.revenue_this_month * 0.15 / 100).toFixed(2)}`,
        `$${(screen.revenue_this_month * 0.85 / 100).toFixed(2)}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: "Your earnings report has been downloaded.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payout Management
              </CardTitle>
              <CardDescription>
                Track earnings, request payouts, and manage your revenue
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportEarningsReport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={earnings.current_balance <= 0}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Request Payout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Payout</DialogTitle>
                    <DialogDescription>
                      Request a payout for your accumulated earnings
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Earnings Period</label>
                      <div className="text-sm text-muted-foreground">
                        {selectedPeriod?.from && selectedPeriod?.to 
                          ? `${format(selectedPeriod.from, 'MMM d')} - ${format(selectedPeriod.to, 'MMM d, yyyy')}`
                          : 'Select date range'
                        }
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Available Balance</label>
                      <div className="text-2xl font-bold text-emerald-600">
                        ${(earnings.current_balance / 100).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Payout Amount</label>
                      <div className="text-lg font-semibold">
                        ${payoutAmount.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        After 15% platform fee
                      </p>
                    </div>
                    <Button 
                      onClick={requestPayout} 
                      disabled={loading || payoutAmount <= 0}
                      className="w-full"
                    >
                      {loading ? "Processing..." : "Request Payout"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Earnings Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${(earnings.total_earnings / 100).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Available Balance</p>
                <p className="text-2xl font-bold text-emerald-900">
                  ${(earnings.current_balance / 100).toFixed(2)}
                </p>
                <p className="text-xs text-emerald-600">Ready for payout</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Pending Payouts</p>
                <p className="text-2xl font-bold text-amber-900">
                  ${(earnings.pending_earnings / 100).toFixed(2)}
                </p>
                <p className="text-xs text-amber-600">Processing</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Paid Out</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${(earnings.paid_earnings / 100).toFixed(2)}
                </p>
                <p className="text-xs text-blue-600">All time</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown by Screen</CardTitle>
          <CardDescription>
            See how much each screen is contributing to your earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {screens.map((screen) => {
              const revenue = screen.revenue_this_month / 100;
              const platformFee = revenue * 0.15;
              const netEarnings = revenue - platformFee;
              const percentage = earnings.total_earnings > 0 ? (screen.revenue_this_month / earnings.total_earnings) * 100 : 0;

              return (
                <div key={screen.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{screen.screen_name}</h4>
                    <div className="text-right">
                      <span className="font-medium">${revenue.toFixed(2)}</span>
                      <p className="text-sm text-muted-foreground">
                        Net: ${netEarnings.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{percentage.toFixed(1)}% of total</span>
                    <span>Fee: ${platformFee.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            Track all your payout requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payoutRequests.length > 0 ? (
            <div className="space-y-4">
              {payoutRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className="font-medium">${(request.amount / 100).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.earnings_period_start), 'MMM d')} - {format(new Date(request.earnings_period_end), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={`${getStatusColor(request.status)} border`}>
                        {request.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.processed_at 
                          ? format(new Date(request.processed_at), 'MMM d, h:mm a')
                          : format(new Date(request.requested_at), 'MMM d, h:mm a')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payout history</h3>
              <p className="text-muted-foreground mb-4">
                Your payout requests will appear here once you start earning
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};