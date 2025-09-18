import { useEffect, useState, useCallback, useRef } from 'react';
import { detectPlatform, isTVPlatform } from '@/utils/platformDetection';
import { getBuildConfig, getPlatformPerformanceProfile } from '@/config/buildConfig';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  batteryLevel?: number;
  networkSpeed: number;
  renderTime: number;
  isThrottling: boolean;
}

export interface PerformanceConfig {
  targetFPS: number;
  memoryThreshold: number;
  cpuThreshold: number;
  enableAutoOptimization: boolean;
  enableFrameRateLimiting: boolean;
  enableMemoryManagement: boolean;
  reportingInterval: number;
}

export interface PerformanceOptimizations {
  reduceAnimations: boolean;
  lowerImageQuality: boolean;
  disableBackgroundEffects: boolean;
  enableFrameRateLimiting: boolean;
  reduceConcurrentOperations: boolean;
  enableMemoryOptimization: boolean;
}

/**
 * TV Performance Monitoring and Optimization Hook
 * Monitors device performance and applies automatic optimizations for TV platforms
 */
export function useTVPerformance(config: Partial<PerformanceConfig> = {}) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    networkSpeed: 0,
    renderTime: 0,
    isThrottling: false
  });
  const [optimizations, setOptimizations] = useState<PerformanceOptimizations>({
    reduceAnimations: false,
    lowerImageQuality: false,
    disableBackgroundEffects: false,
    enableFrameRateLimiting: false,
    reduceConcurrentOperations: false,
    enableMemoryOptimization: false
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  const performanceConfig: PerformanceConfig = {
    targetFPS: 30,
    memoryThreshold: 0.8,
    cpuThreshold: 0.7,
    enableAutoOptimization: true,
    enableFrameRateLimiting: true,
    enableMemoryManagement: true,
    reportingInterval: 1000,
    ...config
  };

  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const renderTimesRef = useRef<number[]>([]);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Initialize performance monitoring for TV platforms
  useEffect(() => {
    const platformInfo = detectPlatform();
    const buildConfig = getBuildConfig();
    
    if (isTVPlatform(platformInfo.platform) && buildConfig.isTVOptimized) {
      setIsEnabled(true);
      initializePerformanceMonitoring();
    }

    return () => {
      cleanup();
    };
  }, []);

  // Initialize performance monitoring
  const initializePerformanceMonitoring = useCallback(() => {
    // Start FPS monitoring
    startFPSMonitoring();
    
    // Start metrics collection
    startMetricsCollection();
    
    // Initialize Performance Observer for detailed metrics
    initializePerformanceObserver();
    
    // Apply initial optimizations based on platform
    applyPlatformOptimizations();
  }, []);

  // Start FPS monitoring using requestAnimationFrame
  const startFPSMonitoring = useCallback(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const countFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCountRef.current = fps;
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrame);
    };
    
    requestAnimationFrame(countFrame);
  }, []);

  // Start periodic metrics collection
  const startMetricsCollection = useCallback(() => {
    metricsIntervalRef.current = setInterval(() => {
      collectMetrics();
    }, performanceConfig.reportingInterval);
  }, [performanceConfig.reportingInterval]);

  // Initialize Performance Observer for detailed performance data
  const initializePerformanceObserver = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'measure') {
            renderTimesRef.current.push(entry.duration);
            // Keep only last 10 measurements
            if (renderTimesRef.current.length > 10) {
              renderTimesRef.current.shift();
            }
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
        performanceObserverRef.current = observer;
      } catch (error) {
        console.warn('Performance Observer not fully supported', error);
      }
    }
  }, []);

  // Collect current performance metrics
  const collectMetrics = useCallback(() => {
    const newMetrics: PerformanceMetrics = {
      fps: frameCountRef.current,
      memoryUsage: getMemoryUsage(),
      cpuUsage: getCPUUsage(),
      batteryLevel: getBatteryLevel(),
      networkSpeed: getNetworkSpeed(),
      renderTime: getAverageRenderTime(),
      isThrottling: isPerformanceThrottling()
    };

    setMetrics(newMetrics);

    // Trigger automatic optimizations if enabled
    if (performanceConfig.enableAutoOptimization) {
      checkAndApplyOptimizations(newMetrics);
    }
  }, [performanceConfig.enableAutoOptimization]);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.totalJSHeapSize;
    }
    return 0;
  }, []);

  // Estimate CPU usage based on frame timing
  const getCPUUsage = useCallback((): number => {
    const targetFrameTime = 1000 / performanceConfig.targetFPS;
    const averageRenderTime = getAverageRenderTime();
    
    if (averageRenderTime === 0) return 0;
    
    return Math.min(averageRenderTime / targetFrameTime, 1);
  }, [performanceConfig.targetFPS]);

  // Get battery level (if available)
  const getBatteryLevel = useCallback((): number | undefined => {
    // Battery API is deprecated but might be available on some TV platforms
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        return battery.level;
      });
    }
    return undefined;
  }, []);

  // Estimate network speed
  const getNetworkSpeed = useCallback((): number => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.downlink || 0;
    }
    return 0;
  }, []);

  // Calculate average render time
  const getAverageRenderTime = useCallback((): number => {
    if (renderTimesRef.current.length === 0) return 0;
    
    const sum = renderTimesRef.current.reduce((acc, time) => acc + time, 0);
    return sum / renderTimesRef.current.length;
  }, []);

  // Check if performance is being throttled
  const isPerformanceThrottling = useCallback((): boolean => {
    return frameCountRef.current < performanceConfig.targetFPS * 0.8;
  }, [performanceConfig.targetFPS]);

  // Apply platform-specific optimizations
  const applyPlatformOptimizations = useCallback(() => {
    const platformInfo = detectPlatform();
    const platformProfile = getPlatformPerformanceProfile(platformInfo.tvPlatform || 'generic_tv');
    
    const platformOptimizations: Partial<PerformanceOptimizations> = {};
    
    if (platformProfile.recommendedPerformance === 'low') {
      platformOptimizations.reduceAnimations = true;
      platformOptimizations.lowerImageQuality = true;
      platformOptimizations.disableBackgroundEffects = true;
      platformOptimizations.enableFrameRateLimiting = true;
      platformOptimizations.enableMemoryOptimization = true;
    } else if (platformProfile.recommendedPerformance === 'medium') {
      platformOptimizations.enableFrameRateLimiting = true;
      platformOptimizations.enableMemoryOptimization = true;
    }
    
    setOptimizations(prev => ({ ...prev, ...platformOptimizations }));
    applyOptimizations(platformOptimizations);
  }, []);

  // Check performance metrics and apply optimizations if needed
  const checkAndApplyOptimizations = useCallback((currentMetrics: PerformanceMetrics) => {
    const newOptimizations: Partial<PerformanceOptimizations> = {};
    let shouldOptimize = false;

    // Check memory usage
    if (currentMetrics.memoryUsage > performanceConfig.memoryThreshold) {
      newOptimizations.enableMemoryOptimization = true;
      newOptimizations.lowerImageQuality = true;
      shouldOptimize = true;
    }

    // Check CPU usage
    if (currentMetrics.cpuUsage > performanceConfig.cpuThreshold) {
      newOptimizations.reduceAnimations = true;
      newOptimizations.disableBackgroundEffects = true;
      newOptimizations.reduceConcurrentOperations = true;
      shouldOptimize = true;
    }

    // Check FPS
    if (currentMetrics.fps < performanceConfig.targetFPS * 0.8) {
      newOptimizations.enableFrameRateLimiting = true;
      newOptimizations.reduceAnimations = true;
      shouldOptimize = true;
    }

    if (shouldOptimize) {
      setIsOptimizing(true);
      setOptimizations(prev => ({ ...prev, ...newOptimizations }));
      applyOptimizations(newOptimizations);
      
      // Reset optimization flag after a delay
      setTimeout(() => setIsOptimizing(false), 2000);
    }
  }, [performanceConfig]);

  // Apply optimizations to the DOM and runtime
  const applyOptimizations = useCallback((opts: Partial<PerformanceOptimizations>) => {
    const body = document.body;
    
    if (opts.reduceAnimations) {
      body.classList.add('tv-reduce-animations');
    }
    
    if (opts.lowerImageQuality) {
      body.classList.add('tv-low-quality-images');
    }
    
    if (opts.disableBackgroundEffects) {
      body.classList.add('tv-disable-effects');
    }
    
    if (opts.enableMemoryOptimization) {
      body.classList.add('tv-low-memory');
    }
    
    // Apply frame rate limiting
    if (opts.enableFrameRateLimiting && performanceConfig.enableFrameRateLimiting) {
      limitFrameRate(performanceConfig.targetFPS);
    }
  }, [performanceConfig]);

  // Limit frame rate for performance
  const limitFrameRate = useCallback((targetFPS: number) => {
    const frameInterval = 1000 / targetFPS;
    let lastFrameTime = 0;
    
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    
    window.requestAnimationFrame = (callback) => {
      return originalRequestAnimationFrame((currentTime) => {
        if (currentTime - lastFrameTime >= frameInterval) {
          callback(currentTime);
          lastFrameTime = currentTime;
        } else {
          window.requestAnimationFrame(callback);
        }
      });
    };
  }, []);

  // Manually trigger optimization
  const triggerOptimization = useCallback(() => {
    setIsOptimizing(true);
    collectMetrics();
    applyPlatformOptimizations();
    setTimeout(() => setIsOptimizing(false), 1000);
  }, [collectMetrics, applyPlatformOptimizations]);

  // Reset optimizations
  const resetOptimizations = useCallback(() => {
    const body = document.body;
    const classesToRemove = [
      'tv-reduce-animations',
      'tv-low-quality-images', 
      'tv-disable-effects',
      'tv-low-memory'
    ];
    
    classesToRemove.forEach(className => {
      body.classList.remove(className);
    });
    
    setOptimizations({
      reduceAnimations: false,
      lowerImageQuality: false,
      disableBackgroundEffects: false,
      enableFrameRateLimiting: false,
      reduceConcurrentOperations: false,
      enableMemoryOptimization: false
    });
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
    
    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
      performanceObserverRef.current = null;
    }
  }, []);

  // Get performance status
  const getPerformanceStatus = useCallback(() => {
    if (metrics.fps >= performanceConfig.targetFPS * 0.9) {
      return 'excellent';
    } else if (metrics.fps >= performanceConfig.targetFPS * 0.7) {
      return 'good';
    } else if (metrics.fps >= performanceConfig.targetFPS * 0.5) {
      return 'fair';
    } else {
      return 'poor';
    }
  }, [metrics.fps, performanceConfig.targetFPS]);

  return {
    isEnabled,
    metrics,
    optimizations,
    isOptimizing,
    performanceStatus: getPerformanceStatus(),
    triggerOptimization,
    resetOptimizations,
    config: performanceConfig
  };
}