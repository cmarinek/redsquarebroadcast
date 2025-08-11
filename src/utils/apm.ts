import { supabase } from '@/integrations/supabase/client';

export async function timeApi<T>(label: string, fn: () => Promise<T> | PromiseLike<T>): Promise<T> {
  const t0 = performance.now();
  try {
    return await Promise.resolve(fn());
  } finally {
    const ms = Math.round(performance.now() - t0);
    try {
      const path = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : null;
      await supabase.functions.invoke('frontend-telemetry', {
        body: {
          events: [
            { metric_name: 'API_MS', value: ms, id_value: label }
          ],
          path,
        }
      });
    } catch { /* ignore */ }
  }
}
