/**
 * TV Image Optimization Utilities
 * Progressive image loading and optimization for Smart TV platforms
 */

import { detectPlatform, isTVPlatform } from './platformDetection';
import { getBuildConfig } from '@/config/buildConfig';

export interface ImageOptimizationOptions {
  enableProgressive?: boolean;
  compressionLevel?: 'low' | 'medium' | 'high';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  enableWebP?: boolean;
  enableAVIF?: boolean;
  placeholder?: 'blur' | 'color' | 'none';
  placeholderColor?: string;
  enableLazyLoading?: boolean;
  memoryBudget?: number; // in MB
}

export interface TVImageConfig {
  supportedFormats: string[];
  maxResolution: { width: number; height: number };
  compressionLevel: 'low' | 'medium' | 'high';
  enableProgressive: boolean;
  memoryBudget: number;
  placeholder: 'blur' | 'color' | 'none';
}

/**
 * Get TV-optimized image configuration based on platform
 */
export function getTVImageConfig(): TVImageConfig {
  const platformInfo = detectPlatform();
  const buildConfig = getBuildConfig();
  
  if (!isTVPlatform(platformInfo.platform)) {
    return getDefaultImageConfig();
  }

  const capabilities = platformInfo.capabilities;
  const isLowEndDevice = capabilities.maxMemory === '512MB' || 
                        platformInfo.platform === 'screens_roku';
  
  return {
    supportedFormats: getSupportedImageFormats(platformInfo.platform),
    maxResolution: getMaxImageResolution(capabilities.maxResolution),
    compressionLevel: isLowEndDevice ? 'high' : 'medium',
    enableProgressive: !isLowEndDevice,
    memoryBudget: isLowEndDevice ? 32 : 64, // MB
    placeholder: isLowEndDevice ? 'color' : 'blur'
  };
}

/**
 * Get default image configuration for non-TV platforms
 */
function getDefaultImageConfig(): TVImageConfig {
  return {
    supportedFormats: ['webp', 'jpeg', 'png', 'gif'],
    maxResolution: { width: 1920, height: 1080 },
    compressionLevel: 'medium',
    enableProgressive: true,
    memoryBudget: 128,
    placeholder: 'blur'
  };
}

/**
 * Get supported image formats for different TV platforms
 */
function getSupportedImageFormats(platform: string): string[] {
  const baseFormats = ['jpeg', 'png', 'gif'];
  
  switch (platform) {
    case 'screens_samsung_tizen':
    case 'screens_lg_webos':
    case 'screens_android_tv':
      return ['avif', 'webp', ...baseFormats];
    case 'screens_amazon_fire':
      return ['webp', ...baseFormats];
    case 'screens_roku':
      return baseFormats; // Limited format support
    default:
      return ['webp', ...baseFormats];
  }
}

/**
 * Get maximum image resolution based on device capabilities
 */
function getMaxImageResolution(maxResolution: string): { width: number; height: number } {
  switch (maxResolution) {
    case '4K':
      return { width: 3840, height: 2160 };
    case '1080p':
      return { width: 1920, height: 1080 };
    case '720p':
      return { width: 1280, height: 720 };
    default:
      return { width: 1920, height: 1080 };
  }
}

/**
 * Progressive image loading hook for TV platforms
 */
export class TVImageLoader {
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  private memoryUsage: number = 0;
  private config: TVImageConfig;
  
  constructor(config?: Partial<TVImageConfig>) {
    this.config = { ...getTVImageConfig(), ...config };
  }

  /**
   * Load image with progressive enhancement and optimization
   */
  async loadImage(
    src: string, 
    options: ImageOptimizationOptions = {}
  ): Promise<HTMLImageElement> {
    // Check if image is already loaded
    const cached = this.loadedImages.get(src);
    if (cached) {
      return cached;
    }

    // Check if image is currently loading
    const loadingPromise = this.loadingPromises.get(src);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Create new loading promise
    const promise = this.loadImageWithOptimization(src, options);
    this.loadingPromises.set(src, promise);
    
    try {
      const image = await promise;
      this.loadedImages.set(src, image);
      this.updateMemoryUsage(image);
      return image;
    } finally {
      this.loadingPromises.delete(src);
    }
  }

