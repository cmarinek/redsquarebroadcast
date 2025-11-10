#!/usr/bin/env node

/**
 * SSOT Configuration Generator
 * 
 * Generates all derivative configuration files from ssot.config.json
 * Ensures single source of truth is maintained across the project
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function loadSSOT() {
  try {
    const ssotPath = path.join(process.cwd(), 'ssot.config.json');
    const content = fs.readFileSync(ssotPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Failed to load ssot.config.json: ${error.message}`, 'red');
    process.exit(1);
  }
}

function generateCapacitorConfig(ssot, appType = 'platform') {
  const app = ssot.applications[appType];
  
  return {
    appId: app.bundleId,
    appName: app.name,
    webDir: "dist",
    server: {
      androidScheme: "https"
    },
    plugins: {
      SplashScreen: {
        launchShowDuration: 2000,
        launchAutoHide: true,
        backgroundColor: ssot.assets.splash.backgroundColor,
        androidSplashResourceName: "splash",
        androidScaleType: "CENTER_CROP",
        showSpinner: true,
        androidSpinnerStyle: "large",
        iosSpinnerStyle: "small",
        spinnerColor: ssot.assets.splash.spinnerColor,
        splashFullScreen: true,
        splashImmersive: true,
        layoutName: "launch_screen",
        useDialog: false
      }
    }
  };
}

function generateElectronBuilderConfig(ssot, appType = 'screens') {
  const app = ssot.applications[appType];
  
  return {
    appId: app.bundleId,
    productName: app.name,
    copyright: ssot.project.copyright,
    directories: {
      output: "dist-electron",
      assets: "assets"
    },
    files: [
      "dist/**/*",
      "electron/**/*",
      "node_modules/**/*",
      "public/icon-*.png"
    ],
    extraResources: [
      {
        from: "public/",
        to: "public/",
        filter: ["icon-*.png", "manifest.json"]
      }
    ],
    win: {
      target: [
        { target: "nsis", arch: ["x64", "arm64"] },
        { target: "portable", arch: ["x64"] },
        { target: "7z", arch: ["x64", "arm64"] }
      ],
      icon: ssot.assets.icons.web,
      requestedExecutionLevel: "asInvoker",
      artifactName: `\${productName}-\${version}-\${os}-\${arch}.\${ext}`
    },
    mac: {
      target: [
        { target: "dmg", arch: ["x64", "arm64"] },
        { target: "zip", arch: ["x64", "arm64"] }
      ],
      icon: ssot.assets.icons.desktop,
      category: "public.app-category.business",
      artifactName: `\${productName}-\${version}-\${os}-\${arch}.\${ext}`,
      hardenedRuntime: true,
      entitlements: "assets/entitlements.mac.plist",
      entitlementsInherit: "assets/entitlements.mac.plist"
    },
    linux: {
      target: [
        { target: "AppImage", arch: ["x64", "arm64"] },
        { target: "snap", arch: ["x64"] },
        { target: "deb", arch: ["x64", "arm64"] }
      ],
      icon: ssot.assets.icons.web,
      category: "Office",
      artifactName: `\${productName}-\${version}-\${os}-\${arch}.\${ext}`,
      desktop: {
        Name: app.name,
        Comment: app.description,
        Categories: "Office;Presentation;AudioVideo;",
        Keywords: "digital;signage;display;screen;broadcast;"
      }
    },
    nsis: {
      oneClick: false,
      allowElevation: true,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      installerIcon: ssot.assets.icons.web,
      uninstallerIcon: ssot.assets.icons.web,
      installerHeaderIcon: ssot.assets.icons.web,
      deleteAppDataOnUninstall: true
    },
    dmg: {
      background: "assets/dmg-background.png",
      iconSize: 100,
      contents: [
        { x: 380, y: 280, type: "link", path: "/Applications" },
        { x: 110, y: 280, type: "file" }
      ],
      window: { width: 500, height: 400 }
    },
    snap: {
      grade: "stable",
      confinement: "strict",
      plugs: ["default", "network", "network-bind", "audio-playback", "screen-inhibit-control", "browser-support"]
    },
    publish: {
      provider: "generic",
      url: `https://releases.${ssot.domains.production}/`
    },
    compression: "maximum",
    buildVersion: app.version
  };
}

