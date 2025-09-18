// Enhanced platform detection for TV and screen applications
// Provides comprehensive detection of TV platforms and their specific capabilities
// This modified file:
// - Adds safe SSR guards everywhere navigator/window may be absent.
// - Introduces probePlatformCapabilities (runtime-first, conservative probe + UA fallback).
// - Makes PlatformInfo include optional probeSource to indicate whether capabilities
//   came from runtime probes or UA heuristics.
// - Ensures detectPlatform merges repo capability defaults with lightweight runtime hints
//   without throwing or blocking.

export type TVPlatform =
  | 'samsung_tizen'
  | 'lg_webos'
  | 'roku'
  | 'amazon_fire_tv'
  | 'android_tv'
  | 'chromecast'
  | 'apple_tv'
  | 'unknown_tv';

export type ScreenPlatform =
  | 'screens_android_mobile'
  | 'screens_ios'
  | 'screens_windows'
  | 'screens_macos'
  | 'screens_linux'
  | 'screens_android_tv'
  | 'screens_amazon_fire'
  | 'screens_roku'
  | 'screens_samsung_tizen'
  | 'screens_lg_webos'
  | 'unknown';

export interface PlatformInfo {
  platform: ScreenPlatform;
  tvPlatform?: TVPlatform;
  capabilities: PlatformCapabilities;
  userAgent: string;
  displayInfo: DisplayInfo;
  // Optional probe source describing whether runtime probes or UA heuristics were used.
  probeSource?: 'runtime' | 'ua';
}

export interface PlatformCapabilities {
  supportsRemoteNavigation: boolean;
  supports4K: boolean;
  supportsHDR: boolean;
  supportsVoiceControl: boolean;
  supportsHDMI_CEC: boolean;
  supportsTouch: boolean;
  supportsKeyboard: boolean;
  supportsGamepad: boolean;
  supportsGestureControl: boolean;
  supportsAmbientMode: boolean;
  supportsScreenSaver: boolean;
  supportsPictureInPicture: boolean;
  supportsMultipleDisplays: boolean;
  maxResolution: string;
  audioCodecs: string[];
  videoCodecs: string[];
  networkInterfaces: string[];
  storageTypes: string[];
  maxMemory: string;
  cpuArchitecture: string;
  graphicsAPI: string[];
}

export interface DisplayInfo {
  isTV: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'extra_large';
  orientation: 'portrait' | 'landscape' | 'unknown';
}

/**
 * Runtime feature detection for TV platforms
 * Tests actual device capabilities beyond user agent detection.
 * Defensive: returns an empty object on SSR or on error.
 */
export function detectRuntimeFeatures(): Partial<PlatformCapabilities> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {};
  }

  const features: Partial<PlatformCapabilities> = {};

  try {
    // Test for gamepad support
    if ('getGamepads' in navigator || 'webkitGetGamepads' in navigator) {
      features.supportsGamepad = true;
    }

    // Test for voice recognition APIs (heuristic)
    // webkitSpeechRecognition and SpeechRecognition may be globals on some browsers
    if (typeof (window as any).SpeechRecognition !== 'undefined' || typeof (window as any).webkitSpeechRecognition !== 'undefined' || typeof (navigator as any).mediaSession !== 'undefined') {
      features.supportsVoiceControl = true;
    }

    // Test for HDR support via colorDepth hint (very heuristic)
    if (window.screen && typeof (window.screen as any).colorDepth === 'number') {
      const colorDepth = (window.screen as any).colorDepth;
      // 30+ bit hints at 10-bit color; conservative threshold
      if (colorDepth >= 30) {
        features.supportsHDR = true;
      }
    }

    // Test for 4K support (screen dimension hint)
    if (window.screen && typeof window.screen.width === 'number' && typeof window.screen.height === 'number') {
      const maxWidth = Math.max(window.screen.width, window.screen.height);
      if (maxWidth >= 3840) {
        features.supports4K = true;
      }
    }

    // Picture-in-Picture support
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      features.supportsPictureInPicture = (document as any).pictureInPictureEnabled === true;
    }

    // Touch support
    try {
      const maxTouchPoints = (navigator as any).maxTouchPoints;
      features.supportsTouch = 'ontouchstart' in window || (typeof maxTouchPoints === 'number' && maxTouchPoints > 0);
    } catch (e) {
      // ignore
    }

    // Keyboard support hint
    features.supportsKeyboard = 'onkeydown' in window;

    // Network interfaces hint
    const networkInterfaces: string[] = [];
    try {
      // navigator.connection presence only hints at more modern networking info
      // we avoid reading types that might not be available cross-browser
      if ((navigator as any).connection) {
        networkInterfaces.push('wifi'); // best-effort guess
        // add any declared type if present
        const connType = (navigator as any).connection.type;
        if (typeof connType === 'string' && connType.length > 0) {
          networkInterfaces.push(connType);
        }
      }
    } catch (e) {
      // ignore
    }
    if (networkInterfaces.length > 0) features.networkInterfaces = networkInterfaces;

    // Provide conservative runtime video/audio codec hints if modern APIs exist
    try {
      // If mediaCapabilities is present it's a hint that modern codecs may be supported
      if ((navigator as any).mediaCapabilities || (navigator as any).mediaDevices) {
        features.videoCodecs = ['h264'];
        // add HEVC hint only if we see a modern UA or platform flag in userAgentData
        if ((navigator as any).userAgentData && (navigator as any).userAgentData.brands) {
          features.videoCodecs.push('h265');
        }
      }
    } catch (e) {
      // ignore
    }
  } catch (err) {
    // swallow any unexpected runtime errors and remain conservative
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('detectRuntimeFeatures failed', err);
    }
  }

  return features;
}

