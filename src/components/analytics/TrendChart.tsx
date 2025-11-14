import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TimeSeriesDataPoint,
  analyzeTrend,
  generateForecast,
  calculateMovingAverage,
} from '@/utils/analytics';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
  valueKey: string;
  showForecast?: boolean;
  showMovingAverage?: boolean;
  forecastPeriods?: number;
  movingAverageWindow?: number;
  valueFormatter?: (value: number) => string;
  description?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  valueKey,
  showForecast = false,
  showMovingAverage = false,
  forecastPeriods = 7,
  movingAverageWindow = 7,
  valueFormatter = (value) => value.toLocaleString(),
  description,
}) => {
  const enhancedData = useMemo(() => {
    if (data.length === 0) return [];

    let processed = [...data];

    // Add moving average if requested
    if (showMovingAverage) {
      processed = calculateMovingAverage(processed, movingAverageWindow, valueKey);
    }

    return processed;
  }, [data, showMovingAverage, movingAverageWindow, valueKey]);

  const forecastData = useMemo(() => {
    if (!showForecast || data.length < 2) return [];
    return generateForecast(data, forecastPeriods, valueKey);
  }, [data, showForecast, forecastPeriods, valueKey]);

  const trend = useMemo(() => {
    if (data.length < 2) return null;
    return analyzeTrend(data, valueKey);
  }, [data, valueKey]);

  const chartData = useMemo(() => {
    const historical = enhancedData.map(d => ({
      ...d,
      type: 'historical',
    }));

    const forecast = forecastData.map(f => ({
      date: f.date,
      [valueKey]: f.predicted,
      [`${valueKey}_lower`]: f.confidence.lower,
      [`${valueKey}_upper`]: f.confidence.upper,
      type: 'forecast',
    }));

    return [...historical, ...forecast];
  }, [enhancedData, forecastData, valueKey]);

  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-4 w-4" />;
    switch (trend.direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadge = () => {
    if (!trend) return null;

    const confidence = Math.round(trend.confidence * 100);
    let variant: 'default' | 'secondary' | 'destructive' = 'secondary';

    if (trend.direction === 'increasing') {
      variant = 'default';
    } else if (trend.direction === 'decreasing') {
      variant = 'destructive';
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getTrendIcon()}
        <span className="capitalize">
          {trend.strength} {trend.direction} trend
        </span>
        <span className="text-xs opacity-75">({confidence}% confidence)</span>
      </Badge>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available for visualization
          </div>
        </CardContent>
      </Card>
    );
  }

  const lastHistoricalIndex = enhancedData.length - 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {getTrendBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--muted))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              className="text-xs"
            />
            <YAxis
              tickFormatter={valueFormatter}
              className="text-xs"
            />
            <Tooltip
              formatter={valueFormatter}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />

            {/* Vertical line separating historical and forecast */}
            {showForecast && enhancedData.length > 0 && (
              <ReferenceLine
                x={enhancedData[lastHistoricalIndex].date}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                label={{
                  value: 'Forecast',
                  position: 'top',
                  className: 'text-xs fill-muted-foreground',
                }}
              />
            )}

            {/* Historical data */}
            <Area
              type="monotone"
              dataKey={valueKey}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorValue)"
              name="Actual"
              connectNulls
            />

            {/* Moving average */}
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey={`${valueKey}_ma`}
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name={`${movingAverageWindow}-day MA`}
                connectNulls
              />
            )}

            {/* Forecast with confidence interval */}
            {showForecast && (
              <>
                <Area
                  type="monotone"
                  dataKey={`${valueKey}_upper`}
                  stroke="none"
                  fill="url(#colorForecast)"
                  fillOpacity={0.3}
                  name="Upper Bound"
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey={`${valueKey}_lower`}
                  stroke="none"
                  fill="url(#colorForecast)"
                  fillOpacity={0.3}
                  name="Lower Bound"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey={valueKey}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Predicted"
                  connectNulls
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>

        {trend && (
          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              Trend analysis: The data shows a <strong>{trend.strength}</strong> {trend.direction} trend
              with {Math.round(trend.confidence * 100)}% confidence.
              {showForecast && ` Forecast extends ${forecastPeriods} periods ahead.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
