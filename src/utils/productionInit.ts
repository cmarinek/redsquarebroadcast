/**
 * Production Initialization
 * Sets up performance optimizations and monitoring
 */

import { registerServiceWorker, preconnectOrigins, prefetchCriticalResources } from "./cacheStrategy";
import { setupLazyLoading } from "./imageOptimization";
import { PRODUCTION_CONFIG, isProduction } from "@/config/production";

/**
 * Initialize production features
 */
export const initializeProduction = async () => {
  if (!isProduction()) {
    console.log("Running in development mode");
    return;
  }

  console.log("Initializing production features...");

  try {
    // Register service worker for offline support
    if (PRODUCTION_CONFIG.performance.cache.swEnabled) {
      await registerServiceWorker();
    }

    // Preconnect to external origins
    preconnectOrigins();

    // Prefetch critical resources
    prefetchCriticalResources();

    // Setup lazy loading for images
    setTimeout(() => {
      setupLazyLoading();
    }, 1000);

    // Setup performance monitoring
    setupPerformanceMonitoring();

    // Setup error tracking
    setupErrorTracking();

    console.log("✅ Production features initialized");
  } catch (error) {
    console.error("Failed to initialize production features:", error);
  }
};

/**
 * Setup performance monitoring
 */
const setupPerformanceMonitoring = () => {
  if (!PRODUCTION_CONFIG.monitoring.performanceMetrics) {
    return;
  }

  // Web Vitals monitoring
  if ("PerformanceObserver" in window) {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      console.log("LCP:", lastEntry.renderTime || lastEntry.loadTime);
      
      // Report to analytics (implement your analytics endpoint)
      reportMetric("LCP", lastEntry.renderTime || lastEntry.loadTime);
    });

    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        console.log("FID:", fid);
        reportMetric("FID", fid);
      });
    });

    try {
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
    });

    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // CLS not supported
    }

    // Report CLS on page hide
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        console.log("CLS:", clsValue);
        reportMetric("CLS", clsValue);
      }
    });
  }

  // Navigation timing
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      console.log("Page Load Time:", pageLoadTime);
      console.log("Connect Time:", connectTime);
      console.log("Render Time:", renderTime);

      reportMetric("pageLoadTime", pageLoadTime);
      reportMetric("connectTime", connectTime);
      reportMetric("renderTime", renderTime);
    }, 0);
  });
};

/**
 * Setup error tracking
 */
const setupErrorTracking = () => {
  if (!PRODUCTION_CONFIG.monitoring.errorTracking) {
    return;
  }

  // Global error handler
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error);
    reportError({
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error?.stack,
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    reportError({
      message: "Unhandled Promise Rejection",
      error: event.reason?.stack || String(event.reason),
    });
  });
};

/**
 * Report metric to backend
 */
const reportMetric = async (name: string, value: number) => {
  try {
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metric: name,
        value,
        timestamp: Date.now(),
        url: window.location.href,
      }),
    });
  } catch (error) {
    // Silently fail
  }
};

/**
 * Report error to backend
 */
const reportError = async (errorData: any) => {
  try {
    await fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...errorData,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    // Silently fail
  }
};

/**
 * Add cache headers to fetch requests
 */
export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const [resource, config] = args;
    
    // Add cache headers based on resource type
    const headers = new Headers(config?.headers);
    
    if (typeof resource === "string") {
      if (resource.includes("/api/")) {
        headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      }
    }
    
    return originalFetch(resource, {
      ...config,
      headers,
    });
  };
};