/**
 * Conservative runtime-first capability probe with UA fallback.
 * Returns partial capabilities and a probe source indicator.
 */
export function probePlatformCapabilities(userAgent: string = (typeof navigator !== 'undefined' ? navigator.userAgent : '')): { capabilities: Partial<PlatformCapabilities>, probeSource: 'runtime' | 'ua' } {
  const ua = userAgent ? userAgent.toLowerCase() : '';

  // Try runtime features first
  try {
    const runtimeHints = detectRuntimeFeatures();
    if (runtimeHints && Object.keys(runtimeHints).length > 0) {
      return { capabilities: runtimeHints, probeSource: 'runtime' };
    }
  } catch (e) {
    // swallow errors and fall back to UA below
    // eslint-disable-next-line no-console
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Runtime capability probe failed, falling back to UA mapping', e);
    }
  }

  // UA-based conservative mapping (fallback)
  const uaCapabilities: Partial<PlatformCapabilities> = {};
  if (ua.includes('tizen') || ua.includes('samsung')) {
    uaCapabilities.supportsRemoteNavigation = true;
    uaCapabilities.supports4K = true;
    uaCapabilities.supportsHDR = true;
  } else if (ua.includes('webos') || ua.includes('lg')) {
    uaCapabilities.supportsRemoteNavigation = true;
    uaCapabilities.supports4K = true;
  } else if (ua.includes('roku')) {
    uaCapabilities.supportsRemoteNavigation = true;
    uaCapabilities.supports4K = true;
  } else if (ua.includes('android') && ua.includes('tv')) {
    uaCapabilities.supportsRemoteNavigation = true;
    uaCapabilities.supportsGamepad = true;
  } else if (ua.includes('fire tv') || ua.includes('aft') || ua.includes('amazon')) {
    uaCapabilities.supportsRemoteNavigation = true;
  } else {
    uaCapabilities.supportsRemoteNavigation = false;
    uaCapabilities.supports4K = false;
  }

  return { capabilities: uaCapabilities, probeSource: 'ua' };
}

/**
 * Enhanced TV platform detection using comprehensive user agent analysis
 */
