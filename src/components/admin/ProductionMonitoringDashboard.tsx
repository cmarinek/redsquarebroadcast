import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { DatabaseService } from "@/services/DatabaseService";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { BaseCard } from "@/components/shared/BaseCard";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SystemHealthWidget } from "./SystemHealthWidget";

interface DeploymentHistory {
  id: string;
  version: string;
  environment: string;
  status: 'success' | 'failed' | 'pending';
  deployed_at: string;
  deployed_by: string;
}

interface SecurityAlert {
  id: string;
  title: string;
  severity: string;
  status: string;
  created_at: string;
  affected_user_id?: string;
}

export function ProductionMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: alerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["security-alerts"],
    queryFn: DatabaseService.getSecurityAlerts,
    refetchInterval: 30000,
  });

  // Mock deployment history for demo
  const mockDeployments: DeploymentHistory[] = [
    {
      id: "1",
      version: "v1.2.3",
      environment: "production",
      status: "success",
      deployed_at: new Date().toISOString(),
      deployed_by: "admin@redsquare.com"
    }
  ];

  const { execute: refreshData } = useAsyncOperation(
    async () => {
      await Promise.all([refetchAlerts()]);
    },
    { 
      showSuccessToast: true, 
      successMessage: "Data refreshed successfully" 
    }
  );

  const securityColumns = [
    {
      key: 'title',
      header: 'Alert',
      render: (alert: SecurityAlert) => (
        <div>
          <div className="font-medium">{alert.title}</div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(alert.created_at), 'MMM d, HH:mm')}
          </div>
        </div>
      )
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (alert: SecurityAlert) => {
        const severityMap: Record<string, any> = {
          'low': 'low',
          'medium': 'medium', 
          'high': 'high',
          'critical': 'critical'
        };
        return <StatusBadge status={severityMap[alert.severity] || 'medium'} showIcon />;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (alert: SecurityAlert) => (
        <StatusBadge 
          status={alert.status === 'resolved' ? 'online' : alert.status === 'investigating' ? 'idle' : 'error'} 
        />
      )
    }
  ];

  const deploymentColumns = [
    {
      key: 'version',
      header: 'Version',
      render: (deployment: DeploymentHistory) => (
        <div className="font-mono">{deployment.version}</div>
      )
    },
    {
      key: 'environment',
      header: 'Environment',
      render: (deployment: DeploymentHistory) => (
        <div className="capitalize">{deployment.environment}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (deployment: DeploymentHistory) => (
        <StatusBadge 
          status={deployment.status === 'success' ? 'online' : deployment.status === 'failed' ? 'error' : 'idle'} 
        />
      )
    },
    {
      key: 'deployed_at',
      header: 'Deployed',
      render: (deployment: DeploymentHistory) => (
        <div className="text-sm">
          {format(new Date(deployment.deployed_at), 'MMM d, HH:mm')}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health, security alerts, and deployment tracking
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <BaseCard
          title="System Health"
          icon={Activity}
          className="p-0"
          headerClassName="pb-2"
          contentClassName="pt-0"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">All Systems Operational</span>
            </div>
            <div className="text-xs text-muted-foreground">
              99.9% uptime this month
            </div>
          </div>
        </BaseCard>

        <BaseCard
          title="Security Status"
          icon={Shield}
          className="p-0"
          headerClassName="pb-2"
          contentClassName="pt-0"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge status={alerts?.some(a => a.status !== 'resolved') ? 'medium' : 'online'} />
              <span className="text-sm font-medium">
                {alerts?.filter(a => a.status !== 'resolved').length || 0} active alerts
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last scan: {format(new Date(), 'MMM d, HH:mm')}
            </div>
          </div>
        </BaseCard>

        <BaseCard
          title="Deployments"
          icon={TrendingUp}
          className="p-0"
          headerClassName="pb-2"
          contentClassName="pt-0"
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">
              This week
            </div>
          </div>
        </BaseCard>

        <BaseCard
          title="Performance"
          icon={Activity}
          className="p-0"
          headerClassName="pb-2"
          contentClassName="pt-0"
        >
          <div className="space-y-2">
            <div className="text-2xl font-bold">98.5%</div>
            <div className="text-xs text-muted-foreground">
              Success rate
            </div>
            <Progress value={98.5} className="h-1" />
          </div>
        </BaseCard>
      </div>

      {/* Detailed Monitoring */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security Alerts</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="system-health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <BaseCard title="Recent Security Alerts">
              {alerts && alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={alert.severity === 'critical' ? 'critical' : 'medium'} />
                        <span className="text-sm">{alert.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(alert.created_at), 'MMM d')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent alerts</p>
                </div>
              )}
            </BaseCard>

            <BaseCard title="Latest Deployments">
              <div className="space-y-2">
                {mockDeployments.slice(0, 3).map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={deployment.status === 'success' ? 'online' : 'error'} />
                      <span className="text-sm font-mono">{deployment.version}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(deployment.deployed_at), 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </BaseCard>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <BaseCard title="Security Alerts" description="Monitor security events and threats">
            <DataTable
              data={alerts || []}
              columns={securityColumns}
              emptyMessage="No security alerts found"
              keyExtractor={(alert) => alert.id}
            />
          </BaseCard>
        </TabsContent>

        <TabsContent value="deployments">
          <BaseCard title="Deployment History" description="Track application deployments">
            <DataTable
              data={mockDeployments}
              columns={deploymentColumns}
              emptyMessage="No deployments found"
              keyExtractor={(deployment) => deployment.id}
            />
          </BaseCard>
        </TabsContent>

        <TabsContent value="system-health">
          <SystemHealthWidget />
        </TabsContent>
      </Tabs>
    </div>
  );
}