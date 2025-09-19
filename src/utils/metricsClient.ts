// Simple metrics client for TV profiling batches.
// Respects getBuildConfig().analyticsEnabled to avoid sending telemetry when disabled.

import { getBuildConfig } from '../config/getBuildConfig';

interface TVProfilingBatch {
  samples: Array<any>;
}

async function doPost(url: string, body: any, retries = 2): Promise<Response> {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, 2 - retries)));
      return doPost(url, body, retries - 1);
    }
    throw err;
  }
}

export async function postTVProfilingBatch(batch: TVProfilingBatch) {
  const cfg = typeof getBuildConfig === 'function' ? getBuildConfig() : { analyticsEnabled: false };
  if (!cfg || !cfg.analyticsEnabled) {
    // do not post when analytics disabled
    return Promise.resolve();
  }
  const url = '/api/metrics/tv-profiling';
  return doPost(url, {
    timestamp: Date.now(),
    build: cfg.buildTag || cfg.version || 'unknown',
    samples: batch.samples,
  });
}