export function detectTVPlatform(userAgent: string): TVPlatform {
  const ua = userAgent.toLowerCase();

  // Enhanced Samsung Tizen detection
  if (ua.includes('tizen') ||
    (ua.includes('samsung') && (ua.includes('smart') || ua.includes('tv'))) ||
    ua.includes('maple') ||
    (typeof window !== 'undefined' && (window as any).location && (window as any).location.protocol === 'tizen-wgt:')) {
    return 'samsung_tizen';
  }

  // Enhanced LG webOS detection
  if (ua.includes('webos') ||
    ua.includes('netcast') ||
    (ua.includes('lg') && ua.includes('smart')) ||
    ua.includes('weboswebkit') ||
    (typeof window !== 'undefined' && (window as any).location && (window as any).location.protocol === 'webos:')) {
    return 'lg_webos';
  }

  // Enhanced Roku detection
  if (ua.includes('roku') ||
    ua.includes('rokutv') ||
    ua.includes('rokunp') ||
    (typeof window !== 'undefined' && (window as any).location && (window as any).location.protocol === 'roku:')) {
    return 'roku';
  }

  // Enhanced Amazon Fire TV detection
  if (ua.includes('afts') ||
    ua.includes('aftb') ||
    ua.includes('aftt') ||
    ua.includes('aftm') ||
    ua.includes('fire tv') ||
    ua.includes('firetv') ||
    (ua.includes('amazon') && ua.includes('silk'))) {
    return 'amazon_fire_tv';
  }

  // Enhanced Android TV detection
  if (ua.includes('android') &&
    (ua.includes('tv') ||
      ua.includes('googletv') ||
      ua.includes('androidtv') ||
      ua.includes('shield') ||
      ua.includes('mibox') ||
      ua.includes('nexusplayer'))) {
    return 'android_tv';
  }

  // Enhanced Chromecast detection
  if (ua.includes('chromecast') ||
    ua.includes('cast') ||
    ua.includes('crkey') ||
    (typeof window !== 'undefined' && (window as any).location && (window as any).location.protocol === 'cast:')) {
    return 'chromecast';
  }

  // Apple TV detection
  if (ua.includes('apple tv') ||
    ua.includes('appletv') ||
    ua.includes('tvos') ||
    (ua.includes('safari') && ua.includes('tv'))) {
    return 'apple_tv';
  }

  return 'unknown_tv';
}

/**
 * Enhanced screen platform detection with TV platform integration
 */
export function detectScreenPlatform(userAgent: string): ScreenPlatform {
  const ua = userAgent.toLowerCase();

  // First check for TV platforms
  const tvPlatform = detectTVPlatform(ua);

  switch (tvPlatform) {
    case 'samsung_tizen':
      return 'screens_samsung_tizen';
    case 'lg_webos':
      return 'screens_lg_webos';
    case 'roku':
      return 'screens_roku';
    case 'amazon_fire_tv':
      return 'screens_amazon_fire';
    case 'android_tv':
    case 'chromecast':
      return 'screens_android_tv';
    default:
      break;
  }

  // Mobile and desktop detection
  if (ua.includes('android') && !ua.includes('tv')) {
    return 'screens_android_mobile';
  }

  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return 'screens_ios';
  }

  if (ua.includes('mac os') || ua.includes('macintosh')) {
    return 'screens_macos';
  }

  if (ua.includes('windows')) {
    return 'screens_windows';
  }

  if (ua.includes('linux') && !ua.includes('android')) {
    return 'screens_linux';
  }

  return 'unknown';
}

/**
 * Get platform-specific capabilities based on detected platform
 */
