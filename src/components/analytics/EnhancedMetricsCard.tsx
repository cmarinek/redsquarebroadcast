import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { GrowthMetric } from '@/utils/analytics';

interface EnhancedMetricsCardProps {
  title: string;
  value: string | number;
  growth?: GrowthMetric;
  icon?: React.ElementType;
  description?: string;
  formatValue?: (value: number) => string;
}

export const EnhancedMetricsCard: React.FC<EnhancedMetricsCardProps> = ({
  title,
  value,
  growth,
  icon: Icon,
  description,
}) => {
  const getTrendIcon = () => {
    if (!growth) return null;
    switch (growth.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    if (!growth) return 'text-muted-foreground';
    switch (growth.trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendBadgeVariant = () => {
    if (!growth) return 'secondary';
    switch (growth.trend) {
      case 'up':
        return 'default';
      case 'down':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{value}</div>

          {growth && (
            <div className="flex items-center gap-2">
              <Badge variant={getTrendBadgeVariant()} className="flex items-center gap-1">
                {getTrendIcon()}
                <span className="text-xs">
                  {growth.changePercent > 0 ? '+' : ''}
                  {growth.changePercent.toFixed(1)}%
                </span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs previous period
              </span>
            </div>
          )}

          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ComparisonMetric {
  label: string;
  current: number;
  previous: number;
  format?: (value: number) => string;
}

interface MetricsComparisonProps {
  title: string;
  metrics: ComparisonMetric[];
}

export const MetricsComparison: React.FC<MetricsComparisonProps> = ({ title, metrics }) => {
  const defaultFormat = (value: number) => value.toLocaleString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Period-over-period comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const change = metric.current - metric.previous;
            const changePercent = metric.previous !== 0
              ? (change / metric.previous) * 100
              : 0;
            const isPositive = change > 0;
            const format = metric.format || defaultFormat;

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-sm font-semibold ${
                      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Current: {format(metric.current)}</span>
                  <span>Previous: {format(metric.previous)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
