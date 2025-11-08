#!/usr/bin/env node

/**
 * RedSquare Build Validation Script
 * 
 * Validates build outputs and performs quality checks for different platforms
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VALIDATION_RULES = {
  web: {
    requiredFiles: ['index.html', 'assets'],
    maxBundleSize: 5 * 1024 * 1024, // 5MB
    checkGzip: true,
    checkSourceMaps: true,
  },
  mobile: {
    requiredFiles: ['index.html', 'assets'],
    maxBundleSize: 10 * 1024 * 1024, // 10MB
    checkCapacitorConfig: true,
    checkIcons: true,
  },
  'screen-desktop': {
    requiredFiles: ['index.html', 'assets'],
    maxBundleSize: 50 * 1024 * 1024, // 50MB
    checkElectronPackage: true,
    checkNativeModules: true,
  },
  'screen-tv': {
    requiredFiles: ['index.html', 'assets'],
    maxBundleSize: 20 * 1024 * 1024, // 20MB
    checkTVOptimizations: true,
    checkRemoteNavigation: true,
  },
  'screen-kiosk': {
    requiredFiles: ['index.html', 'assets'],
    maxBundleSize: 30 * 1024 * 1024, // 30MB
    checkKioskLockdown: true,
    checkSecuritySettings: true,
  }
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function validateBuildOutput(target, distPath = 'dist') {
  log(`🔍 Validating build output for ${target}...`, 'info');
  
  const rules = VALIDATION_RULES[target];
  if (!rules) {
    log(`⚠️  No validation rules found for target: ${target}`, 'warning');
    return true;
  }

  let isValid = true;
  const errors = [];
  const warnings = [];

  // Check required files
  log('📁 Checking required files...', 'info');
  for (const file of rules.requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing required file/directory: ${file}`);
      isValid = false;
    } else {
      log(`✅ Found ${file}`, 'success');
    }
  }

  // Check bundle size
  if (rules.maxBundleSize) {
    log('📏 Checking bundle size...', 'info');
    try {
      const stats = getDirSize(distPath);
      if (stats.size > rules.maxBundleSize) {
        warnings.push(`Bundle size (${formatSize(stats.size)}) exceeds recommended maximum (${formatSize(rules.maxBundleSize)})`);
      } else {
        log(`✅ Bundle size: ${formatSize(stats.size)}`, 'success');
      }
    } catch (error) {
      warnings.push(`Could not calculate bundle size: ${error.message}`);
    }
  }

  // Target-specific validations
  if (rules.checkGzip) {
    validateGzipCompression(distPath, warnings);
  }

  if (rules.checkSourceMaps) {
    validateSourceMaps(distPath, warnings);
  }

  if (rules.checkCapacitorConfig) {
    validateCapacitorConfig(warnings);
  }

  if (rules.checkElectronPackage) {
    validateElectronPackage(warnings);
  }

  if (rules.checkTVOptimizations) {
    validateTVOptimizations(distPath, warnings);
    validatePlatformOptimizations(distPath, warnings);
  }

  if (rules.checkKioskLockdown) {
    validateKioskLockdown(distPath, warnings);
  }

  // Report results
  if (errors.length > 0) {
    log('❌ Validation failed with errors:', 'error');
    errors.forEach(error => log(`  • ${error}`, 'error'));
  }

  if (warnings.length > 0) {
    log('⚠️  Validation warnings:', 'warning');
    warnings.forEach(warning => log(`  • ${warning}`, 'warning'));
  }

  if (errors.length === 0) {
    log(`✅ Build validation passed for ${target}`, 'success');
  }

  return isValid;
}

function getDirSize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        walk(itemPath);
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    });
  }

  walk(dirPath);
  return { size: totalSize, files: fileCount };
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function validateGzipCompression(distPath, warnings) {
  log('🗜️  Checking gzip compression...', 'info');
  
  const jsFiles = findFilesByExtension(distPath, '.js');
  const cssFiles = findFilesByExtension(distPath, '.css');
  
  [...jsFiles, ...cssFiles].forEach(file => {
    const gzipFile = file + '.gz';
    if (!fs.existsSync(gzipFile)) {
      warnings.push(`Missing gzip compression for: ${path.relative(distPath, file)}`);
    }
  });
}

function validateSourceMaps(distPath, warnings) {
  log('🗺️  Checking source maps...', 'info');
  
  const jsFiles = findFilesByExtension(distPath, '.js');
  const cssFiles = findFilesByExtension(distPath, '.css');
  
  [...jsFiles, ...cssFiles].forEach(file => {
    const mapFile = file + '.map';
    if (!fs.existsSync(mapFile)) {
      warnings.push(`Missing source map for: ${path.relative(distPath, file)}`);
    }
  });
}

function validateCapacitorConfig(warnings) {
  log('📱 Checking Capacitor configuration...', 'info');
  
  if (!fs.existsSync('capacitor.config.js') && !fs.existsSync('capacitor.config.ts')) {
    warnings.push('Missing capacitor.config.js or capacitor.config.ts file');
  }
  
  const platforms = ['android', 'ios'];
  platforms.forEach(platform => {
    if (!fs.existsSync(platform)) {
      warnings.push(`Missing ${platform} platform directory`);
    }
  });
}

function validateElectronPackage(warnings) {
  log('🖥️  Checking Electron configuration...', 'info');
  
  if (!fs.existsSync('electron/main.js')) {
    warnings.push('Missing Electron main process file');
  }
  
  if (!fs.existsSync('electron-builder.json')) {
    warnings.push('Missing electron-builder.json configuration');
  }
}

function validateTVOptimizations(distPath, warnings) {
  log('📺 Checking TV optimizations...', 'info');
  
  // Check for TV-specific assets
  const manifestPath = path.join(distPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest.display || manifest.display !== 'fullscreen') {
      warnings.push('TV apps should use fullscreen display mode');
    }
    
    // Check for TV-specific orientation
    if (!manifest.orientation || manifest.orientation !== 'landscape') {
      warnings.push('TV apps should be optimized for landscape orientation');
    }
    
    // Check for TV navigation support
    if (!manifest.tv_navigation_enabled) {
      warnings.push('TV apps should enable navigation support');
    }
  }
  
  // Check for TV-specific stylesheets
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    if (!indexContent.includes('tv-focused') && !indexContent.includes('remote-navigation')) {
      warnings.push('TV apps should include remote navigation CSS classes');
    }
  }
  
  // Check for performance optimization assets
  const performanceConfig = path.join(distPath, 'tv-config.json');
  if (!fs.existsSync(performanceConfig)) {
    warnings.push('Missing TV performance configuration file: tv-config.json');
  }
}

function validatePlatformOptimizations(distPath, warnings) {
  log('🎯 Checking platform-specific optimizations...', 'info');
  
  // Check for platform detection utilities
  const platformDetectionPath = path.join(distPath, 'assets');
  if (fs.existsSync(platformDetectionPath)) {
    const files = fs.readdirSync(platformDetectionPath);
    const hasPlatformDetection = files.some(file => 
      file.includes('platformDetection') || file.includes('platform-detection')
    );
    
    if (!hasPlatformDetection) {
      warnings.push('Missing platform detection utilities in build');
    }
  }
  
  // Check for TV remote navigation support
  const hasRemoteNavigation = fs.readdirSync(platformDetectionPath || distPath, { recursive: true })
    .some(file => file.includes('TVRemoteNavigation') || file.includes('tv-remote'));
    
  if (!hasRemoteNavigation) {
    warnings.push('Missing TV remote navigation support in build');
  }
}

function validateKioskLockdown(distPath, warnings) {
  log('🔒 Checking kiosk lockdown features...', 'info');
  
  // Check for security configurations
  const configFiles = ['security.json', 'kiosk.json'];
  configFiles.forEach(file => {
    if (!fs.existsSync(path.join(distPath, file))) {
      warnings.push(`Missing kiosk configuration: ${file}`);
    }
  });
}

function findFilesByExtension(dirPath, extension) {
  const files = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        walk(itemPath);
      } else if (item.endsWith(extension)) {
        files.push(itemPath);
      }
    });
  }
  
  walk(dirPath);
  return files;
}

// Performance benchmarking
function benchmarkBuild(target) {
  log(`⏱️  Running performance benchmark for ${target}...`, 'info');
  
  const startTime = process.hrtime();
  
  try {
    // Build the target
    execSync(`node scripts/build-targets.js ${target}`, { stdio: 'inherit' });
    
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const totalTime = seconds + nanoseconds / 1e9;
    
    log(`✅ Build completed in ${totalTime.toFixed(2)}s`, 'success');
    
    // Validate the output
    const isValid = validateBuildOutput(target);
    
    return {
      target,
      buildTime: totalTime,
      isValid,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'error');
    return {
      target,
      buildTime: null,
      isValid: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI interface
const command = process.argv[2];
const target = process.argv[3];

if (command === 'validate') {
  if (!target) {
    log('❌ Target required for validation', 'error');
    process.exit(1);
  }
  
  const isValid = validateBuildOutput(target);
  process.exit(isValid ? 0 : 1);
  
} else if (command === 'benchmark') {
  if (!target) {
    log('❌ Target required for benchmarking', 'error');
    process.exit(1);
  }
  
  const result = benchmarkBuild(target);
  console.log(JSON.stringify(result, null, 2));
  
} else {
  console.log(`
🔍 RedSquare Build Validation Tool

Usage:
  node scripts/build-validation.js validate <target>    # Validate build output
  node scripts/build-validation.js benchmark <target>   # Benchmark build performance

Available targets:
  web, mobile, screen-desktop, screen-tv, screen-kiosk

Examples:
  node scripts/build-validation.js validate web
  node scripts/build-validation.js benchmark screen-desktop
  `);
}