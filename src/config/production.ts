/**
 * Production Configuration
 * Site: redsquare.app (configured via Cloudflare)
 */

export const PRODUCTION_CONFIG = {
  // Domain Configuration
  domain: "redsquare.app",
  url: "https://redsquare.app",
  apiUrl: "https://hqeyyutbuxhyildsasqq.supabase.co",
  
  // CDN Configuration (Cloudflare)
  cdn: {
    enabled: true,
    imageTransform: true,
    videoOptimization: true,
    caching: {
      static: 31536000, // 1 year for static assets
      images: 2592000,  // 30 days for images
      videos: 604800,   // 7 days for videos
      api: 60,          // 1 minute for API responses (with stale-while-revalidate)
    },
  },

  // Performance Settings
  performance: {
    // Image optimization
    images: {
      formats: ["webp", "avif"],
      quality: 85,
      lazyLoading: true,
      placeholder: "blur",
    },
    
    // Video settings
    videos: {
      maxUploadSize: 500 * 1024 * 1024, // 500MB
      transcoding: {
        enabled: true,
        formats: ["mp4", "webm"],
        resolutions: [1080, 720, 480],
        adaptiveBitrate: true,
      },
    },
    
    // Caching strategy
    cache: {
      swEnabled: true, // Service Worker
      maxAge: {
        static: 31536000,
        dynamic: 3600,
        api: 60,
      },
    },
  },

  // Email Configuration
  email: {
    from: {
      noreply: "noreply@redsquare.app",
      bookings: "bookings@redsquare.app",
      payments: "payments@redsquare.app",
      notifications: "notifications@redsquare.app",
      alerts: "alerts@redsquare.app",
      support: "support@redsquare.app",
    },
    replyTo: "support@redsquare.app",
  },

  // Security Settings
  security: {
    cors: {
      allowedOrigins: [
        "https://redsquare.app",
        "https://www.redsquare.app",
      ],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowCredentials: true,
    },
    rateLimit: {
      public: { requests: 100, window: 60 }, // 100 req/min
      authenticated: { requests: 500, window: 60 }, // 500 req/min
      admin: { requests: 1000, window: 60 }, // 1000 req/min
    },
  },

  // Monitoring
  monitoring: {
    enabled: true,
    errorTracking: true,
    performanceMetrics: true,
    analyticsTracking: true,
  },

  // Feature Flags
  features: {
    videoTranscoding: true,
    imageOptimization: true,
    realTimeNotifications: true,
    advancedAnalytics: true,
    multiLanguage: false, // Coming soon
    whiteLabel: false, // Enterprise only
  },
} as const;

// Helper functions
export const getAssetUrl = (path: string) => {
  const { url, cdn } = PRODUCTION_CONFIG;
  return cdn.enabled ? `${url}${path}` : path;
};

export const getCacheDuration = (type: "static" | "images" | "videos" | "api") => {
  return PRODUCTION_CONFIG.cdn.caching[type];
};

export const isProduction = () => {
  return window.location.hostname === PRODUCTION_CONFIG.domain || 
         window.location.hostname === `www.${PRODUCTION_CONFIG.domain}`;
};
