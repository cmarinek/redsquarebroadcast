// probePlatformCapabilities and detectPlatformEnhanced
// Conservative fallbacks for unknown runtimes.

import { getBuildConfig } from '../config/buildConfig';

export type ProbeSource = 'runtime' | 'ua' | 'unknown';

export interface PlatformCapabilities {
  probeSource: ProbeSource;
  hasRemote: boolean;
  supportsGestures: boolean;
  supportsLongPress: boolean;
  supportsDoubleTap: boolean;
  supportsRemoteNavigation?: boolean;
  supports4K?: boolean;
  supportsVoiceControl?: boolean;
  supportsTouch?: boolean;
  supportsHDMI_CEC?: boolean;
  maxResolution?: string;
  maxMemory?: string;
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

// Additional exports needed by other modules
export function detectPlatform() {
  const buildConfig = getBuildConfig();
  return {
    platform: buildConfig.platform || 'web',
    tvPlatform: buildConfig.tvPlatform,
    capabilities: probePlatformCapabilities(),
    displayInfo: {
      width: window.screen?.width || 1920,
      height: window.screen?.height || 1080,
      screenSize: 'large' as const,
      isTV: buildConfig.target === 'screen' && buildConfig.isTVOptimized,
      isDesktop: buildConfig.target === 'web',
      isMobile: buildConfig.target === 'mobile',
      isTablet: false
    }
  };
}

export function isTVPlatform(platform?: string): boolean {
  const tvPlatforms = ['samsung_tizen', 'lg_webos', 'roku', 'amazon_fire_tv', 'android_tv', 'chromecast'];
  return platform ? tvPlatforms.includes(platform) : false;
}

export function getTVOptimizations(platform?: string) {
  if (!isTVPlatform(platform)) return {};
  
  return {
    enableHardwareAcceleration: true,
    enableRemoteNavigation: true,
    optimizeForTenFootUI: true,
    spatialNavigation: true
  };
}

export type ScreenPlatform = 'web' | 'mobile' | 'tv' | 'screen';
