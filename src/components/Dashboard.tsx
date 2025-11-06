import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Upload, Monitor, Calendar, DollarSign, TrendingUp, Users, Play, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

const formatNumber = (value?: unknown, options: Intl.NumberFormatOptions = {}) => {
  if (value === null || value === undefined) return "—";
  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) return "—";
  return new Intl.NumberFormat(undefined, options).format(numericValue);
};

const formatCurrency = (value?: unknown) => {
  if (value === null || value === undefined) return "—";
  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) return "—";
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    numericValue / 100
  );
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("advertiser");
  const { t } = useTranslation();
  const { data, loading, error } = useDashboardMetrics({ role: "public", skipToast: true });

  const summary = data?.summary ?? {};

  const totals = useMemo(() => {
    const timeSeries = (data?.timeSeries?.daily as Array<Record<string, unknown>>) ?? [];
    const aggregateViews = timeSeries.reduce((total, point) => total + Number(point?.views ?? 0), 0);

    return {
      totalCampaigns: summary.totalBookings as number | undefined,
      totalViews: aggregateViews,
      activeScreens: summary.activeScreens as number | undefined,
      totalSpentCents: summary.totalRevenueCents as number | undefined,
      utilizationPercent: summary.screenUtilizationPercent as number | undefined,
      revenueGrowthPercent: summary.revenueGrowthPercent as number | undefined,
    };
  }, [data?.timeSeries?.daily, summary]);

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

          <TabsContent value="advertiser" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="space-y-2 pb-2">
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-3 w-28 mt-3" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard.totalCampaigns')}</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(totals.totalCampaigns)}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard.fromLastMonth')}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard.totalViews')}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(totals.totalViews)}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard.fromLastWeek')}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard.activeScreens')}</CardTitle>
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(totals.activeScreens)}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard.acrossCities')}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard.totalSpent')}</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(totals.totalSpentCents)}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('dashboard.activeCampaigns')}</CardTitle>
                  <CardDescription>{t('dashboard.manageCampaigns')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center gap-3 rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      <span>{t('dashboard.metricsUnavailable')}</span>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>{t('dashboard.metricsRequireAccount')}</p>
                      <div className="rounded-md border border-border p-4">
                        <div className="flex items-center gap-3">
                          <Play className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{t('dashboard.connectAccount')}</p>
                            <p>{t('dashboard.connectAccountDescription')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('dashboard.uploadContent')}</CardTitle>
                  <CardDescription>{t('dashboard.addMedia')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t('dashboard.uploadCta')}
                    </p>
                    <Button className="bg-gradient-primary">
                      {t('dashboard.selectFiles')}
                    </Button>
                  </div>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{t('dashboard.uploadsRealtimeNotice')}</span>
                    </div>
                    <div className="rounded-md border border-dashed border-border/70 p-3">
                      <p>{t('dashboard.uploadsRealtimeDetail')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="screen-owner" className="space-y-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="space-y-2 pb-2">
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-3 w-28 mt-3" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard.myScreens')}</CardTitle>
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(totals.activeScreens)}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard.allOnline')}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard.monthlyRevenue')}</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(totals.totalSpentCents)}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard.fromLastMonthPercent')}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard.totalViews')}</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(totals.totalViews)}</div>
                      <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{t('dashboard.occupancyRate')}</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {totals.utilizationPercent !== undefined
                          ? `${formatNumber(totals.utilizationPercent, { maximumFractionDigits: 1 })}%`
                          : "—"}
                      </div>
                      <p className="text-xs text-muted-foreground">{t('dashboard.averageAcrossScreens')}</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('dashboard.performanceBreakdown')}</CardTitle>
                  <CardDescription>{t('dashboard.screenOwnerDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>
                          {t('dashboard.utilizationDetail', {
                            percent:
                              totals.utilizationPercent !== undefined
                                ? formatNumber(totals.utilizationPercent, { maximumFractionDigits: 1 })
                                : '—',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>
                          {t('dashboard.viewDetail', {
                            total: formatNumber(totals.totalViews),
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span>
                          {t('dashboard.revenueGrowthDetail', {
                            value:
                              totals.revenueGrowthPercent !== undefined
                                ? `${formatNumber(totals.revenueGrowthPercent, { maximumFractionDigits: 1 })}%`
                                : '—',
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>{t('dashboard.support')}</CardTitle>
                  <CardDescription>{t('dashboard.supportDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>{t('dashboard.supportDescription')}</p>
                  <Button variant="outline" className="w-full">
                    {t('dashboard.contactSupport')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {!loading && !error && totals.totalCampaigns === undefined && (
          <div className="mt-10 rounded-lg border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{t('dashboard.emptyState')}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
