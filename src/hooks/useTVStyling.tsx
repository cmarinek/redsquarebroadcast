import { useEffect, useState } from 'react';
import { detectPlatform, isTVPlatform, getTVOptimizations } from '@/utils/platformDetection';
import { getBuildConfig, getScreenOptimizations } from '@/config/buildConfig';

export interface TVStyleConfig {
  enableTVStyling: boolean;
  platformClass: string;
  tenFootUI: boolean;
  highContrast: boolean;
  safeArea: boolean;
  navigationEnabled: boolean;
  optimizations: any;
}

/**
 * Hook for managing TV-specific styling and behavior
 * Automatically applies TV optimizations based on platform detection
 */
export function useTVStyling() {
  const [config, setConfig] = useState<TVStyleConfig>({
    enableTVStyling: false,
    platformClass: '',
    tenFootUI: false,
    highContrast: false,
    safeArea: false,
    navigationEnabled: false,
    optimizations: {}
  });

  useEffect(() => {
    const platformInfo = detectPlatform();
    const buildConfig = getBuildConfig();
    const screenOptimizations = getScreenOptimizations();
    const tvOptimizations = getTVOptimizations(platformInfo.platform);
    
    const isTV = isTVPlatform(platformInfo.platform);
    
    const newConfig: TVStyleConfig = {
      enableTVStyling: isTV,
      platformClass: isTV ? `tv-platform-${platformInfo.tvPlatform?.replace('_', '-')}` : '',
      tenFootUI: isTV && buildConfig.isTVOptimized,
      highContrast: isTV,
      safeArea: isTV,
      navigationEnabled: isTV,
      optimizations: {
        ...screenOptimizations,
        ...tvOptimizations
      }
    };
    
    setConfig(newConfig);
    
    // Apply global TV styling classes to document body
    if (isTV) {
      document.body.classList.add('tv-navigation-enabled');
      if (buildConfig.isTVOptimized) {
        document.body.classList.add('ten-foot-ui', 'tv-safe-area');
      }
      if (platformInfo.tvPlatform) {
        document.body.classList.add(`tv-platform-${platformInfo.tvPlatform.replace('_', '-')}`);
      }
    }
    
    // Cleanup function to remove classes
    return () => {
      document.body.classList.remove(
        'tv-navigation-enabled',
        'ten-foot-ui',
        'tv-safe-area',
        'tv-platform-samsung',
        'tv-platform-lg',
        'tv-platform-roku',
        'tv-platform-amazon',
        'tv-platform-android',
        'tv-platform-apple'
      );
    };
  }, []);

  // Function to get CSS classes for TV styling
  const getTVClasses = (additionalClasses: string = '') => {
    const classes = [additionalClasses];
    
    if (config.enableTVStyling) {
      classes.push('tv-navigation-enabled');
      if (config.platformClass) {
        classes.push(config.platformClass);
      }
      if (config.tenFootUI) {
        classes.push('ten-foot-ui');
      }
      if (config.safeArea) {
        classes.push('tv-safe-area');
      }
      if (config.highContrast) {
        classes.push('tv-high-contrast');
      }
    }
    
    return classes.filter(Boolean).join(' ');
  };

  // Function to apply TV-specific inline styles
  const getTVStyles = (baseStyles: React.CSSProperties = {}) => {
    if (!config.enableTVStyling) return baseStyles;
    
    const tvStyles: React.CSSProperties = {
      ...baseStyles,
    };
    
    // Apply performance optimizations
    if (config.optimizations.enableHardwareAcceleration) {
      tvStyles.transform = tvStyles.transform || 'translateZ(0)';
      tvStyles.willChange = 'transform';
    }
    
    return tvStyles;
  };

  return {
    config,
    isTV: config.enableTVStyling,
    getTVClasses,
    getTVStyles,
    platformInfo: detectPlatform(),
    optimizations: config.optimizations
  };
}

export default useTVStyling;