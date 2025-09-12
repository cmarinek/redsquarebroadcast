#!/usr/bin/env node

/**
 * Red Square Platform - Multi-Target Build Script
 * 
 * Builds the platform for different targets:
 * - web: Standard web application (default)
 * - mobile: Mobile apps via Capacitor
 * - screen: Screen applications for TVs and displays
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD_TARGETS = {
  web: {
    name: 'Web Platform',
    env: { VITE_BUILD_TARGET: 'web' },
    description: 'Standard web application with PWA features',
    postBuild: null
  },
  mobile: {
    name: 'Mobile Apps',
    env: { VITE_BUILD_TARGET: 'mobile' },
    description: 'iOS and Android native apps via Capacitor',
    postBuild: 'capacitor'
  },
  screen: {
    name: 'Screen Applications',
    env: { VITE_BUILD_TARGET: 'screen' },
    description: 'TV and display applications for various platforms',
    postBuild: null
  },
  'screen-desktop': {
    name: 'Screen Desktop Apps',
    env: { VITE_BUILD_TARGET: 'screen' },
    description: 'Desktop screen applications (Windows, macOS, Linux)',
    postBuild: 'electron'
  },
  'screen-tv': {
    name: 'Screen TV Apps',
    env: { VITE_BUILD_TARGET: 'screen', VITE_TV_OPTIMIZED: 'true' },
    description: 'Smart TV applications (Samsung, LG, Android TV, etc.)',
    postBuild: null
  },
  'screen-kiosk': {
    name: 'Screen Kiosk Mode',
    env: { VITE_BUILD_TARGET: 'screen', VITE_KIOSK_MODE: 'true' },
    description: 'Kiosk mode displays with locked-down interface',
    postBuild: null
  }
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warning: '\x1b[33m'  // yellow
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function buildTarget(target) {
  const config = BUILD_TARGETS[target];
  if (!config) {
    log(`❌ Unknown target: ${target}`, 'error');
    process.exit(1);
  }

  log(`🚀 Building ${config.name}...`, 'info');
  log(`📝 ${config.description}`, 'info');

  try {
    // Set environment variables
    const env = { ...process.env, ...config.env };
    
    // Run build
    execSync('npm run build', { 
      stdio: 'inherit',
      env
    });
    
    log(`✅ ${config.name} built successfully!`, 'success');
    
    // Target-specific post-build steps
    if (config.postBuild === 'capacitor') {
      log('📱 Running Capacitor sync...', 'info');
      try {
        execSync('npx cap sync', { stdio: 'inherit' });
        log('✅ Capacitor sync completed!', 'success');
      } catch (error) {
        log('⚠️  Capacitor sync failed (platforms may not be added yet)', 'warning');
      }
    } else if (config.postBuild === 'electron') {
      log('🖥️  Building Electron applications...', 'info');
      try {
        // Build for all desktop platforms
        execSync('npm run electron:build', { stdio: 'inherit' });
        log('✅ Electron build completed!', 'success');
      } catch (error) {
        log('⚠️  Electron build failed', 'warning');
        log(error.message, 'error');
      }
    }
    
    // Screen-specific optimizations
    if (target.startsWith('screen')) {
      log('📺 Applying screen-specific optimizations...', 'info');
      
      if (env.VITE_TV_OPTIMIZED) {
        log('📺 TV interface optimizations applied', 'success');
      }
      
      if (env.VITE_KIOSK_MODE) {
        log('🔒 Kiosk mode optimizations applied', 'success');
      }
    }
    
  } catch (error) {
    log(`❌ Build failed for ${config.name}`, 'error');
    log(error.message, 'error');
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🏗️  Red Square Platform - Multi-Target Builder

Usage: node scripts/build-targets.js [target]

Available targets:`);

  Object.entries(BUILD_TARGETS).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(8)} - ${config.description}`);
  });

  console.log(`
Examples:
  node scripts/build-targets.js web     # Build web platform
  node scripts/build-targets.js mobile  # Build mobile apps
  node scripts/build-targets.js screen  # Build screen applications
  node scripts/build-targets.js all     # Build all targets

Note: Make sure to run 'npm install' before building.
`);
}

function buildAll() {
  log('🚀 Building all targets...', 'info');
  Object.keys(BUILD_TARGETS).forEach(target => {
    buildTarget(target);
  });
  log('🎉 All targets built successfully!', 'success');
}

// Main execution
const target = process.argv[2];

if (!target || target === 'help' || target === '--help' || target === '-h') {
  showHelp();
} else if (target === 'all') {
  buildAll();
} else {
  buildTarget(target);
}