export function getPlatformCapabilities(platform: ScreenPlatform, tvPlatform?: TVPlatform): PlatformCapabilities {
  const baseCapabilities: PlatformCapabilities = {
    supportsRemoteNavigation: false,
    supports4K: false,
    supportsHDR: false,
    supportsVoiceControl: false,
    supportsHDMI_CEC: false,
    supportsTouch: false,
    supportsKeyboard: false,
    supportsGamepad: false,
    supportsGestureControl: false,
    supportsAmbientMode: false,
    supportsScreenSaver: false,
    supportsPictureInPicture: false,
    supportsMultipleDisplays: false,
    maxResolution: '1080p',
    audioCodecs: ['aac', 'mp3'],
    videoCodecs: ['h264'],
    networkInterfaces: ['wifi'],
    storageTypes: ['flash'],
    maxMemory: '512MB',
    cpuArchitecture: 'arm',
    graphicsAPI: ['canvas2d']
  };

  // Merge runtime detected features
  const runtimeFeatures = detectRuntimeFeatures();
  const mergedCapabilities = { ...baseCapabilities, ...runtimeFeatures };

  switch (platform) {
    case 'screens_samsung_tizen':
      return {
        ...mergedCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsHDMI_CEC: true,
        supportsGamepad: true,
        supportsGestureControl: true,
        supportsAmbientMode: true,
        supportsScreenSaver: true,
        supportsPictureInPicture: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'dts', 'dolby', 'opus'],
        videoCodecs: ['h264', 'h265', 'vp9', 'av1'],
        networkInterfaces: ['wifi', 'ethernet', 'bluetooth'],
        storageTypes: ['flash', 'hdd'],
        maxMemory: '2GB',
        cpuArchitecture: 'arm64',
        graphicsAPI: ['webgl', 'canvas2d', 'vulkan']
      };

    case 'screens_lg_webos':
      return {
        ...mergedCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsHDMI_CEC: true,
        supportsGamepad: true,
        supportsGestureControl: true,
        supportsAmbientMode: true,
        supportsScreenSaver: true,
        supportsPictureInPicture: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'dts', 'dolby', 'opus'],
        videoCodecs: ['h264', 'h265', 'vp9'],
        networkInterfaces: ['wifi', 'ethernet', 'bluetooth'],
        storageTypes: ['flash'],
        maxMemory: '2GB',
        cpuArchitecture: 'arm64',
        graphicsAPI: ['webgl', 'canvas2d']
      };

    case 'screens_roku':
      return {
        ...mergedCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsScreenSaver: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'dolby'],
        videoCodecs: ['h264', 'h265'],
        networkInterfaces: ['wifi', 'ethernet'],
        storageTypes: ['flash'],
        maxMemory: '512MB',
        cpuArchitecture: 'arm',
        graphicsAPI: ['canvas2d']
      };

    case 'screens_amazon_fire':
      return {
        ...mergedCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsHDMI_CEC: true,
        supportsGamepad: true,
        supportsScreenSaver: true,
        supportsPictureInPicture: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'dolby', 'opus'],
        videoCodecs: ['h264', 'h265', 'vp9'],
        networkInterfaces: ['wifi', 'ethernet', 'bluetooth'],
        storageTypes: ['flash'],
        maxMemory: '2GB',
        cpuArchitecture: 'arm64',
        graphicsAPI: ['webgl', 'canvas2d']
      };

    case 'screens_android_tv':
      return {
        ...mergedCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsHDMI_CEC: true,
        supportsGamepad: true,
        supportsGestureControl: true,
        supportsScreenSaver: true,
        supportsPictureInPicture: true,
        supportsMultipleDisplays: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'opus', 'dolby', 'flac'],
        videoCodecs: ['h264', 'h265', 'vp8', 'vp9', 'av1'],
        networkInterfaces: ['wifi', 'ethernet', 'bluetooth', 'cellular'],
        storageTypes: ['flash', 'hdd', 'ssd'],
        maxMemory: '4GB',
        cpuArchitecture: 'arm64',
        graphicsAPI: ['webgl', 'canvas2d', 'vulkan']
      };

    case 'screens_android_mobile':
      return {
        ...mergedCapabilities,
        supportsTouch: true,
        supportsKeyboard: true,
        supportsGamepad: true,
        supportsVoiceControl: true,
        supportsGestureControl: true,
        supportsPictureInPicture: true,
        supports4K: false,
        maxResolution: '1080p',
        audioCodecs: ['aac', 'mp3', 'opus', 'flac'],
        videoCodecs: ['h264', 'vp8', 'vp9'],
        networkInterfaces: ['wifi', 'cellular', 'bluetooth'],
        storageTypes: ['flash'],
        maxMemory: '8GB',
        cpuArchitecture: 'arm64',
        graphicsAPI: ['webgl', 'canvas2d', 'vulkan']
      };

    case 'screens_ios':
      return {
        ...mergedCapabilities,
        supportsTouch: true,
        supportsKeyboard: true,
        supportsVoiceControl: true,
        supportsGestureControl: true,
        supportsPictureInPicture: true,
        supports4K: false,
        maxResolution: '1080p',
        audioCodecs: ['aac', 'mp3'],
        videoCodecs: ['h264', 'h265'],
        networkInterfaces: ['wifi', 'cellular', 'bluetooth'],
        storageTypes: ['flash'],
        maxMemory: '8GB',
        cpuArchitecture: 'arm64',
        graphicsAPI: ['webgl', 'canvas2d', 'metal']
      };

    case 'screens_windows':
    case 'screens_macos':
    case 'screens_linux':
      return {
        ...mergedCapabilities,
        supportsKeyboard: true,
        supportsGamepad: true,
        supportsVoiceControl: true,
        supportsPictureInPicture: true,
        supportsMultipleDisplays: true,
        supports4K: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'opus', 'flac', 'wav'],
        videoCodecs: ['h264', 'h265', 'vp8', 'vp9', 'av1'],
        networkInterfaces: ['wifi', 'ethernet', 'bluetooth'],
        storageTypes: ['hdd', 'ssd', 'nvme'],
        maxMemory: '32GB',
        cpuArchitecture: platform === 'screens_macos' ? 'arm64' : 'x64',
        graphicsAPI: ['webgl', 'canvas2d', 'directx', 'vulkan', 'opengl']
      };

    default:
      return mergedCapabilities;
  }
}

