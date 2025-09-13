import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Monitor, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Play,
  Pause,
  BarChart3,
  Settings
} from "lucide-react";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("advertiser");
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">{t('dashboard.title')}</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              {t('dashboard.subtitle')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('dashboard.description')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12">
            <TabsTrigger value="advertiser">{t('dashboard.advertiserView')}</TabsTrigger>
            <TabsTrigger value="screen-owner">{t('dashboard.screenOwner')}</TabsTrigger>
          </TabsList>

          {/* Advertiser Dashboard */}
          <TabsContent value="advertiser" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.totalCampaigns')}</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.fromLastMonth')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.totalViews')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.2M</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.fromLastWeek')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.activeScreens')}</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.acrossCities')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.totalSpent')}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$4,230</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Active Campaigns */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('dashboard.activeCampaigns')}</CardTitle>
                  <CardDescription>{t('dashboard.manageCampaigns')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((campaign) => (
                    <div key={campaign} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium">{t('dashboard.summerSale')} {campaign}</h4>
                          <p className="text-sm text-muted-foreground">{t('dashboard.runningOnScreens')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{t('dashboard.live')}</Badge>
                        <Button size="sm" variant="outline" onClick={() => console.log('Campaign settings for', campaign)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upload Content */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('dashboard.uploadContent')}</CardTitle>
                  <CardDescription>{t('dashboard.addMedia')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t('dashboard.dragDrop')}
                    </p>
                    <Button className="bg-gradient-primary">
                      {t('dashboard.selectFiles')}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('dashboard.uploading')}</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Screen Owner Dashboard */}
          <TabsContent value="screen-owner" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.myScreens')}</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.allOnline')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.monthlyRevenue')}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,340</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.fromLastMonthPercent')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.totalViews')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">450K</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.occupancyRate')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.averageAcrossScreens')}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Screen Status */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('dashboard.screenStatus')}</CardTitle>
                  <CardDescription>{t('dashboard.monitorNetwork')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Downtown Mall - Screen 1", status: t('dashboard.online'), revenue: "$520" },
                    { name: "Airport Terminal A", status: t('dashboard.online'), revenue: "$890" },
                    { name: "City Center Plaza", status: t('dashboard.maintenance'), revenue: "$0" },
                    { name: "Shopping District", status: t('dashboard.online'), revenue: "$340" },
                    { name: "University Campus", status: t('dashboard.online'), revenue: "$290" }
                  ].map((screen, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${screen.status === t('dashboard.online') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <div>
                          <h4 className="font-medium">{screen.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{screen.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{screen.revenue}</p>
                        <p className="text-sm text-muted-foreground">{t('dashboard.thisMonth')}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Revenue Analytics */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('dashboard.revenueAnalytics')}</CardTitle>
                  <CardDescription>{t('dashboard.trackEarnings')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dashboard.primeTime')}</span>
                      <span className="text-sm font-medium">$890</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dashboard.businessHours')}</span>
                      <span className="text-sm font-medium">$1,200</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('dashboard.offPeak')}</span>
                      <span className="text-sm font-medium">$250</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>

                  <Button className="w-full bg-gradient-primary">
                    {t('dashboard.viewAnalytics')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};