function generateManifestJson(ssot, appType = 'platform') {
  const app = ssot.applications[appType];
  
  return {
    name: app.name,
    short_name: app.shortName,
    description: app.description,
    start_url: "/",
    display: "standalone",
    background_color: ssot.assets.splash.backgroundColor,
    theme_color: ssot.assets.brand.primaryColor,
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}

function generateEnvExample(ssot) {
  const lines = [
    '# Red Square Platform - Environment Variables',
    '# Generated from ssot.config.json - DO NOT EDIT MANUALLY',
    '',
    '# Supabase Configuration',
    `VITE_SUPABASE_URL=${ssot.backend.supabase.url}`,
    `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here`,
    `VITE_SUPABASE_PROJECT_ID=${ssot.backend.supabase.projectId}`,
    '',
    '# Mapbox Configuration',
    'VITE_MAPBOX_PUBLIC_TOKEN=your_mapbox_public_token_here',
    '',
    '# Stripe Configuration',
    'VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here',
    '',
    '# Optional: Analytics',
    '# GA_MEASUREMENT_ID=G-XXXXXXXXXX',
    '',
    '# Backend Secrets (Supabase Edge Functions only)',
    '# These should be configured in Supabase Dashboard → Edge Functions → Secrets',
    '# - SUPABASE_SERVICE_ROLE_KEY',
    '# - STRIPE_SECRET_KEY',
    '# - RESEND_API_KEY',
    '# - HUGGING_FACE_ACCESS_TOKEN',
    '# - GH_ACCESS_TOKEN',
    '# - GH_REPO_OWNER',
    '# - GH_REPO_NAME',
    '# - GH_ACTION_SECRET'
  ];
  
  return lines.join('\n');
}

function generateConfigConstants(ssot) {
  return `// Generated from ssot.config.json - DO NOT EDIT MANUALLY
// Last generated: ${new Date().toISOString()}

export const SSOT_CONFIG = {
  project: ${JSON.stringify(ssot.project, null, 2)},
  applications: ${JSON.stringify(ssot.applications, null, 2)},
  domains: ${JSON.stringify(ssot.domains, null, 2)},
  features: ${JSON.stringify(ssot.features, null, 2)},
  roles: ${JSON.stringify(ssot.roles, null, 2)},
  monetization: ${JSON.stringify(ssot.monetization, null, 2)},
  assets: ${JSON.stringify(ssot.assets, null, 2)}
} as const;

// Helper functions
export function getAppConfig(appType: 'platform' | 'screens') {
  return SSOT_CONFIG.applications[appType];
}

export function getSupabaseConfig() {
  return {
    url: '${ssot.backend.supabase.url}',
    projectId: '${ssot.backend.supabase.projectId}',
    region: '${ssot.backend.supabase.region}'
  };
}

export function isFeatureEnabled(feature: keyof typeof SSOT_CONFIG.features): boolean {
  return SSOT_CONFIG.features[feature];
}

export function getPlatformFee(): number {
  return SSOT_CONFIG.monetization.platformFeePercent;
}
`;
}

function writeFile(filePath, content, description) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (typeof content === 'object') {
      fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
    } else {
      fs.writeFileSync(fullPath, content);
    }
    
    log(`✅ Generated: ${description}`, 'green');
    log(`   ${filePath}`, 'blue');
  } catch (error) {
    log(`❌ Failed to write ${filePath}: ${error.message}`, 'red');
  }
}

function main() {
  console.clear();
  log('🔧 SSOT Configuration Generator\n', 'bold');
  
  log('Loading ssot.config.json...', 'blue');
  const ssot = loadSSOT();
  log('✅ Loaded successfully\n', 'green');
  
  log('Generating configuration files...\n', 'blue');
  
  // Generate Capacitor configs
  const capacitorPlatform = generateCapacitorConfig(ssot, 'platform');
  writeFile('capacitor.config.json', capacitorPlatform, 'Capacitor Config (Platform App)');
  
  // Generate Electron config
  const electronConfig = generateElectronBuilderConfig(ssot, 'screens');
  writeFile('electron-builder.json', electronConfig, 'Electron Builder Config');
  
  // Generate manifest.json
  const manifest = generateManifestJson(ssot, 'platform');
  writeFile('public/manifest.json', manifest, 'PWA Manifest');
  
  // Generate .env.example
  const envExample = generateEnvExample(ssot);
  writeFile('.env.example', envExample, 'Environment Variables Example');
  
  // Generate TypeScript constants
  const configConstants = generateConfigConstants(ssot);
  writeFile('src/config/ssot.generated.ts', configConstants, 'TypeScript SSOT Constants');
  
  log('\n✅ All configuration files generated successfully!', 'green');
  log('\n📋 Next steps:', 'bold');
  log('  1. Review generated files for accuracy', 'yellow');
  log('  2. Run validation: node scripts/ssot-validator.js', 'yellow');
  log('  3. Commit changes to version control', 'yellow');
  log('\n⚠️  Remember: Always edit ssot.config.json, never the generated files!', 'yellow');
}

main();
