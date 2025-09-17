// Build configuration for RedSquare applications
export interface BuildConfig {
  target: 'web' | 'mobile' | 'screen';
  isTVOptimized?: boolean;
  isKioskMode?: boolean;
  platform?: string;
  tvPlatform?: TVPlatformType;
  performanceMode?: 'low' | 'medium' | 'high' | 'ultra';
}

export type TVPlatformType = 
  | 'samsung_tizen' 
  | 'lg_webos' 
  | 'roku' 
  | 'amazon_fire_tv' 
  | 'android_tv' 
  | 'chromecast' 
  | 'generic_tv';

export const getBuildConfig = (): BuildConfig => {
  return {
    target: (import.meta.env.VITE_BUILD_TARGET as BuildConfig['target']) || 'web',
    isTVOptimized: import.meta.env.VITE_TV_OPTIMIZED === 'true',
    isKioskMode: import.meta.env.VITE_KIOSK_MODE === 'true',
    platform: import.meta.env.VITE_PLATFORM || 'generic',
    tvPlatform: import.meta.env.VITE_TV_PLATFORM as TVPlatformType || 'generic_tv',
    performanceMode: (import.meta.env.VITE_PERFORMANCE_MODE as BuildConfig['performanceMode']) || 'medium',
  };
};

export const isScreenApplication = (): boolean => {
  return getBuildConfig().target === 'screen';
};

export const isTVOptimized = (): boolean => {
  return getBuildConfig().isTVOptimized === true;
};

export const isKioskMode = (): boolean => {
  return getBuildConfig().isKioskMode === true;
};

// Platform-specific feature detection
export const getPlatformCapabilities = () => {
  const config = getBuildConfig();
  
  return {
    // Display capabilities
    supportsFullscreen: true,
    supportsKioskMode: config.isKioskMode,
    supportsTVNavigation: config.isTVOptimized,
    
    // Hardware capabilities
    supportsHardwareAcceleration: config.target !== 'web',
    supportsMultiDisplay: config.target === 'screen',
    supportsRemoteControl: config.isTVOptimized,
    
    // Security capabilities
    supportsSecureBoot: config.target === 'screen' && config.isKioskMode,
    supportsAdminLock: config.target === 'screen',
    
    // Network capabilities
    supportsOfflineMode: config.target !== 'web',
    supportsContentCaching: config.target === 'screen',
  };
};

// Screen-specific optimizations
export const getScreenOptimizations = () => {
  const config = getBuildConfig();
  
  if (config.target !== 'screen') return {};
  
  const baseOptimizations = {
    // Performance optimizations
    enableHardwareAcceleration: true,
    preloadContent: true,
    optimizeForLargeSreens: true,
  };
  
  const tvOptimizations = config.isTVOptimized ? {
    enableRemoteNavigation: true,
    optimizeForTenFootUI: true,
    enableVoiceControl: true,
    spatialNavigation: true,
    focusManagement: 'tv',
    renderingOptimizations: getTVRenderingOptimizations(config),
    memoryOptimizations: getTVMemoryOptimizations(config),
    networkOptimizations: getTVNetworkOptimizations(config),
  } : {};
  
  const kioskOptimizations = config.isKioskMode ? {
    lockDownInterface: true,
    disableContextMenus: true,
    preventNavigation: true,
    enableSecureMode: true,
    fullscreenMode: true,
    disableSystemUI: true,
  } : {};
  
  return {
    ...baseOptimizations,
    ...tvOptimizations,
    ...kioskOptimizations,
  };
};

