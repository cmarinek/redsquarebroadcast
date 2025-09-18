/**
 * Minimal metrics client for sending TV profiling metrics.
 * Respects analytics opt-out.
 */

import { getBuildConfig } from '@/config/buildConfig';

export async function sendTVProfilingMetrics(payload: any) {
  try {
    const buildConfig = getBuildConfig?.();
    if (!buildConfig || !buildConfig.analyticsEnabled) {
      return;
    }

    await fetch('/api/metrics/tv-profiling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, client: 'redsquare-tv', timestamp: Date.now() })
    });
  } catch (err) {
    // swallow errors; metrics must not impact runtime
    // eslint-disable-next-line no-console
    console.warn('Failed to send TV profiling metrics', err);
  }
}
