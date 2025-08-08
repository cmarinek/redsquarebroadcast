import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Monitor, 
  Plus, 
  MapPin, 
  Clock, 
  DollarSign, 
  Wifi, 
  WifiOff,
  QrCode,
  Settings,
  BarChart3,
  Calendar,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface ScreenData {
  id: string;
  screen_name: string;
  address: string;
  city: string;
  price_per_hour: number;
  availability_start: string;
  availability_end: string;
  is_active: boolean;
  qr_code_url: string;
  created_at: string;
  bookings_count: number;
  total_earnings: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserScreens();
  }, [user, navigate]);

  const fetchUserScreens = async () => {
    try {
      const { data, error } = await supabase
        .from('screens')
        .select(`
          *,
          bookings!inner(id, total_amount)
        `)
        .eq('owner_id', user.id);

      if (error) throw error;

      // Process data to calculate stats
      const processedScreens = data.map(screen => ({
        ...screen,
        bookings_count: screen.bookings?.length || 0,
        total_earnings: screen.bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0,
      }));

      setScreens(processedScreens);
    } catch (error) {
      console.error("Error fetching screens:", error);
      toast({
        title: "Error loading screens",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleScreenStatus = async (screenId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('screens')
        .update({ is_active: !currentStatus })
        .eq('id', screenId);

      if (error) throw error;

      setScreens(prev => prev.map(screen => 
        screen.id === screenId 
          ? { ...screen, is_active: !currentStatus }
          : screen
      ));

      toast({
        title: !currentStatus ? "Screen activated" : "Screen deactivated",
        description: !currentStatus 
          ? "Your screen is now available for booking" 
          : "Your screen is no longer accepting bookings",
      });
    } catch (error) {
      console.error("Error updating screen status:", error);
      toast({
        title: "Error updating screen",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadQRCode = (qrCodeUrl: string, screenName: string) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${screenName}-qr-code.png`;
    link.click();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Screen Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your registered screens and monitor performance
            </p>
          </div>
          <Button onClick={() => navigate('/register-screen')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Register New Screen
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Screens</p>
                  <p className="text-2xl font-bold">{screens.length}</p>
                </div>
                <Monitor className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Screens</p>
                  <p className="text-2xl font-bold">{screens.filter(s => s.is_active).length}</p>
                </div>
                <Wifi className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{screens.reduce((sum, s) => sum + s.bookings_count, 0)}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    ${screens.reduce((sum, s) => sum + s.total_earnings, 0) / 100}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Screens Grid */}
        {screens.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No screens registered</h3>
              <p className="text-muted-foreground mb-6">
                Start earning by registering your first screen
              </p>
              <Button onClick={() => navigate('/register-screen')}>
                <Plus className="h-4 w-4 mr-2" />
                Register Your First Screen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {screens.map((screen) => (
              <Card key={screen.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{screen.screen_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {screen.address}, {screen.city}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={screen.is_active ? "default" : "secondary"}>
                        {screen.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {screen.is_active ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Screen Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Rate</p>
                      <p className="text-muted-foreground">${screen.price_per_hour / 100}/hr</p>
                    </div>
                    <div>
                      <p className="font-medium">Bookings</p>
                      <p className="text-muted-foreground">{screen.bookings_count}</p>
                    </div>
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-muted-foreground">
                        {screen.availability_start} - {screen.availability_end}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Earnings</p>
                      <p className="text-muted-foreground">${screen.total_earnings / 100}</p>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">QR Code</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQRCode(showQRCode === screen.id ? null : screen.id)}
                        >
                          {showQRCode === screen.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadQRCode(screen.qr_code_url, screen.screen_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {showQRCode === screen.id && (
                      <div className="flex justify-center p-4 bg-white rounded-lg">
                        <img 
                          src={screen.qr_code_url} 
                          alt={`QR Code for ${screen.screen_name}`}
                          className="w-32 h-32"
                        />
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={screen.is_active}
                        onCheckedChange={() => toggleScreenStatus(screen.id, screen.is_active)}
                      />
                      <span className="text-sm">
                        {screen.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;