// Enhanced platform detection for TV and screen applications
// Provides comprehensive detection of TV platforms and their specific capabilities

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
  maxResolution: string;
  audioCodecs: string[];
  videoCodecs: string[];
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
 * Enhanced TV platform detection using comprehensive user agent analysis
 */
export function detectTVPlatform(userAgent: string): TVPlatform {
  const ua = userAgent.toLowerCase();
  
  // Samsung Tizen detection
  if (ua.includes('tizen') || ua.includes('samsung') && ua.includes('smart')) {
    return 'samsung_tizen';
  }
  
  // LG webOS detection
  if (ua.includes('webos') || ua.includes('netcast') || (ua.includes('lg') && ua.includes('smart'))) {
    return 'lg_webos';
  }
  
  // Roku detection
  if (ua.includes('roku') || ua.includes('rokutv')) {
    return 'roku';
  }
  
  // Amazon Fire TV detection
  if (ua.includes('afts') || ua.includes('aftb') || ua.includes('aftt') || 
      ua.includes('fire tv') || ua.includes('firetv') || ua.includes('amazon')) {
    return 'amazon_fire_tv';
  }
  
  // Android TV detection
  if (ua.includes('android') && (ua.includes('tv') || ua.includes('googletv') || 
      ua.includes('chromecast') || ua.includes('androidtv'))) {
    return 'android_tv';
  }
  
  // Chromecast detection
  if (ua.includes('chromecast') || ua.includes('cast')) {
    return 'chromecast';
  }
  
  // Apple TV detection
  if (ua.includes('apple tv') || ua.includes('appletv') || ua.includes('tvos')) {
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
    maxResolution: '1080p',
    audioCodecs: ['aac', 'mp3'],
    videoCodecs: ['h264']
  };

  switch (platform) {
    case 'screens_samsung_tizen':
      return {
        ...baseCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsHDMI_CEC: true,
        supportsGamepad: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'dts', 'dolby'],
        videoCodecs: ['h264', 'h265', 'vp9', 'av1']
      };
      
    case 'screens_lg_webos':
      return {
        ...baseCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsHDMI_CEC: true,
        supportsGamepad: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'dts', 'dolby'],
        videoCodecs: ['h264', 'h265', 'vp9']
      };
      
    case 'screens_roku':
      return {
        ...baseCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'dolby'],
        videoCodecs: ['h264', 'h265']
      };
      
    case 'screens_amazon_fire':
      return {
        ...baseCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsHDMI_CEC: true,
        supportsGamepad: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'dolby'],
        videoCodecs: ['h264', 'h265', 'vp9']
      };
      
    case 'screens_android_tv':
      return {
        ...baseCapabilities,
        supportsRemoteNavigation: true,
        supports4K: true,
        supportsHDR: true,
        supportsVoiceControl: true,
        supportsHDMI_CEC: true,
        supportsGamepad: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'opus', 'dolby'],
        videoCodecs: ['h264', 'h265', 'vp8', 'vp9', 'av1']
      };
      
    case 'screens_android_mobile':
      return {
        ...baseCapabilities,
        supportsTouch: true,
        supportsKeyboard: true,
        supports4K: false,
        maxResolution: '1080p',
        audioCodecs: ['aac', 'mp3', 'opus'],
        videoCodecs: ['h264', 'vp8', 'vp9']
      };
      
    case 'screens_ios':
      return {
        ...baseCapabilities,
        supportsTouch: true,
        supportsKeyboard: true,
        supports4K: false,
        maxResolution: '1080p',
        audioCodecs: ['aac', 'mp3'],
        videoCodecs: ['h264', 'h265']
      };
      
    case 'screens_windows':
    case 'screens_macos':
    case 'screens_linux':
      return {
        ...baseCapabilities,
        supportsKeyboard: true,
        supportsGamepad: true,
        supports4K: true,
        maxResolution: '4K',
        audioCodecs: ['aac', 'mp3', 'opus', 'flac'],
        videoCodecs: ['h264', 'h265', 'vp8', 'vp9', 'av1']
      };
      
    default:
      return baseCapabilities;
  }
}

/**
 * Get display information based on user agent and screen properties
 */
export function getDisplayInfo(userAgent: string): DisplayInfo {
  const ua = userAgent.toLowerCase();
  const tvPlatform = detectTVPlatform(ua);
  
  const isTV = tvPlatform !== 'unknown_tv';
  const isMobile = ua.includes('mobile') || ua.includes('iphone') || ua.includes('android') && !ua.includes('tv');
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
  
  // Detect orientation if possible
  let orientation: DisplayInfo['orientation'] = 'unknown';
  if (typeof window !== 'undefined' && window.screen) {
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
 * Get comprehensive platform information
 */
export function detectPlatform(userAgent: string = navigator.userAgent): PlatformInfo {
  const platform = detectScreenPlatform(userAgent);
  const tvPlatform = detectTVPlatform(userAgent);
  const capabilities = getPlatformCapabilities(platform, tvPlatform);
  const displayInfo = getDisplayInfo(userAgent);
  
  return {
    platform,
    tvPlatform: tvPlatform !== 'unknown_tv' ? tvPlatform : undefined,
    capabilities,
    userAgent,
    displayInfo
  };
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
  
  return {
    // Memory optimizations for TV platforms
    enableMemoryOptimization: true,
    maxConcurrentStreams: 2,
    bufferSize: platform === 'screens_roku' ? '512MB' : '1GB',
    
    // Rendering optimizations
    enableHardwareAcceleration: true,
    maxTextureSize: platform === 'screens_roku' ? 2048 : 4096,
    enableVSync: true,
    
    // Network optimizations
    enableAdaptiveBitrate: true,
    maxBitrate: capabilities => capabilities.supports4K ? '25Mbps' : '10Mbps',
    
    // Input optimizations
    remoteNavigationDelay: 150, // ms
    focusIndicatorSize: 'large',
    enableSpatialNavigation: true
  };
}