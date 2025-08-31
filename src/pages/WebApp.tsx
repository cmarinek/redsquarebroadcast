import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEO from '@/components/SEO';
import { 
  Monitor, 
  Smartphone, 
  Upload, 
  Calendar, 
  MapPin, 
  DollarSign, 
  BarChart3,
  Settings,
  PlayCircle,
  Users,
  Wifi
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import existing components
import ScreenDiscovery from '@/pages/ScreenDiscovery';
import ContentUpload from '@/pages/ContentUpload';
import Scheduling from '@/pages/Scheduling';
import Dashboard from '@/pages/Dashboard';
import ScreenOwnerDashboard from '@/pages/ScreenOwnerDashboard';
import AdvertiserDashboard from '@/pages/AdvertiserDashboard';

export default function WebApp() {
  const { user } = useAuth();
  const { roles, loading } = useUserRoles();
  const [activeTab, setActiveTab] = useState('discover');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-select appropriate tab based on user role
  useEffect(() => {
    if (!loading && roles.length > 0) {
      if (roles.includes('screen_owner')) {
        setActiveTab('owner-dashboard');
      } else if (roles.includes('advertiser') || roles.includes('broadcaster')) {
        setActiveTab('advertiser-dashboard');
      }
    }
  }, [roles, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Red Square Web App...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Red Square Web App - Complete Broadcasting Platform"
        description="Full-featured Red Square broadcasting platform. Discover screens, upload content, schedule broadcasts, and manage campaigns - all in your browser."
      />

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">Red Square Web App</h1>
              </div>
              
              <Badge variant="secondary" className="hidden sm:flex">
                <Wifi className={`h-3 w-3 mr-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <Badge variant="outline">
                  {user.email}
                </Badge>
              )}
              
              <Button variant="outline" size="sm" asChild>
                <Link to="/download">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Get Apps
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {!user ? (
          // Not logged in - show welcome and auth
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">Welcome to Red Square</h2>
              <p className="text-xl text-muted-foreground">
                The complete digital broadcasting platform - now in your browser
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle>Discover Screens</CardTitle>
                  <CardDescription>
                    Find digital screens near you using our interactive map
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle>Upload Content</CardTitle>
                  <CardDescription>
                    Upload videos, images, and GIFs for your broadcasts
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle>Schedule Broadcasts</CardTitle>
                  <CardDescription>
                    Book time slots and manage your advertising campaigns
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-4">
              <Button size="lg" asChild>
                <Link to="/auth">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Get Started Now
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Full desktop and mobile app experience - no download required
              </p>
            </div>
          </div>
        ) : (
          // Logged in - show full app interface
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
              
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>

              {roles.includes('screen_owner') && (
                <TabsTrigger value="owner-dashboard" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <span className="hidden sm:inline">My Screens</span>
                </TabsTrigger>
              )}

              {(roles.includes('advertiser') || roles.includes('broadcaster')) && (
                <TabsTrigger value="advertiser-dashboard" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">Campaigns</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="discover" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Discover Screens</h2>
                <Badge variant="secondary">Interactive Map</Badge>
              </div>
              <ScreenDiscovery />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Upload Content</h2>
                <Badge variant="secondary">Video, Image, GIF</Badge>
              </div>
              <ContentUpload />
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Schedule Broadcasts</h2>
                <Badge variant="secondary">Calendar View</Badge>
              </div>
              <Scheduling />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <Badge variant="secondary">Analytics</Badge>
              </div>
              <Dashboard />
            </TabsContent>

            {roles.includes('screen_owner') && (
              <TabsContent value="owner-dashboard" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Screen Owner Dashboard</h2>
                  <Badge variant="secondary">Manage Screens</Badge>
                </div>
                <ScreenOwnerDashboard />
              </TabsContent>
            )}

            {(roles.includes('advertiser') || roles.includes('broadcaster')) && (
              <TabsContent value="advertiser-dashboard" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Advertiser Dashboard</h2>
                  <Badge variant="secondary">Campaign Management</Badge>
                </div>
                <AdvertiserDashboard />
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Red Square Web App - Full broadcasting platform experience
            </p>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/download">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Get Mobile App
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild>
                <Link to="/download">
                  <Monitor className="h-4 w-4 mr-2" />
                  Get Desktop App
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}