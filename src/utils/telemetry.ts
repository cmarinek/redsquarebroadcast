import { onCLS, onFID, onLCP, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

function mapMetric(m: Metric) {
  return {
    metric_name: m.name,
    value: m.value,
    delta: (m as any).delta ?? null,
    id_value: m.id,
    navigation_type: (m as any).navigationType ?? null,
  };
}

function baseContext() {
  try {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    return {
      session_id: crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      path: window.location.pathname + window.location.search,
      device_info: {
        ua: navigator.userAgent,
        lang: navigator.language,
        viewport: { w: vw, h: vh },
        platform: (navigator as any).platform ?? null,
      },
    };
  } catch {
    return { session_id: null, path: null, device_info: null };
  }
}

export function initWebVitals() {
  const ctx = baseContext();
  const send = (metric: Metric) => {
    const event = mapMetric(metric);
    supabase.functions.invoke('frontend-telemetry', {
      body: { events: [event], ...ctx },
    }).catch(() => {});
  };

  onLCP(send);
  onFID(send);
  onCLS(send);
  onINP(send);
  onFCP(send);
  onTTFB(send);
}
