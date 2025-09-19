import React, { useEffect, useState } from 'react';

type Sample = {
  ts: number;
  fps?: number;
  event?: string;
  data?: any;
};

export default function TVProfilingDashboard() {
  const [samples, setSamples] = useState<Sample[]>([]);

  useEffect(() => {
    // Live preview via custom events for local/dev testing
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const detail = ce.detail;
      setSamples((s) => [detail, ...s].slice(0, 200));
    };
    window.addEventListener('tv-profiling-sample', handler as EventListener);

    // Optionally: fetch recent samples from server endpoint if available
    // fetch('/api/metrics/tv-profiling/recent').then(...)

    return () => {
      window.removeEventListener('tv-profiling-sample', handler as EventListener);
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>TV Profiling Dashboard (dev preview)</h2>
      <p>Live preview shows last samples as they arrive.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Time</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Event</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>FPS</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Data</th>
          </tr>
        </thead>
        <tbody>
          {samples.map((s, i) => (
            <tr key={i}>
              <td style={{ padding: '6px 4px' }}>{new Date(s.ts).toLocaleTimeString()}</td>
              <td style={{ padding: '6px 4px' }}>{s.event || '-'}</td>
              <td style={{ padding: '6px 4px' }}>{s.fps ?? '-'}</td>
              <td style={{ padding: '6px 4px' }}>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(s.data)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