/**
 * Get display information based on user agent and screen properties
 */
export function getDisplayInfo(userAgent: string): DisplayInfo {
  const ua = userAgent.toLowerCase();
  const tvPlatform = detectTVPlatform(ua);

  const isTV = tvPlatform !== 'unknown_tv';
  const isMobile = ua.includes('mobile') || ua.includes('iphone') || (ua.includes('android') && !ua.includes('tv'));
  const isTablet = ua.includes('tablet') || ua.includes('ipad');
  const isDesktop = !isMobile && !isTablet && !isTV;

  let screenSize: DisplayInfo['screenSize'] = 'medium';
  if (isTV) {
    screenSize = 'extra_large';
  } else if (isDesktop) {
    screenSize = 'large';
  } else if (isTablet) {
    screenSize = 'medium';
  } else if (isMobile) {
    screenSize = 'small';
  }

  let orientation: DisplayInfo['orientation'] = 'unknown';
  if (typeof window !== 'undefined' && window.screen && typeof window.screen.width === 'number' && typeof window.screen.height === 'number') {
    orientation = window.screen.width > window.screen.height ? 'landscape' : 'portrait';
  }

  return {
    isTV,
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    orientation
  };
}

/**
 * Get comprehensive platform information with enhanced detection.
 * - Uses runtime probes where possible, falls back to UA-derived heuristics.
 * - Merges runtime hints conservatively into the repo's canonical capabilities.
 */
export function detectPlatform(userAgent: string = (typeof navigator !== 'undefined' ? navigator.userAgent : '')): PlatformInfo {
  const ua = userAgent || '';
  const platform = detectScreenPlatform(ua);
  const tvPlatform = detectTVPlatform(ua);

  // Get canonical capabilities for the platform first (ensures full shape)
  const baseCapabilities = getPlatformCapabilities(platform, tvPlatform);

  // Probe for additional runtime hints (non-blocking, conservative)
  const probeResult = probePlatformCapabilities(ua);
  const probedCapabilities = probeResult.capabilities || {};
  const probeSource = probeResult.probeSource;

  // Merge arrays conservatively and prefer repo defaults, then runtime hints override where safe
  const mergedCapabilities: PlatformCapabilities = {
    ...baseCapabilities,
    ...probedCapabilities,
    audioCodecs: Array.from(new Set([...(baseCapabilities.audioCodecs || []), ...(probedCapabilities.audioCodecs || [])])),
    videoCodecs: Array.from(new Set([...(baseCapabilities.videoCodecs || []), ...(probedCapabilities.videoCodecs || [])])),
    networkInterfaces: Array.from(new Set([...(baseCapabilities.networkInterfaces || []), ...(probedCapabilities.networkInterfaces || [])])),
    storageTypes: Array.from(new Set([...(baseCapabilities.storageTypes || []), ...(probedCapabilities.storageTypes || [])])),
    graphicsAPI: Array.from(new Set([...(baseCapabilities.graphicsAPI || []), ...(probedCapabilities.graphicsAPI || [])]))
  };

  const displayInfo = getDisplayInfo(ua);

  const info: PlatformInfo = {
    platform,
    tvPlatform: tvPlatform !== 'unknown_tv' ? tvPlatform : undefined,
    capabilities: mergedCapabilities,
    userAgent: ua,
    displayInfo,
    probeSource
  };

  return info;
}

/**
 * Check if current platform is a TV platform
 */
export function isTVPlatform(platform: ScreenPlatform): boolean {
  return [
    'screens_samsung_tizen',
    'screens_lg_webos',
    'screens_roku',
    'screens_amazon_fire',
    'screens_android_tv'
  ].includes(platform);
}

/**
 * Get TV-specific performance optimizations
 */
