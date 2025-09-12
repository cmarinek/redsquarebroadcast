import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Settings, 
  BarChart3, 
  Clock, 
  Play,
  Shield,
  Calendar,
  Wifi
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { useDisplayMode } from '@/contexts/DisplayModeContext';
import ContentPlayer from '@/components/mobile/ContentPlayer';
import { ModeToggle } from './ModeToggle';
import { SecuritySettings } from './SecuritySettings';
import { ScheduleManager } from './ScheduleManager';
import { DeviceStatus } from './DeviceStatus';
import { RevenueTracking } from './RevenueTracking';

interface AdminModeProps {
  screenId?: string;
  onRequestDisplayMode: () => void;
}

export function AdminMode({ screenId, onRequestDisplayMode }: AdminModeProps) {
  const { mode } = useDisplayMode();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4">
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">RedSquare Screens</h1>
            <p className="text-muted-foreground">Screen Management Console</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/10">
              <Monitor className="w-3 h-3 mr-1" />
              Admin Mode
            </Badge>
            
            <ModeToggle 
              currentMode={mode}
              onModeChange={onRequestDisplayMode}
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="device" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Device
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Screen Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant="default">Online</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Mode</span>
                        <Badge variant="outline">Admin</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <span className="text-sm">2h 34m</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Today's Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$24.50</div>
                    <p className="text-xs text-muted-foreground">+15% from yesterday</p>
                  </CardContent>
                </Card>
              </div>

              {/* Content Player Preview */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Content Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContentPlayer screenId={screenId} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-6">
            <ContentPlayer screenId={screenId} />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            <ScheduleManager screenId={screenId} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <RevenueTracking screenId={screenId} />
          </TabsContent>

          {/* Device Tab */}
          <TabsContent value="device" className="mt-6">
            <DeviceStatus screenId={screenId} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}