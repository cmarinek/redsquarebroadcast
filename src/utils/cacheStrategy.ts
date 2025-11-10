/**
 * Cache Strategy Utilities
 * Browser caching, service worker, and CDN cache management
 */

import { PRODUCTION_CONFIG, getCacheDuration } from "@/config/production";

/**
 * Cache control headers for different resource types
 */
export const getCacheHeaders = (
  type: "static" | "images" | "videos" | "api"
): Record<string, string> => {
  const maxAge = getCacheDuration(type);
  
  const headers: Record<string, string> = {
    "Cache-Control": "",
    "CDN-Cache-Control": "",
  };

  switch (type) {
    case "static":
      headers["Cache-Control"] = `public, max-age=${maxAge}, immutable`;
      headers["CDN-Cache-Control"] = `public, max-age=${maxAge}`;
      break;
    
    case "images":
    case "videos":
      headers["Cache-Control"] = `public, max-age=${maxAge}, stale-while-revalidate=86400`;
      headers["CDN-Cache-Control"] = `public, max-age=${maxAge}`;
      break;
    
    case "api":
      headers["Cache-Control"] = `public, max-age=${maxAge}, stale-while-revalidate=300`;
      headers["CDN-Cache-Control"] = `public, max-age=${maxAge}`;
      break;
  }

  return headers;
};

/**
 * Service Worker registration
 */
export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered:", registration.scope);

    // Check for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New service worker available
            console.log("New service worker available");
          }
        });
      }
    });
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
};

/**
 * Cache API utilities
 */
export const cacheAPI = {
  async put(cacheName: string, request: Request | string, response: Response) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  },

  async get(cacheName: string, request: Request | string): Promise<Response | undefined> {
    const cache = await caches.open(cacheName);
    return await cache.match(request);
  },

  async delete(cacheName: string, request?: Request | string) {
    const cache = await caches.open(cacheName);
    if (request) {
      await cache.delete(request);
    } else {
      await caches.delete(cacheName);
    }
  },

  async clear() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  },
};

/**
 * Prefetch critical resources
 */
export const prefetchCriticalResources = () => {
  const criticalUrls = [
    "/",
    "/dashboard",
    "/screen-discovery",
  ];

  criticalUrls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Preconnect to external origins
 */
export const preconnectOrigins = () => {
  const origins = [
    PRODUCTION_CONFIG.apiUrl,
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ];

  origins.forEach((origin) => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
};

/**
 * Memory cache for frequent API calls
 */
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private maxAge: number;

  constructor(maxAgeSeconds: number = 300) {
    this.maxAge = maxAgeSeconds * 1000;
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

export const memoryCache = new MemoryCache();

/**
 * Cached fetch with memory and cache API fallback
 */
export const cachedFetch = async (
  url: string,
  options: RequestInit = {},
  cacheTime: number = 300
): Promise<any> => {
  // Check memory cache first
  const memoryCached = memoryCache.get(url);
  if (memoryCached) {
    return memoryCached;
  }

  // Check Cache API
  const cacheName = `api-cache-v1`;
  const cached = await cacheAPI.get(cacheName, url);
  
  if (cached) {
    const data = await cached.json();
    memoryCache.set(url, data);
    return data;
  }

  // Fetch from network
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Cache the response
  memoryCache.set(url, data);
  await cacheAPI.put(cacheName, url, new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  }));

  return data;
};

/**
 * Cloudflare cache purge (requires API token)
 */
export const purgeCloudflareCache = async (urls?: string[]) => {
  console.log("Cloudflare cache purge requested for:", urls || "all files");
  // This would typically be called from an admin function
  // Implementation requires Cloudflare API credentials
};
