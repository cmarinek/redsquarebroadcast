/**
 * Video Optimization Utilities
 * Video transcoding and adaptive streaming setup
 */

import { PRODUCTION_CONFIG } from "@/config/production";

interface VideoTranscodingOptions {
  resolution?: 1080 | 720 | 480 | 360;
  format?: "mp4" | "webm";
  quality?: "high" | "medium" | "low";
}

/**
 * Check if video needs transcoding
 */
export const needsTranscoding = (file: File): boolean => {
  const { maxUploadSize } = PRODUCTION_CONFIG.performance.videos;
  
  // Check file size
  if (file.size > maxUploadSize) {
    return true;
  }

  // Check format
  const supportedFormats = ["video/mp4", "video/webm"];
  if (!supportedFormats.includes(file.type)) {
    return true;
  }

  return false;
};

/**
 * Get video metadata
 */
export const getVideoMetadata = (file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  bitrate: number;
}> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        bitrate: Math.round((file.size * 8) / video.duration),
      });
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      reject(new Error("Failed to load video metadata"));
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Generate video thumbnail
 */
export const generateVideoThumbnail = (
  file: File,
  timeInSeconds: number = 1
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timeInSeconds, video.duration);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate thumbnail"));
          }
          URL.revokeObjectURL(video.src);
        },
        "image/jpeg",
        0.85
      );
    };

    video.onerror = () => {
      reject(new Error("Failed to load video"));
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Validate video file
 */
export const validateVideoFile = async (file: File): Promise<{
  valid: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  const { maxUploadSize } = PRODUCTION_CONFIG.performance.videos;

  // Check file size
  if (file.size > maxUploadSize) {
    errors.push(
      `File size exceeds maximum (${Math.round(maxUploadSize / 1024 / 1024)}MB)`
    );
  }

  // Check file type
  if (!file.type.startsWith("video/")) {
    errors.push("File must be a video");
  }

  // Check video metadata
  try {
    const metadata = await getVideoMetadata(file);
    
    // Check duration (max 10 minutes for now)
    if (metadata.duration > 600) {
      errors.push("Video duration exceeds maximum (10 minutes)");
    }

    // Check resolution
    if (metadata.width > 1920 || metadata.height > 1080) {
      errors.push("Video resolution exceeds maximum (1920x1080)");
    }
  } catch (error) {
    errors.push("Failed to validate video metadata");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get adaptive streaming manifest URL
 * For Cloudflare Stream or HLS/DASH
 */
export const getStreamingUrl = (videoId: string, format: "hls" | "dash" = "hls"): string => {
  const baseUrl = PRODUCTION_CONFIG.url;
  
  // Cloudflare Stream format
  if (PRODUCTION_CONFIG.performance.videos.transcoding.adaptiveBitrate) {
    return `${baseUrl}/stream/${videoId}/manifest/${format}.m3u8`;
  }
  
  // Direct video URL
  return `${baseUrl}/videos/${videoId}.mp4`;
};

/**
 * Calculate optimal bitrate for resolution
 */
export const getOptimalBitrate = (
  width: number,
  height: number,
  quality: "high" | "medium" | "low" = "medium"
): number => {
  const pixelCount = width * height;
  const baseRate = pixelCount * 0.1; // 0.1 bits per pixel as base

  const qualityMultiplier = {
    high: 1.5,
    medium: 1.0,
    low: 0.6,
  };

  return Math.round(baseRate * qualityMultiplier[quality]);
};

/**
 * Setup video player with adaptive streaming
 */
export const setupAdaptivePlayer = (
  videoElement: HTMLVideoElement,
  manifestUrl: string
) => {
  // Use HLS.js for browsers that don't support HLS natively
  if (manifestUrl.includes(".m3u8") && !videoElement.canPlayType("application/vnd.apple.mpegurl")) {
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        
        hls.loadSource(manifestUrl);
        hls.attachMedia(videoElement);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest loaded");
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("Fatal HLS error:", data);
          }
        });
      }
    });
  } else {
    // Native HLS support or direct MP4
    videoElement.src = manifestUrl;
  }
};

/**
 * Preload video for faster playback
 */
export const preloadVideo = (url: string) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "video";
  link.href = url;
  document.head.appendChild(link);
};