// TV-specific rendering optimizations
export const getTVRenderingOptimizations = (config: BuildConfig) => {
  const performanceLevel = config.performanceMode || 'medium';
  
  const baseSettings = {
    enableVSync: true,
    frameRateLimit: 60,
    enableHardwareDecoding: true,
  };
  
  switch (performanceLevel) {
    case 'low':
      return {
        ...baseSettings,
        maxTextureSize: 1024,
        renderScale: 0.75,
        shadowQuality: 'disabled',
        antiAliasing: 'disabled',
        frameRateLimit: 30,
      };
    case 'medium':
      return {
        ...baseSettings,
        maxTextureSize: 2048,
        renderScale: 1.0,
        shadowQuality: 'low',
        antiAliasing: 'fxaa',
      };
    case 'high':
      return {
        ...baseSettings,
        maxTextureSize: 4096,
        renderScale: 1.0,
        shadowQuality: 'medium',
        antiAliasing: 'msaa_2x',
      };
    case 'ultra':
      return {
        ...baseSettings,
        maxTextureSize: 8192,
        renderScale: 1.25,
        shadowQuality: 'high',
        antiAliasing: 'msaa_4x',
      };
    default:
      return baseSettings;
  }
};

// TV-specific memory optimizations
export const getTVMemoryOptimizations = (config: BuildConfig) => {
  const isLowEndTV = config.tvPlatform === 'roku' || config.performanceMode === 'low';
  
  return {
    enableMemoryPooling: true,
    maxCacheSize: isLowEndTV ? '256MB' : '512MB',
    enableGarbageCollection: true,
    enableTextureCompression: true,
    maxConcurrentTextures: isLowEndTV ? 32 : 64,
    enableAssetStreaming: true,
    enableLODSystem: true, // Level of Detail
    enableOcclusion: !isLowEndTV,
  };
};

// TV-specific network optimizations
export const getTVNetworkOptimizations = (config: BuildConfig) => {
  return {
    enableAdaptiveBitrate: true,
    enableNetworkCaching: true,
    maxConcurrentConnections: 4,
    enableCompression: true,
    enablePrefetching: config.performanceMode !== 'low',
    bufferSize: config.performanceMode === 'low' ? '5MB' : '10MB',
    enableOfflineMode: true,
  };
};

// Platform-specific performance profiles
export const getPlatformPerformanceProfile = (tvPlatform: TVPlatformType) => {
  switch (tvPlatform) {
    case 'samsung_tizen':
      return {
        memoryLimit: '1GB',
        cpuCores: 4,
        gpuTier: 'high',
        supportedCodecs: ['h264', 'h265', 'vp9', 'av1'],
        maxResolution: '4K',
        hdrSupport: true,
        recommendedPerformance: 'high' as const,
      };
    case 'lg_webos':
      return {
        memoryLimit: '1GB',
        cpuCores: 4,
        gpuTier: 'high',
        supportedCodecs: ['h264', 'h265', 'vp9'],
        maxResolution: '4K',
        hdrSupport: true,
        recommendedPerformance: 'high' as const,
      };
    case 'android_tv':
      return {
        memoryLimit: '2GB',
        cpuCores: 4,
        gpuTier: 'medium',
        supportedCodecs: ['h264', 'h265', 'vp8', 'vp9', 'av1'],
        maxResolution: '4K',
        hdrSupport: true,
        recommendedPerformance: 'medium' as const,
      };
    case 'amazon_fire_tv':
      return {
        memoryLimit: '1GB',
        cpuCores: 4,
        gpuTier: 'medium',
        supportedCodecs: ['h264', 'h265', 'vp9'],
        maxResolution: '4K',
        hdrSupport: true,
        recommendedPerformance: 'medium' as const,
      };
    case 'roku':
      return {
        memoryLimit: '512MB',
        cpuCores: 1,
        gpuTier: 'low',
        supportedCodecs: ['h264', 'h265'],
        maxResolution: '4K',
        hdrSupport: false,
        recommendedPerformance: 'low' as const,
      };
    case 'chromecast':
      return {
        memoryLimit: '512MB',
        cpuCores: 2,
        gpuTier: 'low',
        supportedCodecs: ['h264', 'vp8', 'vp9'],
        maxResolution: '1080p',
        hdrSupport: false,
        recommendedPerformance: 'low' as const,
      };
    default:
      return {
        memoryLimit: '512MB',
        cpuCores: 2,
        gpuTier: 'low',
        supportedCodecs: ['h264'],
        maxResolution: '1080p',
        hdrSupport: false,
        recommendedPerformance: 'low' as const,
      };
  }
};