import { useEffect, useRef } from 'react';
import { PlatformCapabilities, detectPlatformEnhanced } from '../utils/platformDetection';

type NavigateCallback = (route: string, params?: Record<string, any>) => void;

export interface UseTVRemoteNavigationOptions {
  enableGestures?: boolean;
  onNavigate?: NavigateCallback;
  mapping?: Record<string, string>; // action -> route
  enableLongPress?: boolean;
  enableDoubleTap?: boolean;
}

/**
 * Hook to register TV remote mapping with the runtime if present.
 * - Registers mapping via window.RedSquareTV.registerRemoteMapping if available.
 * - Listens for 'remote-nav' custom events as a fallback.
 */
export function useTVRemoteNavigation(options: UseTVRemoteNavigationOptions = {}) {
  const opts = {
    enableGestures: false,
    enableLongPress: false,
    enableDoubleTap: false,
    mapping: {},
    ...options,
  };

  const onNavigateRef = useRef<NavigateCallback | undefined>(opts.onNavigate);

  useEffect(() => {
    onNavigateRef.current = opts.onNavigate;
  }, [opts.onNavigate]);

  useEffect(() => {
    const caps: PlatformCapabilities = detectPlatformEnhanced();
    if (!caps.hasRemote) {
      // No remote capability; no-op
      return;
    }

    const win = window as any;
    let registered = false;

    const dispatchNavigate = (route: string, params?: Record<string, any>) => {
      if (onNavigateRef.current) {
        onNavigateRef.current(route, params);
      } else {
        const ev = new CustomEvent('tv-navigate', { detail: { route, params } });
        window.dispatchEvent(ev);
      }
    };

    // If runtime provides registration API, register mapping
    try {
      if (win && win.RedSquareTV && typeof win.RedSquareTV.registerRemoteMapping === 'function') {
        const mappingPayload = {
          mapping: opts.mapping || {},
          gestures: opts.enableGestures && caps.supportsGestures,
          longPress: opts.enableLongPress && caps.supportsLongPress,
          doubleTap: opts.enableDoubleTap && caps.supportsDoubleTap,
        };
        win.RedSquareTV.registerRemoteMapping(mappingPayload);
        registered = true;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('useTVRemoteNavigation: runtime registration failed', err);
      registered = false;
    }

    // Fallback: runtime events or window custom events
    const runtimeHandler = (e: any) => {
      try {
        const detail = e && e.detail ? e.detail : e;
        const action = detail.action || detail.route || null;
        if (!action) return;
        const route = (opts.mapping && opts.mapping[action]) || action;
        // Emit nav-latency for telemetry
        const latencyEvent = new CustomEvent('nav-latency', {
          detail: { action, startTs: detail.startTs || Date.now(), endTs: Date.now() },
        });
        window.dispatchEvent(latencyEvent);
        dispatchNavigate(route, detail.params);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('useTVRemoteNavigation runtimeHandler error', err);
      }
    };

    if (win && win.RedSquareTV && typeof win.RedSquareTV.onRemoteEvent === 'function') {
      try {
        win.RedSquareTV.onRemoteEvent(runtimeHandler);
      } catch (err) {
        // fallback to window events below
      }
    }

    const windowHandler = (e: Event) => {
      const ce = e as CustomEvent;
      runtimeHandler(ce);
    };
    window.addEventListener('remote-nav', windowHandler as EventListener);

    // Clean up on unmount
    return () => {
      try {
        if (registered && win && win.RedSquareTV && typeof win.RedSquareTV.unregisterRemoteMapping === 'function') {
          try {
            win.RedSquareTV.unregisterRemoteMapping();
          } catch (err) {
            // ignore
          }
        }
      } catch (err) {
        // ignore
      }
      window.removeEventListener('remote-nav', windowHandler as EventListener);
    };
  }, [
    JSON.stringify(opts.mapping || {}),
    opts.enableGestures,
    opts.enableLongPress,
    opts.enableDoubleTap,
  ]);
}
