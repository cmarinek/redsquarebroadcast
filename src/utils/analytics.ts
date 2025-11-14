/**
 * Enhanced Analytics Utilities
 *
 * Provides advanced analytics calculations including:
 * - Period-over-period growth
 * - Trend analysis
 * - Forecasting
 * - Statistical insights
 */

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  [key: string]: unknown;
}

export interface GrowthMetric {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: 'strong' | 'moderate' | 'weak';
  confidence: number; // 0-1
  slope: number;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

/**
 * Calculate period-over-period growth
 */
export function calculateGrowth(current: number, previous: number): GrowthMetric {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (Math.abs(changePercent) > 5) { // Consider 5% threshold as significant
    trend = changePercent > 0 ? 'up' : 'down';
  }

  return {
    current,
    previous,
    change,
    changePercent,
    trend,
  };
}

/**
 * Analyze trend from time series data
 */
export function analyzeTrend(data: TimeSeriesDataPoint[], valueKey = 'value'): TrendAnalysis {
  if (data.length < 2) {
    return {
      direction: 'stable',
      strength: 'weak',
      confidence: 0,
      slope: 0,
    };
  }

  // Calculate linear regression slope
  const n = data.length;
  const x = data.map((_, i) => i);
  const y = data.map(d => Number(d[valueKey]) || 0);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgY = sumY / n;

  // Calculate R-squared for confidence
  const yPredicted = x.map(xi => (sumY / n) + slope * (xi - sumX / n));
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - avgY, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPredicted[i], 2), 0);
  const rSquared = 1 - (ssResidual / ssTotal);

  // Determine direction and strength
  const slopePercent = (slope / avgY) * 100;
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let strength: 'strong' | 'moderate' | 'weak' = 'weak';

  if (Math.abs(slopePercent) > 1) {
    direction = slopePercent > 0 ? 'increasing' : 'decreasing';
    if (Math.abs(slopePercent) > 10) {
      strength = 'strong';
    } else if (Math.abs(slopePercent) > 5) {
      strength = 'moderate';
    }
  }

  return {
    direction,
    strength,
    confidence: Math.max(0, Math.min(1, rSquared)),
    slope,
  };
}

/**
 * Generate simple forecast based on linear trend
 */
export function generateForecast(
  historicalData: TimeSeriesDataPoint[],
  periodsAhead: number,
  valueKey = 'value'
): ForecastPoint[] {
  if (historicalData.length < 2) {
    return [];
  }

  const trend = analyzeTrend(historicalData, valueKey);
  const lastPoint = historicalData[historicalData.length - 1];
  const lastValue = Number(lastPoint[valueKey]) || 0;
  const lastDate = new Date(lastPoint.date);

  // Calculate standard deviation for confidence interval
  const values = historicalData.map(d => Number(d[valueKey]) || 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const forecasts: ForecastPoint[] = [];

  for (let i = 1; i <= periodsAhead; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);

    const predicted = lastValue + (trend.slope * i);
    const confidenceMargin = stdDev * 1.96 * Math.sqrt(i); // 95% confidence interval

    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted: Math.max(0, predicted), // Don't predict negative values
      confidence: {
        lower: Math.max(0, predicted - confidenceMargin),
        upper: predicted + confidenceMargin,
      },
    });
  }

  return forecasts;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  data: TimeSeriesDataPoint[],
  window: number,
  valueKey = 'value'
): TimeSeriesDataPoint[] {
  if (data.length < window) return data;

  return data.map((point, index) => {
    if (index < window - 1) {
      return { ...point, [`${valueKey}_ma`]: null };
    }

    const windowData = data.slice(index - window + 1, index + 1);
    const average = windowData.reduce((sum, p) => sum + (Number(p[valueKey]) || 0), 0) / window;

    return {
      ...point,
      [`${valueKey}_ma`]: average,
    };
  });
}

/**
 * Calculate period-based aggregations (daily to weekly, monthly)
 */