  /**
   * Load image with TV-specific optimizations
   */
  private async loadImageWithOptimization(
    src: string, 
    options: ImageOptimizationOptions
  ): Promise<HTMLImageElement> {
    const optimizedSrc = this.getOptimizedImageUrl(src, options);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Handle low memory situations
      if (this.shouldReduceQuality()) {
        img.setAttribute('loading', 'lazy');
      }
      
      img.onload = () => {
        // Check if image exceeds memory budget
        if (this.exceedsMemoryBudget(img)) {
          this.freeMemory();
        }
        resolve(img);
      };
      
      img.onerror = () => {
        // Fallback to original image if optimized version fails
        if (optimizedSrc !== src) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${src}`));
          fallbackImg.src = src;
        } else {
          reject(new Error(`Failed to load image: ${src}`));
        }
      };
      
      img.src = optimizedSrc;
    });
  }

  /**
   * Generate optimized image URL based on platform capabilities
   */
  private getOptimizedImageUrl(src: string, options: ImageOptimizationOptions): string {
    // For now, return original URL - in production, this would generate
    // optimized URLs using image optimization services
    const params = new URLSearchParams();
    
    // Add format preference
    if (this.config.supportedFormats.includes('avif')) {
      params.append('format', 'avif');
    } else if (this.config.supportedFormats.includes('webp')) {
      params.append('format', 'webp');
    }
    
    // Add quality based on compression level
    const quality = this.getQualityForCompressionLevel(this.config.compressionLevel);
    params.append('quality', quality.toString());
    
    // Add maximum dimensions
    if (options.maxWidth || this.config.maxResolution.width) {
      params.append('w', (options.maxWidth || this.config.maxResolution.width).toString());
    }
    
    if (options.maxHeight || this.config.maxResolution.height) {
      params.append('h', (options.maxHeight || this.config.maxResolution.height).toString());
    }
    
    // For now, return original URL (in production, append params to optimization service)
    return src;
  }

  /**
   * Get quality value for compression level
   */
  private getQualityForCompressionLevel(level: 'low' | 'medium' | 'high'): number {
    switch (level) {
      case 'low': return 95;
      case 'medium': return 85;
      case 'high': return 75;
      default: return 85;
    }
  }

  /**
   * Check if should reduce quality due to performance concerns
   */
  private shouldReduceQuality(): boolean {
    return this.memoryUsage > (this.config.memoryBudget * 0.8);
  }

  /**
   * Check if image exceeds memory budget
   */
  private exceedsMemoryBudget(img: HTMLImageElement): boolean {
    const imageSize = this.estimateImageMemoryUsage(img);
    return (this.memoryUsage + imageSize) > (this.config.memoryBudget * 1024 * 1024);
  }

  /**
   * Estimate memory usage of an image
   */
  private estimateImageMemoryUsage(img: HTMLImageElement): number {
    // Rough estimation: width * height * 4 bytes (RGBA)
    return img.naturalWidth * img.naturalHeight * 4;
  }

  /**
   * Update memory usage tracking
   */
  private updateMemoryUsage(img: HTMLImageElement): void {
    this.memoryUsage += this.estimateImageMemoryUsage(img);
  }

  /**
   * Free memory by removing oldest cached images
   */
  private freeMemory(): void {
    const imagesToRemove = Math.ceil(this.loadedImages.size * 0.3); // Remove 30%
    let removed = 0;
    
    for (const [src, img] of this.loadedImages.entries()) {
      if (removed >= imagesToRemove) break;
      
      this.memoryUsage -= this.estimateImageMemoryUsage(img);
      this.loadedImages.delete(src);
      removed++;
    }
  }

  /**
   * Clear all cached images
   */
  clearCache(): void {
    this.loadedImages.clear();
    this.loadingPromises.clear();
    this.memoryUsage = 0;
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): { used: number; budget: number; percentage: number } {
    const budgetBytes = this.config.memoryBudget * 1024 * 1024;
    return {
      used: this.memoryUsage,
      budget: budgetBytes,
      percentage: (this.memoryUsage / budgetBytes) * 100
    };
  }
}

/**
 * Create a placeholder image for TV platforms
 */
export function createTVPlaceholder(
  width: number, 
  height: number, 
  type: 'blur' | 'color' = 'color',
  color: string = '#1f2937'
): string {
  if (type === 'color') {
    // Create a simple colored rectangle as data URL
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  }
  
  // For blur, create a simple gradient
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#374151');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL();
}

/**
 * Singleton instance for global use
 */
export const tvImageLoader = new TVImageLoader();