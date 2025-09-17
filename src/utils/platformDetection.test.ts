import { describe, it, expect } from 'vitest';
import { 
  detectTVPlatform, 
  detectScreenPlatform, 
  isTVPlatform, 
  getPlatformCapabilities,
  getDisplayInfo
} from './platformDetection';

describe('TV Platform Detection', () => {
  describe('detectTVPlatform', () => {
    it('should detect Samsung Tizen platform', () => {
      const userAgent = 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36 Samsung/SmartTV';
      expect(detectTVPlatform(userAgent)).toBe('samsung_tizen');
    });

    it('should detect LG webOS platform', () => {
      const userAgent = 'Mozilla/5.0 (WebOS; Linux/SmartTV) AppleWebKit/537.36 LG Browser/11.00.00';
      expect(detectTVPlatform(userAgent)).toBe('lg_webos');
    });

    it('should detect Roku platform', () => {
      const userAgent = 'Roku/DVP-10.5 (10.5.0.4208-30) Channel/dev';
      expect(detectTVPlatform(userAgent)).toBe('roku');
    });

    it('should detect Amazon Fire TV platform', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 9; AFTS Build/PS7325.3226N) AppleWebKit/537.36';
      expect(detectTVPlatform(userAgent)).toBe('amazon_fire_tv');
    });

    it('should detect Android TV platform', () => {
      const userAgent = 'Mozilla/5.0 (Linux; Android 11; Android TV Build/RTT1.230808.025) AppleWebKit/537.36';
      expect(detectTVPlatform(userAgent)).toBe('android_tv');
    });

    it('should detect Apple TV platform', () => {
      const userAgent = 'AppleTV14,1/17.0 CFNetwork/1408.0.4 Darwin/22.5.0 tvOS/17.0';
      expect(detectTVPlatform(userAgent)).toBe('apple_tv');
    });

    it('should return unknown_tv for unrecognized user agent', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      expect(detectTVPlatform(userAgent)).toBe('unknown_tv');
    });
  });

  describe('detectScreenPlatform', () => {
    it('should map TV platforms to screen platforms correctly', () => {
      expect(detectScreenPlatform('Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0)')).toBe('screens_samsung_tizen');
      expect(detectScreenPlatform('Mozilla/5.0 (WebOS; Linux/SmartTV) AppleWebKit/537.36 LG Browser')).toBe('screens_lg_webos');
      expect(detectScreenPlatform('Roku/DVP-10.5')).toBe('screens_roku');
      expect(detectScreenPlatform('Mozilla/5.0 (Linux; Android 9; AFTS Build)')).toBe('screens_amazon_fire');
      expect(detectScreenPlatform('Mozilla/5.0 (Linux; Android 11; Android TV Build)')).toBe('screens_android_tv');
    });

    it('should detect mobile and desktop platforms', () => {
      expect(detectScreenPlatform('Mozilla/5.0 (Linux; Android 11; SM-G991B)')).toBe('screens_android_mobile');
      expect(detectScreenPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)')).toBe('screens_ios');
      expect(detectScreenPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('screens_macos');
      expect(detectScreenPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('screens_windows');
    });
  });

  describe('isTVPlatform', () => {
    it('should correctly identify TV platforms', () => {
      expect(isTVPlatform('screens_samsung_tizen')).toBe(true);
      expect(isTVPlatform('screens_lg_webos')).toBe(true);
      expect(isTVPlatform('screens_roku')).toBe(true);
      expect(isTVPlatform('screens_amazon_fire')).toBe(true);
      expect(isTVPlatform('screens_android_tv')).toBe(true);
    });

    it('should correctly identify non-TV platforms', () => {
      expect(isTVPlatform('screens_android_mobile')).toBe(false);
      expect(isTVPlatform('screens_ios')).toBe(false);
      expect(isTVPlatform('screens_windows')).toBe(false);
      expect(isTVPlatform('screens_macos')).toBe(false);
      expect(isTVPlatform('unknown')).toBe(false);
    });
  });

  describe('getPlatformCapabilities', () => {
    it('should return correct capabilities for Samsung Tizen', () => {
      const capabilities = getPlatformCapabilities('screens_samsung_tizen');
      expect(capabilities.supportsRemoteNavigation).toBe(true);
      expect(capabilities.supports4K).toBe(true);
      expect(capabilities.supportsHDR).toBe(true);
      expect(capabilities.supportsVoiceControl).toBe(true);
      expect(capabilities.maxResolution).toBe('4K');
      expect(capabilities.videoCodecs).toContain('h265');
    });

    it('should return correct capabilities for Roku (low-end TV)', () => {
      const capabilities = getPlatformCapabilities('screens_roku');
      expect(capabilities.supportsRemoteNavigation).toBe(true);
      expect(capabilities.supports4K).toBe(true);
      expect(capabilities.supportsHDR).toBe(true);
      expect(capabilities.supportsVoiceControl).toBe(true);
      expect(capabilities.maxResolution).toBe('4K');
      expect(capabilities.videoCodecs).toEqual(['h264', 'h265']);
    });

    it('should return correct capabilities for mobile platforms', () => {
      const capabilities = getPlatformCapabilities('screens_android_mobile');
      expect(capabilities.supportsRemoteNavigation).toBe(false);
      expect(capabilities.supportsTouch).toBe(true);
      expect(capabilities.supports4K).toBe(false);
      expect(capabilities.maxResolution).toBe('1080p');
    });
  });

  describe('getDisplayInfo', () => {
    it('should correctly identify TV displays', () => {
      const displayInfo = getDisplayInfo('Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0)');
      expect(displayInfo.isTV).toBe(true);
      expect(displayInfo.isMobile).toBe(false);
      expect(displayInfo.isDesktop).toBe(false);
      expect(displayInfo.screenSize).toBe('extra_large');
    });

    it('should correctly identify mobile displays', () => {
      const displayInfo = getDisplayInfo('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)');
      expect(displayInfo.isTV).toBe(false);
      expect(displayInfo.isMobile).toBe(true);
      expect(displayInfo.isDesktop).toBe(false);
      expect(displayInfo.screenSize).toBe('small');
    });

    it('should correctly identify desktop displays', () => {
      const displayInfo = getDisplayInfo('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
      expect(displayInfo.isTV).toBe(false);
      expect(displayInfo.isMobile).toBe(false);
      expect(displayInfo.isDesktop).toBe(true);
      expect(displayInfo.screenSize).toBe('large');
    });
  });
});