export function aggregateByPeriod(
  data: TimeSeriesDataPoint[],
  period: 'week' | 'month',
  valueKey = 'value'
): TimeSeriesDataPoint[] {
  const grouped: Map<string, number[]> = new Map();

  data.forEach(point => {
    const date = new Date(point.date);
    let periodKey: string;

    if (period === 'week') {
      // Get Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      periodKey = monday.toISOString().split('T')[0];
    } else {
      // First day of month
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    }

    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, []);
    }
    grouped.get(periodKey)!.push(Number(point[valueKey]) || 0);
  });

  return Array.from(grouped.entries())
    .map(([date, values]) => ({
      date,
      [valueKey]: values.reduce((a, b) => a + b, 0) / values.length, // Average
      total: values.reduce((a, b) => a + b, 0), // Sum
      count: values.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Identify anomalies in time series data
 */
export function detectAnomalies(
  data: TimeSeriesDataPoint[],
  valueKey = 'value',
  threshold = 2 // Standard deviations
): Array<TimeSeriesDataPoint & { isAnomaly: boolean; zScore: number }> {
  if (data.length < 3) {
    return data.map(d => ({ ...d, isAnomaly: false, zScore: 0 }));
  }

  const values = data.map(d => Number(d[valueKey]) || 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return data.map(point => {
    const value = Number(point[valueKey]) || 0;
    const zScore = stdDev !== 0 ? (value - mean) / stdDev : 0;
    const isAnomaly = Math.abs(zScore) > threshold;

    return {
      ...point,
      isAnomaly,
      zScore,
    };
  });
}

/**
 * Calculate cohort retention
 */
export function calculateRetention(
  cohortData: Array<{ date: string; newUsers: number; activeUsers: number }>
): Array<{ date: string; retentionRate: number }> {
  return cohortData.map(cohort => ({
    date: cohort.date,
    retentionRate: cohort.newUsers > 0 ? (cohort.activeUsers / cohort.newUsers) * 100 : 0,
  }));
}

/**
 * Calculate conversion funnel metrics
 */
export interface FunnelStage {
  name: string;
  count: number;
}

export interface FunnelMetrics {
  stages: Array<FunnelStage & {
    conversionRate: number;
    dropoffRate: number;
  }>;
  overallConversionRate: number;
}

export function analyzeFunnel(stages: FunnelStage[]): FunnelMetrics {
  const total = stages[0]?.count || 0;

  const enrichedStages = stages.map((stage, index) => {
    const previousCount = index > 0 ? stages[index - 1].count : total;
    const conversionRate = previousCount > 0 ? (stage.count / previousCount) * 100 : 0;
    const dropoffRate = 100 - conversionRate;

    return {
      ...stage,
      conversionRate,
      dropoffRate,
    };
  });

  const lastCount = stages[stages.length - 1]?.count || 0;
  const overallConversionRate = total > 0 ? (lastCount / total) * 100 : 0;

  return {
    stages: enrichedStages,
    overallConversionRate,
  };
}

/**
 * Generate insights based on metrics
 */
export interface AnalyticsInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  recommendation?: string;
}

export function generateInsights(metrics: {
  growth?: GrowthMetric;
  trend?: TrendAnalysis;
  currentValue?: number;
  benchmark?: number;
}): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  // Growth insights
  if (metrics.growth) {
    if (metrics.growth.trend === 'up' && metrics.growth.changePercent > 10) {
      insights.push({
        type: 'positive',
        title: 'Strong Growth',
        description: `Metrics increased by ${metrics.growth.changePercent.toFixed(1)}% compared to the previous period.`,
        recommendation: 'Continue current strategies to maintain growth momentum.',
      });
    } else if (metrics.growth.trend === 'down' && metrics.growth.changePercent < -10) {
      insights.push({
        type: 'negative',
        title: 'Declining Performance',
        description: `Metrics decreased by ${Math.abs(metrics.growth.changePercent).toFixed(1)}% compared to the previous period.`,
        recommendation: 'Review recent changes and consider adjusting your strategy.',
      });
    }
  }

  // Trend insights
  if (metrics.trend) {
    if (metrics.trend.strength === 'strong' && metrics.trend.confidence > 0.7) {
      const direction = metrics.trend.direction === 'increasing' ? 'upward' : 'downward';
      insights.push({
        type: metrics.trend.direction === 'increasing' ? 'positive' : 'warning',
        title: `${direction === 'upward' ? 'Positive' : 'Concerning'} Trend Detected`,
        description: `Data shows a strong ${direction} trend with ${(metrics.trend.confidence * 100).toFixed(0)}% confidence.`,
        recommendation: metrics.trend.direction === 'increasing'
          ? 'Consider scaling your successful initiatives.'
          : 'Take proactive measures to reverse the negative trend.',
      });
    }
  }

  // Benchmark comparison
  if (metrics.currentValue !== undefined && metrics.benchmark !== undefined) {
    const diff = ((metrics.currentValue - metrics.benchmark) / metrics.benchmark) * 100;
    if (diff > 20) {
      insights.push({
        type: 'positive',
        title: 'Above Benchmark',
        description: `Performance is ${diff.toFixed(0)}% above industry benchmark.`,
      });
    } else if (diff < -20) {
      insights.push({
        type: 'warning',
        title: 'Below Benchmark',
        description: `Performance is ${Math.abs(diff).toFixed(0)}% below industry benchmark.`,
        recommendation: 'Review best practices and optimize your approach.',
      });
    }
  }

  return insights;
}
