import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getPlatformPerformanceProfile,
  getTVRenderingOptimizations,
  getTVMemoryOptimizations,
  getTVNetworkOptimizations,
  type TVPlatformType,
  type BuildConfig
} from './buildConfig';

describe('Build Configuration', () => {
  describe('getPlatformPerformanceProfile', () => {
    it('should return correct profile for Samsung Tizen', () => {
      const profile = getPlatformPerformanceProfile('samsung_tizen');
      expect(profile.memoryLimit).toBe('1GB');
      expect(profile.cpuCores).toBe(4);
      expect(profile.gpuTier).toBe('high');
      expect(profile.maxResolution).toBe('4K');
      expect(profile.hdrSupport).toBe(true);
      expect(profile.supportedCodecs).toContain('h265');
      expect(profile.recommendedPerformance).toBe('high');
    });

    it('should return correct profile for Roku (low-end)', () => {
      const profile = getPlatformPerformanceProfile('roku');
      expect(profile.memoryLimit).toBe('512MB');
      expect(profile.cpuCores).toBe(1);
      expect(profile.gpuTier).toBe('low');
      expect(profile.maxResolution).toBe('4K');
      expect(profile.hdrSupport).toBe(false);
      expect(profile.supportedCodecs).toEqual(['h264', 'h265']);
      expect(profile.recommendedPerformance).toBe('low');
    });

    it('should return correct profile for Apple TV', () => {
      const profile = getPlatformPerformanceProfile('apple_tv');
      expect(profile.memoryLimit).toBe('2GB');
      expect(profile.cpuCores).toBe(4);
      expect(profile.gpuTier).toBe('high');
      expect(profile.maxResolution).toBe('4K');
      expect(profile.hdrSupport).toBe(true);
      expect(profile.supportedCodecs).toContain('dolby_vision');
      expect(profile.recommendedPerformance).toBe('high');
    });

    it('should return default profile for unknown platform', () => {
      const profile = getPlatformPerformanceProfile('unknown' as TVPlatformType);
      expect(profile.memoryLimit).toBe('512MB');
      expect(profile.cpuCores).toBe(2);
      expect(profile.gpuTier).toBe('low');
      expect(profile.maxResolution).toBe('1080p');
      expect(profile.hdrSupport).toBe(false);
      expect(profile.recommendedPerformance).toBe('low');
    });
  });

  describe('getTVRenderingOptimizations', () => {
    it('should return low performance settings', () => {
      const config = { performanceMode: 'low' as const, target: 'screen' as const };
      const optimizations = getTVRenderingOptimizations(config);
      
      expect(optimizations.maxTextureSize).toBe(1024);
      expect(optimizations.renderScale).toBe(0.75);
      expect(optimizations.shadowQuality).toBe('disabled');
      expect(optimizations.antiAliasing).toBe('disabled');
      expect(optimizations.frameRateLimit).toBe(30);
    });

    it('should return high performance settings', () => {
      const config = { performanceMode: 'high' as const, target: 'screen' as const };
      const optimizations = getTVRenderingOptimizations(config);
      
      expect(optimizations.maxTextureSize).toBe(4096);
      expect(optimizations.renderScale).toBe(1.0);
      expect(optimizations.shadowQuality).toBe('medium');
      expect(optimizations.antiAliasing).toBe('msaa_2x');
      expect(optimizations.frameRateLimit).toBe(60);
    });
  });

  describe('getTVMemoryOptimizations', () => {
    it('should return optimizations for low-end TV (Roku)', () => {
      const config = { tvPlatform: 'roku' as const, target: 'screen' as const };
      const optimizations = getTVMemoryOptimizations(config);
      
      expect(optimizations.enableMemoryPooling).toBe(true);
      expect(optimizations.maxCacheSize).toBe('256MB');
      expect(optimizations.maxConcurrentTextures).toBe(32);
      expect(optimizations.enableOcclusion).toBe(false);
    });

    it('should return optimizations for high-end TV', () => {
      const config = { tvPlatform: 'samsung_tizen' as const, target: 'screen' as const };
      const optimizations = getTVMemoryOptimizations(config);
      
      expect(optimizations.enableMemoryPooling).toBe(true);
      expect(optimizations.maxCacheSize).toBe('512MB');
      expect(optimizations.maxConcurrentTextures).toBe(64);
      expect(optimizations.enableOcclusion).toBe(true);
    });
  });

  describe('getTVNetworkOptimizations', () => {
    it('should return network optimizations based on performance mode', () => {
      const lowConfig = { performanceMode: 'low' as const, target: 'screen' as const };
      const lowOptimizations = getTVNetworkOptimizations(lowConfig);
      
      expect(lowOptimizations.enableAdaptiveBitrate).toBe(true);
      expect(lowOptimizations.enablePrefetching).toBe(false);
      expect(lowOptimizations.bufferSize).toBe('5MB');
      
      const highConfig = { performanceMode: 'high' as const, target: 'screen' as const };
      const highOptimizations = getTVNetworkOptimizations(highConfig);
      
      expect(highOptimizations.enablePrefetching).toBe(true);
      expect(highOptimizations.bufferSize).toBe('10MB');
    });
  });
});