#!/usr/bin/env node

/**
 * RedSquare Electron Build Script
 * 
 * Builds Electron applications for all desktop platforms
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function buildElectronApp(platform = 'all') {
  log(`🔨 Building Electron app for ${platform}...`, 'info');
  
  // Ensure build directory exists
  if (!fs.existsSync('dist')) {
    log('❌ No dist directory found. Run web build first.', 'error');
    process.exit(1);
  }
  
  try {
    // Platform-specific builds
    const commands = {
      windows: 'electron-builder --win --x64 --arm64',
      mac: 'electron-builder --mac --x64 --arm64',
      linux: 'electron-builder --linux --x64 --arm64',
      all: 'electron-builder --win --mac --linux --x64 --arm64'
    };
    
    const command = commands[platform] || commands.all;
    
    log(`📦 Running: ${command}`, 'info');
    
    // Set environment variables for Electron build
    const env = {
      ...process.env,
      CSC_IDENTITY_AUTO_DISCOVERY: 'false', // Disable code signing for now
      ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES: 'true',
    };
    
    execSync(command, { 
      stdio: 'inherit',
      env
    });
    
    log(`✅ Electron build completed for ${platform}!`, 'success');
    
    // List generated files
    const distElectronDir = 'dist-electron';
    if (fs.existsSync(distElectronDir)) {
      log('📁 Generated files:', 'info');
      const files = fs.readdirSync(distElectronDir);
      files.forEach(file => {
        const filePath = path.join(distElectronDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / (1024 * 1024)).toFixed(2);
        log(`  • ${file} (${size} MB)`, 'info');
      });
    }
    
  } catch (error) {
    log(`❌ Electron build failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

function prepareBuild() {
  log('🔧 Preparing Electron build...', 'info');
  
  // Ensure electron directory exists
  if (!fs.existsSync('electron')) {
    log('❌ Electron directory not found', 'error');
    process.exit(1);
  }
  
  // Copy package.json information for Electron
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const electronPackageJson = {
    name: packageJson.name || 'redsquare-screens',
    version: packageJson.version || '1.0.0',
    main: 'electron/main.js',
    description: packageJson.description || 'RedSquare Screens Desktop Application',
    author: packageJson.author || 'RedSquare Team',
    homepage: packageJson.homepage || 'https://redsquare.com',
    private: true
  };
  
  // Write electron package.json if it doesn't exist
  const electronPackageJsonPath = 'electron/package.json';
  if (!fs.existsSync(electronPackageJsonPath)) {
    fs.writeFileSync(electronPackageJsonPath, JSON.stringify(electronPackageJson, null, 2));
    log('📝 Created electron/package.json', 'success');
  }
  
  log('✅ Electron build preparation completed', 'success');
}

function validateElectronSetup() {
  log('🔍 Validating Electron setup...', 'info');
  
  const requiredFiles = [
    'electron/main.js',
    'electron/preload.js',
    'electron-builder.json'
  ];
  
  let isValid = true;
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      log(`❌ Missing required file: ${file}`, 'error');
      isValid = false;
    } else {
      log(`✅ Found ${file}`, 'success');
    }
  });
  
  // Check if electron and electron-builder are installed
  try {
    execSync('npx electron --version', { stdio: 'pipe' });
    log('✅ Electron is installed', 'success');
  } catch (error) {
    log('❌ Electron is not installed', 'error');
    isValid = false;
  }
  
  try {
    execSync('npx electron-builder --help', { stdio: 'pipe' });
    log('✅ Electron Builder is installed', 'success');
  } catch (error) {
    log('❌ Electron Builder is not installed', 'error');
    isValid = false;
  }
  
  if (!isValid) {
    log('❌ Electron setup validation failed', 'error');
    process.exit(1);
  }
  
  log('✅ Electron setup validation passed', 'success');
}

// CLI interface
const command = process.argv[2];
const platform = process.argv[3] || 'all';

switch (command) {
  case 'build':
    validateElectronSetup();
    prepareBuild();
    buildElectronApp(platform);
    break;
    
  case 'validate':
    validateElectronSetup();
    break;
    
  case 'prepare':
    prepareBuild();
    break;
    
  default:
    console.log(`
🖥️  RedSquare Electron Build Tool

Usage:
  node scripts/electron-build.js build [platform]  # Build Electron app
  node scripts/electron-build.js validate         # Validate setup
  node scripts/electron-build.js prepare          # Prepare build

Platforms:
  windows   - Build for Windows (x64, arm64)
  mac       - Build for macOS (x64, arm64) 
  linux     - Build for Linux (x64, arm64)
  all       - Build for all platforms (default)

Examples:
  node scripts/electron-build.js build windows
  node scripts/electron-build.js build all
  node scripts/electron-build.js validate
    `);
}