import { supabase } from '@/integrations/supabase/client';

let installed = false;
let sid: string | null = null;

function getSessionId() {
  try {
    if (sid) return sid;
    sid = localStorage.getItem('rs_session_id');
    if (!sid) {
      sid = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('rs_session_id', sid);
    }
    return sid;
  } catch {
    return null;
  }
}

function isLocalhost() {
  try {
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  } catch { return false; }
}

export function initErrorReporting(sampleRate = 0.5) {
  if (installed) return;
  if (isLocalhost()) return; // prod-only
  if (Math.random() > sampleRate) return; // sampling
  installed = true;

  const ua = (() => { try { return navigator.userAgent; } catch { return null; } })();

  const send = (errs: { message: string; stack?: string | null; path?: string | null }[]) => {
    const path = (() => { try { return window.location.pathname + window.location.search; } catch { return null; } })();
    const payload = errs.map(e => ({
      message: e.message,
      stack: e.stack ?? null,
      path,
      session_id: getSessionId(),
      user_agent: ua,
    }));
    supabase.functions.invoke('frontend-error', { body: { errors: payload } }).catch(() => {});
  };

  let queue: { message: string; stack?: string | null; path?: string | null }[] = [];
  let timer: number | null = null;
  const flush = () => {
    if (!queue.length) return;
    const batch = queue.slice(0, 5);
    queue = queue.slice(5);
    send(batch);
    if (queue.length) {
      timer = window.setTimeout(flush, 500);
    } else {
      timer = null;
    }
  };

  const enqueue = (msg: string, stack?: string | null) => {
    queue.push({ message: msg, stack: stack ?? null, path: undefined });
    if (timer == null) timer = window.setTimeout(flush, 250);
  };

  window.addEventListener('error', (event) => {
    try {
      const msg = event.message || String(event.error || 'Unknown error');
      const stack = (event.error && (event.error as any).stack) || null;
      enqueue(msg, stack);
    } catch {}
  });

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason: any = (event as any).reason;
      const msg = typeof reason === 'string' ? reason : (reason?.message || 'Unhandled rejection');
      const stack = reason?.stack || null;
      enqueue(msg, stack);
    } catch {}
  });
}
