// probePlatformCapabilities and detectPlatformEnhanced
// Conservative fallbacks for unknown runtimes.

import { getBuildConfig } from '../config/getBuildConfig';

export type ProbeSource = 'runtime' | 'ua' | 'unknown';

export interface PlatformCapabilities {
  probeSource: ProbeSource;
  hasRemote: boolean;
  supportsGestures: boolean;
  supportsLongPress: boolean;
  supportsDoubleTap: boolean;
  raw?: any;
}

/**
 * Runtime probing uses window.RedSquareTV (if present) or other runtime globals.
 * If runtime probing can't find capabilities, fall back to user-agent heuristics.
 */
export function probePlatformCapabilities(): PlatformCapabilities {
  // Conservative defaults
  const defaults: PlatformCapabilities = {
    probeSource: 'unknown',
    hasRemote: false,
    supportsGestures: false,
    supportsLongPress: false,
    supportsDoubleTap: false,
  };

  try {
    const win = window as any;
    if (win && typeof win.RedSquareTV === 'object' && win.RedSquareTV !== null) {
      const rt = win.RedSquareTV;
      const caps: PlatformCapabilities = {
        probeSource: 'runtime',
        hasRemote: !!(rt.registerRemoteMapping || rt.onRemoteEvent),
        supportsGestures: !!rt.supportsGestures || !!rt.enableGestureMode,
        supportsLongPress: !!rt.supportsLongPress,
        supportsDoubleTap: !!rt.supportsDoubleTap,
        raw: rt,
      };
      return caps;
    }

    // Fallback to user-agent heuristics
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    const uaLower = ua.toLowerCase();

    // Conservative UA checks
    const isSmartTV = /\b(tizen|webos|smart-tv|smarttv|appletv|bravia|netcast|vizio|roku)\b/i.test(
      uaLower,
    );
    if (isSmartTV) {
      const caps: PlatformCapabilities = {
        probeSource: 'ua',
        hasRemote: true,
        supportsGestures: /\b(tizen|webos|appletv)\b/i.test(uaLower),
        supportsLongPress: true,
        supportsDoubleTap: false,
        raw: { ua },
      };
      return caps;
    }
  } catch (err) {
    // swallow and return defaults
    // eslint-disable-next-line no-console
    console.warn('probePlatformCapabilities error', err);
  }

  return defaults;
}

/**
 * Optionally integrates probePlatformCapabilities with any existing detectPlatform logic.
 * Returns the PlatformCapabilities object for the app to use.
 */
export function detectPlatformEnhanced(): PlatformCapabilities {
  return probePlatformCapabilities();
}
