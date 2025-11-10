// Generated from ssot.config.json - DO NOT EDIT MANUALLY
// Last generated: 2025-01-10T00:00:00.000Z

export const SSOT_CONFIG = {
  project: {
    "name": "Red Square",
    "description": "Democratizing screen-based advertising through a global broadcast network",
    "tagline": "Your screen. Your earnings. Your platform.",
    "copyright": "Copyright © 2024-2025 Red Square",
    "vendor": "Red Square Inc.",
    "website": "https://redsquare.app",
    "support": {
      "email": "support@redsquare.app",
      "website": "https://redsquare.app/support"
    }
  },
  applications: {
    "platform": {
      "name": "Red Square",
      "shortName": "Red Square",
      "description": "Book and broadcast to screens worldwide",
      "bundleId": "app.redsquare.platform",
      "urlScheme": "redsquare",
      "version": "1.0.0",
      "buildNumber": 1,
      "target": "mobile-web"
    },
    "screens": {
      "name": "Red Square Screens",
      "shortName": "RS Screens",
      "description": "Turn your screen into revenue with digital advertising",
      "bundleId": "app.redsquare.screens",
      "urlScheme": "redsquare-screen",
      "version": "1.0.0",
      "buildNumber": 1,
      "target": "screen-tv-kiosk"
    }
  },
  domains: {
    "production": "redsquare.app",
    "staging": "staging.redsquare.app",
    "development": "localhost:8080",
    "cdnBase": "https://cdn.redsquare.app"
  },
  features: {
    "screenRegistration": true,
    "screenDiscovery": true,
    "contentUpload": true,
    "scheduling": true,
    "payments": true,
    "authentication": true,
    "adminPanel": true,
    "analytics": true,
    "notifications": true,
    "aiGeneration": true,
    "multiLanguage": false,
    "darkMode": true
  },
  roles: {
    "enum": "app_role",
    "values": [
      "admin",
      "screen_owner",
      "advertiser",
      "broadcaster",
      "support"
    ],
    "defaultRole": "broadcaster",
    "table": "user_roles",
    "function": "has_role"
  },
  monetization: {
    "platformFeePercent": 15,
    "payoutMinimum": 50,
    "currency": "USD",
    "paymentProcessors": [
      "stripe"
    ],
    "subscriptionPlans": [
      {
        "id": "free",
        "name": "Free",
        "price": 0,
        "features": [
          "basic_scheduling",
          "1_screen"
        ]
      },
      {
        "id": "pro",
        "name": "Professional",
        "price": 29,
        "features": [
          "advanced_scheduling",
          "5_screens",
          "analytics"
        ]
      },
      {
        "id": "enterprise",
        "name": "Enterprise",
        "price": 99,
        "features": [
          "unlimited_screens",
          "priority_support",
          "api_access"
        ]
      }
    ]
  },
  assets: {
    "icons": {
      "web": "public/icon-512x512.png",
      "android": "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png",
      "ios": "ios/App/App/Assets.xcassets/AppIcon.appiconset/icon.png",
      "desktop": "assets/icon.png"
    },
    "splash": {
      "backgroundColor": "#0a0a0a",
      "spinnerColor": "#ffffff"
    },
    "brand": {
      "primaryColor": "#dc2626",
      "secondaryColor": "#1a1a1a",
      "accentColor": "#fbbf24"
    }
  }
} as const;

// Helper functions
export function getAppConfig(appType: 'platform' | 'screens') {
  return SSOT_CONFIG.applications[appType];
}

export function getSupabaseConfig() {
  return {
    url: 'https://hqeyyutbuxhyildsasqq.supabase.co',
    projectId: 'hqeyyutbuxhyildsasqq',
    region: 'us-east-1'
  };
}

export function isFeatureEnabled(feature: keyof typeof SSOT_CONFIG.features): boolean {
  return SSOT_CONFIG.features[feature];
}

export function getPlatformFee(): number {
  return SSOT_CONFIG.monetization.platformFeePercent;
}
