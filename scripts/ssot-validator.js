#!/usr/bin/env node

/**
 * SSOT Configuration Validator
 * 
 * Validates that all configuration files match ssot.config.json
 * Detects inconsistencies and violations of SSOT principles
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function loadJSON(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function loadSSOT() {
  const ssot = loadJSON('ssot.config.json');
  if (!ssot) {
    log('❌ Failed to load ssot.config.json', 'red');
    process.exit(1);
  }
  return ssot;
}

class ValidationReport {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }
  
  addError(message, file = null) {
    this.errors.push({ message, file });
  }
  
  addWarning(message, file = null) {
    this.warnings.push({ message, file });
  }
  
  addInfo(message, file = null) {
    this.info.push({ message, file });
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
  
  print() {
    console.log('\n' + COLORS.bold + '═'.repeat(60) + COLORS.reset);
    console.log(COLORS.bold + '  SSOT Validation Report' + COLORS.reset);
    console.log(COLORS.bold + '═'.repeat(60) + COLORS.reset + '\n');
    
    if (this.errors.length > 0) {
      log('❌ Errors:', 'red');
      this.errors.forEach(({ message, file }) => {
        log(`  • ${message}`, 'red');
        if (file) log(`    File: ${file}`, 'yellow');
      });
      console.log();
    }
    
    if (this.warnings.length > 0) {
      log('⚠️  Warnings:', 'yellow');
      this.warnings.forEach(({ message, file }) => {
        log(`  • ${message}`, 'yellow');
        if (file) log(`    File: ${file}`, 'blue');
      });
      console.log();
    }
    
    if (this.info.length > 0) {
      log('ℹ️  Information:', 'blue');
      this.info.forEach(({ message, file }) => {
        log(`  • ${message}`, 'blue');
        if (file) log(`    File: ${file}`, 'blue');
      });
      console.log();
    }
    
    // Summary
    console.log(COLORS.bold + '─'.repeat(60) + COLORS.reset);
    if (this.errors.length === 0 && this.warnings.length === 0) {
      log('✅ All checks passed! SSOT integrity maintained.', 'green');
    } else {
      log(`Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`, 
          this.errors.length > 0 ? 'red' : 'yellow');
    }
    console.log(COLORS.bold + '═'.repeat(60) + COLORS.reset + '\n');
  }
}

function validateCapacitorConfig(ssot, report) {
  log('Checking Capacitor configuration...', 'blue');
  
  const capacitor = loadJSON('capacitor.config.json');
  if (!capacitor) {
    report.addError('capacitor.config.json not found', 'capacitor.config.json');
    return;
  }
  
  // Check appId matches one of the apps
  const platformApp = ssot.applications.platform;
  const screensApp = ssot.applications.screens;
  
  if (capacitor.appId !== platformApp.bundleId && capacitor.appId !== screensApp.bundleId) {
    report.addError(
      `App ID mismatch: "${capacitor.appId}" doesn't match SSOT (expected "${platformApp.bundleId}" or "${screensApp.bundleId}")`,
      'capacitor.config.json'
    );
  }
  
  // Check splash screen colors
  if (capacitor.plugins?.SplashScreen) {
    const splash = capacitor.plugins.SplashScreen;
    if (splash.backgroundColor !== ssot.assets.splash.backgroundColor) {
      report.addWarning(
        `Splash background color mismatch: "${splash.backgroundColor}" vs SSOT "${ssot.assets.splash.backgroundColor}"`,
        'capacitor.config.json'
      );
    }
  }
}

function validateElectronConfig(ssot, report) {
  log('Checking Electron configuration...', 'blue');
  
  const electron = loadJSON('electron-builder.json');
  if (!electron) {
    report.addWarning('electron-builder.json not found (OK if not building desktop apps)');
    return;
  }
  
  const screensApp = ssot.applications.screens;
  
  if (electron.appId !== screensApp.bundleId) {
    report.addError(
      `App ID mismatch: "${electron.appId}" vs SSOT "${screensApp.bundleId}"`,
      'electron-builder.json'
    );
  }
  
  if (electron.productName !== screensApp.name) {
    report.addError(
      `Product name mismatch: "${electron.productName}" vs SSOT "${screensApp.name}"`,
      'electron-builder.json'
    );
  }
  
  if (electron.copyright !== ssot.project.copyright) {
    report.addWarning(
      `Copyright mismatch: "${electron.copyright}" vs SSOT "${ssot.project.copyright}"`,
      'electron-builder.json'
    );
  }
}

function validateManifest(ssot, report) {
  log('Checking PWA manifest...', 'blue');
  
  const manifest = loadJSON('public/manifest.json');
  if (!manifest) {
    report.addWarning('public/manifest.json not found');
    return;
  }
  
  const platformApp = ssot.applications.platform;
  
  if (manifest.name !== platformApp.name) {
    report.addWarning(
      `Manifest name mismatch: "${manifest.name}" vs SSOT "${platformApp.name}"`,
      'public/manifest.json'
    );
  }
  
  if (manifest.theme_color !== ssot.assets.brand.primaryColor) {
    report.addWarning(
      `Theme color mismatch: "${manifest.theme_color}" vs SSOT "${ssot.assets.brand.primaryColor}"`,
      'public/manifest.json'
    );
  }
}

function validatePackageJson(ssot, report) {
  log('Checking package.json...', 'blue');
  
  const pkg = loadJSON('package.json');
  if (!pkg) {
    report.addError('package.json not found');
    return;
  }
  
  // Check version matches
  const platformVersion = ssot.applications.platform.version;
  if (pkg.version !== platformVersion) {
    report.addWarning(
      `Version mismatch: package.json "${pkg.version}" vs SSOT "${platformVersion}"`,
      'package.json'
    );
  }
}

function searchForHardcodedValues(ssot, report) {
  log('Scanning for hardcoded SSOT values...', 'blue');
  
  const searchPatterns = [
    { pattern: ssot.backend.supabase.projectId, name: 'Supabase Project ID' },
    { pattern: 'com.redsquare.screens', name: 'Old Bundle ID (com.redsquare.screens)' },
    { pattern: 'RedSquare Screens', name: 'App name variation' },
  ];
  
  const excludeDirs = ['node_modules', 'dist', 'dist-electron', '.git', 'android', 'ios'];
  const excludeFiles = ['ssot.config.json', 'ssot-validator.js', 'package-lock.json'];
  
  searchPatterns.forEach(({ pattern, name }) => {
    try {
      const grepCmd = `grep -r "${pattern}" --exclude-dir={${excludeDirs.join(',')}} --exclude={${excludeFiles.join(',')}} . || true`;
      const results = execSync(grepCmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      
      if (results.trim()) {
        const lines = results.trim().split('\n');
        const fileCount = new Set(lines.map(line => line.split(':')[0])).size;
        
        if (fileCount > 5) { // Only report if found in many files
          report.addWarning(
            `Found "${name}" hardcoded in ${fileCount} files. Consider using SSOT constants.`
          );
        }
      }
    } catch (error) {
      // grep not available or search failed - skip
    }
  });
}

function validateWorkflows(ssot, report) {
  log('Checking GitHub workflow consistency...', 'blue');
  
  const workflowDir = '.github/workflows';
  if (!fs.existsSync(workflowDir)) {
    report.addWarning('No GitHub workflows found');
    return;
  }
  
  const workflows = fs.readdirSync(workflowDir)
    .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  
  let inconsistencies = 0;
  
  workflows.forEach(workflow => {
    const content = fs.readFileSync(path.join(workflowDir, workflow), 'utf8');
    
    // Check for hardcoded Supabase URL
    if (content.includes(ssot.backend.supabase.url) && 
        !content.includes('${{ secrets.VITE_SUPABASE_URL }}')) {
      inconsistencies++;
    }
    
    // Check for old app names
    if (content.includes('com.redsquare.screens') && 
        !content.includes(ssot.applications.screens.bundleId)) {
      inconsistencies++;
    }
  });
  
  if (inconsistencies > 0) {
    report.addWarning(
      `Found ${inconsistencies} potential SSOT violations in GitHub workflows`,
      '.github/workflows/'
    );
  }
}

function validateEnvironmentFiles(ssot, report) {
  log('Checking environment configuration...', 'blue');
  
  // Check if .env.example exists and has correct values
  const envExample = fs.existsSync('.env.example');
  if (!envExample) {
    report.addWarning('.env.example not found. Run generator to create it.');
  }
  
  // Check if actual .env has the required keys (but don't check values - they're secret)
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const requiredKeys = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_PROJECT_ID',
      'VITE_MAPBOX_PUBLIC_TOKEN',
      'VITE_STRIPE_PUBLISHABLE_KEY'
    ];
    
    requiredKeys.forEach(key => {
      if (!envContent.includes(key)) {
        report.addError(`Missing required environment variable: ${key}`, '.env');
      }
    });
  }
}

function main() {
  console.clear();
  log('🔍 SSOT Configuration Validator\n', 'bold');
  
  const report = new ValidationReport();
  
  log('Loading ssot.config.json...', 'blue');
  const ssot = loadSSOT();
  log('✅ Loaded successfully\n', 'green');
  
  // Run all validations
  validateCapacitorConfig(ssot, report);
  validateElectronConfig(ssot, report);
  validateManifest(ssot, report);
  validatePackageJson(ssot, report);
  validateEnvironmentFiles(ssot, report);
  validateWorkflows(ssot, report);
  searchForHardcodedValues(ssot, report);
  
  // Print report
  report.print();
  
  // Exit with error code if validation failed
  if (report.hasErrors()) {
    log('💡 To fix: Run `node scripts/ssot-generator.js` to regenerate configs from SSOT', 'yellow');
    process.exit(1);
  }
  
  if (report.warnings.length > 0) {
    log('💡 Consider running `node scripts/ssot-generator.js` to sync all configs', 'yellow');
  }
}

main();
