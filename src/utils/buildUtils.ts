import { getBuildConfig, getPlatformCapabilities } from '@/config/buildConfig';

// Build validation utilities
export const validateBuildTarget = (target: string): boolean => {
  const validTargets = ['web', 'mobile', 'screen', 'screen-desktop', 'screen-tv', 'screen-kiosk'];
  return validTargets.includes(target);
};

// Platform detection utilities
export const detectPlatform = (): string => {
  // Electron detection
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return 'electron';
  }
  
  // Capacitor detection
  if (typeof window !== 'undefined' && (window as any).Capacitor) {
    return 'capacitor';
  }
  
  // Smart TV detection
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('smart-tv') || userAgent.includes('smarttv')) {
      return 'smart-tv';
    }
    
    if (userAgent.includes('tizen')) {
      return 'samsung-tizen';
    }
    
    if (userAgent.includes('webos')) {
      return 'lg-webos';
    }
    
    if (userAgent.includes('roku')) {
      return 'roku';
    }
    
    if (userAgent.includes('android') && userAgent.includes('tv')) {
      return 'android-tv';
    }
  }
  
  return 'web';
};

// Feature availability based on platform
export const getAvailableFeatures = () => {
  const platform = detectPlatform();
  const config = getBuildConfig();
  const capabilities = getPlatformCapabilities();
  
  return {
    // Core features
    contentDisplay: true,
    scheduling: true,
    analytics: capabilities.supportsOfflineMode,
    
    // Platform-specific features
    fullscreenMode: capabilities.supportsFullscreen,
    kioskMode: capabilities.supportsKioskMode && platform === 'electron',
    multiDisplay: capabilities.supportsMultiDisplay && platform === 'electron',
    remoteControl: capabilities.supportsRemoteControl,
    
    // Security features
    adminAccess: capabilities.supportsAdminLock,
    secureMode: capabilities.supportsSecureBoot,
    emergencyAccess: platform !== 'web',
    
    // Content features
    videoPlayback: true,
    imageDisplay: true,
    webContent: platform !== 'roku', // Roku has limited web support
    liveStreaming: platform !== 'web' || config.target === 'screen',
    
    // Network features
    offlineMode: capabilities.supportsOfflineMode,
    contentCaching: capabilities.supportsContentCaching,
    realTimeSync: true,
  };
};

// Build optimization utilities
export const getBuildOptimizations = () => {
  const config = getBuildConfig();
  const platform = detectPlatform();
  
  const optimizations = {
    // Base optimizations
    treeshaking: true,
    minification: true,
    compression: true,
    
    // Screen-specific optimizations
    ...(config.target === 'screen' && {
      preloadCriticalAssets: true,
      optimizeForLargeScreens: true,
      enableHardwareAcceleration: true,
    }),
    
    // TV-specific optimizations
    ...(config.isTVOptimized && {
      optimizeForTenFoot: true,
      enableRemoteNavigation: true,
      reduceAnimations: true, // Better for TV performance
    }),
    
    // Kiosk-specific optimizations
    ...(config.isKioskMode && {
      removeDevTools: true,
      disableRightClick: true,
      preventZoom: true,
    }),
    
    // Platform-specific optimizations
    ...(platform === 'electron' && {
      bundleNodeModules: true,
      enableNativeOptimizations: true,
    }),
  };
  
  return optimizations;
};

// Asset optimization for different build targets
export const getAssetOptimizations = () => {
  const config = getBuildConfig();
  
  return {
    // Image optimizations
    images: {
      formats: config.target === 'screen' ? ['webp', 'avif', 'jpg'] : ['webp', 'jpg'],
      quality: config.target === 'screen' ? 90 : 80,
      sizes: config.isTVOptimized ? [1920, 3840] : [480, 768, 1024, 1920],
    },
    
    // Video optimizations
    video: {
      formats: config.target === 'screen' ? ['h264', 'h265'] : ['h264'],
      bitrates: config.isTVOptimized ? ['high', 'ultra'] : ['low', 'medium', 'high'],
      preload: config.target === 'screen',
    },
    
    // Font optimizations
    fonts: {
      formats: ['woff2', 'woff'],
      subset: !config.isTVOptimized, // Don't subset for TV (better language support)
      preload: config.target === 'screen',
    },
  };
};