// Build configuration for RedSquare applications
export interface BuildConfig {
  target: 'web' | 'mobile' | 'screen';
  isTVOptimized?: boolean;
  isKioskMode?: boolean;
  platform?: string;
}

export const getBuildConfig = (): BuildConfig => {
  return {
    target: (import.meta.env.VITE_BUILD_TARGET as BuildConfig['target']) || 'web',
    isTVOptimized: import.meta.env.VITE_TV_OPTIMIZED === 'true',
    isKioskMode: import.meta.env.VITE_KIOSK_MODE === 'true',
    platform: import.meta.env.VITE_PLATFORM || 'generic',
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
  
  return {
    // Performance optimizations
    enableHardwareAcceleration: true,
    preloadContent: true,
    optimizeForLargeSreens: true,
    
    // TV-specific optimizations
    ...(config.isTVOptimized && {
      enableRemoteNavigation: true,
      optimizeForTenFootUI: true,
      enableVoiceControl: true,
    }),
    
    // Kiosk-specific optimizations
    ...(config.isKioskMode && {
      lockDownInterface: true,
      disableContextMenus: true,
      preventNavigation: true,
      enableSecureMode: true,
    }),
  };
};