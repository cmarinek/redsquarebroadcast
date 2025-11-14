import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { AnalyticsInsight } from '@/utils/analytics';

interface InsightsPanelProps {
  insights: AnalyticsInsight[];
  title?: string;
  className?: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  title = "Analytics Insights",
  className,
}) => {
  if (insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-4 w-4" />;
      case 'negative':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getInsightVariant = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'default';
      case 'negative':
        return 'destructive';
      case 'warning':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getInsightColor = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'negative':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>
          Automated insights based on your performance data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <Badge variant={getInsightVariant(insight.type)} className="text-xs">
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                {insight.recommendation && (
                  <div className="mt-2 p-2 bg-background/50 rounded border border-border">
                    <p className="text-xs font-medium flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Recommendation:
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.recommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface QuickStatsProps {
  stats: QuickStat[];
  title?: string;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, title = "Quick Stats" }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold">{stat.value}</p>
                {stat.change !== undefined && (
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === 'up'
                        ? 'text-green-600 dark:text-green-400'
                        : stat.trend === 'down'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {stat.change > 0 ? '+' : ''}
                    {stat.change.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
