/**
 * Image Optimization Utilities
 * Cloudflare Images integration for CDN-powered image transformation
 */

import { PRODUCTION_CONFIG } from "@/config/production";

interface ImageTransformOptions {
  width?: number;
  height?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  quality?: number;
  blur?: number;
}

/**
 * Transform image URL with Cloudflare Image Resizing
 * https://developers.cloudflare.com/images/image-resizing/
 */
export const transformImageUrl = (
  url: string,
  options: ImageTransformOptions = {}
): string => {
  if (!PRODUCTION_CONFIG.cdn.enabled || !url) {
    return url;
  }

  const {
    width,
    height,
    fit = "scale-down",
    format = "auto",
    quality = PRODUCTION_CONFIG.performance.images.quality,
    blur,
  } = options;

  // Build transform parameters
  const params: string[] = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  params.push(`fit=${fit}`);
  params.push(`format=${format}`);
  params.push(`quality=${quality}`);
  if (blur) params.push(`blur=${blur}`);

  // Cloudflare Image Resizing format: /cdn-cgi/image/{options}/{url}
  const transformPath = `/cdn-cgi/image/${params.join(",")}`;
  
  // Handle absolute and relative URLs
  if (url.startsWith("http")) {
    return `${transformPath}/${url}`;
  } else if (url.startsWith("/")) {
    return `${transformPath}${url}`;
  }
  
  return `${transformPath}/${url}`;
};

/**
 * Generate responsive image srcset
 */
export const getResponsiveSrcSet = (
  url: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  return widths
    .map((width) => {
      const transformedUrl = transformImageUrl(url, { width, format: "auto" });
      return `${transformedUrl} ${width}w`;
    })
    .join(", ");
};

/**
 * Generate sizes attribute for responsive images
 */
export const getResponsiveSizes = (
  breakpoints: Record<string, string> = {
    default: "100vw",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  }
): string => {
  return Object.entries(breakpoints)
    .filter(([key]) => key !== "default")
    .map(([key, value]) => `(min-width: ${value}) ${value}`)
    .concat(breakpoints.default)
    .join(", ");
};

/**
 * Preload critical images
 */
export const preloadImage = (url: string, options?: ImageTransformOptions) => {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = transformImageUrl(url, options);
  
  if (options?.format) {
    link.type = `image/${options.format}`;
  }
  
  document.head.appendChild(link);
};

/**
 * Generate blur placeholder data URL
 */
export const generateBlurPlaceholder = (url: string): string => {
  return transformImageUrl(url, {
    width: 40,
    quality: 10,
    blur: 20,
    format: "jpeg",
  });
};

/**
 * Lazy load images with Intersection Observer
 */
export const setupLazyLoading = () => {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (src) {
            img.src = src;
          }
          if (srcset) {
            img.srcset = srcset;
          }

          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.01,
    }
  );

  document.querySelectorAll("img.lazy").forEach((img) => {
    imageObserver.observe(img);
  });
};

/**
 * Optimize uploaded content images
 */
export const optimizeContentImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to optimize image"));
          }
        },
        "image/jpeg",
        PRODUCTION_CONFIG.performance.images.quality / 100
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};