export function getTVOptimizations(platform: ScreenPlatform) {
  if (!isTVPlatform(platform)) return null;

  const capabilities = getPlatformCapabilities(platform);

  return {
    // Memory optimizations for TV platforms
    enableMemoryOptimization: true,
    maxConcurrentStreams: platform === 'screens_roku' ? 1 : 2,
    bufferSize: capabilities.maxMemory === '512MB' ? '256MB' : '512MB',

    // Rendering optimizations
    enableHardwareAcceleration: true,
    maxTextureSize: platform === 'screens_roku' ? 2048 : 4096,
    enableVSync: true,
    frameRateLimit: getOptimalFrameRate(platform),

    // Network optimizations
    enableAdaptiveBitrate: true,
    maxBitrate: capabilities.supports4K ? '25Mbps' : '10Mbps',

    // Input optimizations
    remoteNavigationDelay: 150, // ms
    focusIndicatorSize: 'large',
    enableSpatialNavigation: true,

    // TV-specific UI optimizations
    overscanSafeArea: getOverscanSafeArea(platform),
    tenFootUIScale: getTenFootUIScale(platform),
    highContrastMode: true,
    largeHitTargets: true,

    // Progressive loading
    enableProgressiveImageLoading: true,
    imageCompressionLevel: capabilities.maxMemory === '512MB' ? 'high' : 'medium',

    // Platform-specific optimizations
    platformSpecific: getPlatformSpecificOptimizations(platform)
  };
}

/**
 * Get optimal frame rate for TV platform
 */
function getOptimalFrameRate(platform: ScreenPlatform): number {
  switch (platform) {
    case 'screens_roku':
      return 30; // Lower frame rate for Roku due to hardware limitations
    case 'screens_samsung_tizen':
    case 'screens_lg_webos':
    case 'screens_android_tv':
      return 60; // High-end TVs can handle 60fps
    case 'screens_amazon_fire':
      return 30; // Conservative for Fire TV
    default:
      return 30;
  }
}

/**
 * Get overscan safe area margins for different TV platforms
 */
function getOverscanSafeArea(platform: ScreenPlatform) {
  // Modern smart TVs typically don't have overscan, but we provide safe defaults
  switch (platform) {
    case 'screens_samsung_tizen':
    case 'screens_lg_webos':
      return { top: '2%', right: '2%', bottom: '2%', left: '2%' };
    case 'screens_roku':
    case 'screens_amazon_fire':
      return { top: '5%', right: '5%', bottom: '5%', left: '5%' }; // More conservative
    case 'screens_android_tv':
      return { top: '3%', right: '3%', bottom: '3%', left: '3%' };
    default:
      return { top: '5%', right: '5%', bottom: '5%', left: '5%' };
  }
}

/**
 * Get ten-foot UI scale factor for different platforms
 */
function getTenFootUIScale(platform: ScreenPlatform): number {
  switch (platform) {
    case 'screens_samsung_tizen':
    case 'screens_lg_webos':
      return 1.5; // Larger scale for premium TVs
    case 'screens_android_tv':
      return 1.4;
    case 'screens_roku':
    case 'screens_amazon_fire':
      return 1.3; // Slightly smaller for lower-end hardware
    default:
      return 1.4;
  }
}

/**
 * Get platform-specific optimizations
 */
function getPlatformSpecificOptimizations(platform: ScreenPlatform) {
  switch (platform) {
    case 'screens_samsung_tizen':
      return {
        enableTizenSpecificAPIs: true,
        useNativeMediaPlayer: true,
        enableVoiceRecognition: true,
        supportSmartHub: true
      };
    case 'screens_lg_webos':
      return {
        enableWebOSAPIs: true,
        useLunaService: true,
        enableMagicRemote: true,
        supportWebOSTV: true
      };
    case 'screens_roku':
      return {
        enableBrighterScript: false, // We're using web technologies
        optimizeForLowMemory: true,
        useRokuMediaPlayer: false,
        enableDirectPublisher: false
      };
    case 'screens_amazon_fire':
      return {
        enableFireTVAPIs: true,
        supportAlexa: true,
        enableFlingSDK: true,
        useSilkBrowser: true
      };
    case 'screens_android_tv':
      return {
        enableAndroidTVAPIs: true,
        supportGoogleAssistant: true,
        enableCastSupport: true,
        useChromeWebView: true
      };
    default:
      return {};
  }
}
