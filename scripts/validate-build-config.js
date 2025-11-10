#!/usr/bin/env node

/**
 * Build Configuration Validator
 * Validates that your build system is properly configured
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

function header(title) {
  console.log('\n' + COLORS.bold + COLORS.blue + '='.repeat(60) + COLORS.reset);
  console.log(COLORS.bold + COLORS.blue + `  ${title}` + COLORS.reset);
  console.log(COLORS.bold + COLORS.blue + '='.repeat(60) + COLORS.reset + '\n');
}

function checkmark(passed) {
  return passed ? '✅' : '❌';
}

// Expected Supabase values (from project configuration)
const EXPECTED_CONFIG = {
  supabaseUrl: 'https://hqeyyutbuxhyildsasqq.supabase.co',
  supabaseProjectId: 'hqeyyutbuxhyildsasqq',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxZXl5dXRidXhoeWlsZHNhc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODMwMTEsImV4cCI6MjA3MDI1OTAxMX0.oSmCDrlNM_9zGuFFCB05WenFGcM7G3H-5iQIn4KcMVE'
};

const REQUIRED_FILES = [
  'capacitor.config.json',
  'electron-builder.json',
  'electron/main.js',
  'electron/preload.js',
  'src/config/environment.ts',
  'src/config/env.ts',
  'src/config/production.ts',
  '.github/workflows/redsquare-web-build.yml',
  '.github/workflows/redsquare-android-build.yml',
  '.github/workflows/redsquare-ios-build.yml',
  '.github/workflows/screens-windows-build.yml',
  '.github/workflows/screens-macos-build.yml',
  '.github/workflows/screens-linux-build.yml'
];

const REQUIRED_WORKFLOWS = [
  '.github/workflows/redsquare-web-build.yml',
  '.github/workflows/redsquare-android-build.yml',
  '.github/workflows/redsquare-ios-build.yml',
  '.github/workflows/screens-windows-build.yml',
  '.github/workflows/screens-macos-build.yml',
  '.github/workflows/screens-linux-build.yml',
  '.github/workflows/screens-android-tv-build.yml',
  '.github/workflows/screens-amazon-fire-build.yml'
];

const REQUIRED_SECRETS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PROJECT_ID',
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_MAPBOX_PUBLIC_TOKEN',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
  'GH_ACCESS_TOKEN',
  'GH_REPO_OWNER',
  'GH_REPO_NAME',
  'GH_ACTION_SECRET'
];

const OPTIONAL_SECRETS = [
  'ANDROID_SIGNING_KEY_BASE64',
  'ANDROID_SIGNING_KEY_ALIAS',
  'ANDROID_SIGNING_KEY_PASSWORD',
  'ANDROID_SIGNING_STORE_PASSWORD',
  'IOS_CERTIFICATE_BASE64',
  'IOS_CERTIFICATE_PASSWORD',
  'IOS_PROVISIONING_PROFILE_BASE64',
  'IOS_TEAM_ID',
  'IOS_BUNDLE_ID'
];

function validateFiles() {
  header('FILE VALIDATION');
  
  let allPresent = true;
  
  REQUIRED_FILES.forEach(file => {
    const exists = fs.existsSync(file);
    log(`${checkmark(exists)} ${file}`, exists ? 'green' : 'red');
    if (!exists) allPresent = false;
  });
  
  return allPresent;
}

function validateWorkflows() {
  header('WORKFLOW VALIDATION');
  
  let allPresent = true;
  const workflowDetails = [];
  
  REQUIRED_WORKFLOWS.forEach(workflow => {
    const exists = fs.existsSync(workflow);
    log(`${checkmark(exists)} ${workflow}`, exists ? 'green' : 'red');
    
    if (exists) {
      const content = fs.readFileSync(workflow, 'utf8');
      const hasSecrets = REQUIRED_SECRETS.some(secret => content.includes(secret));
      
      workflowDetails.push({
        name: path.basename(workflow),
        hasSecrets,
        hasBuildStep: content.includes('npm run build') || content.includes('npx vite build'),
        hasUploadStep: content.includes('upload-artifact') || content.includes('storage/v1/object')
      });
    }
    
    if (!exists) allPresent = false;
  });
  
  console.log('\n' + COLORS.blue + 'Workflow Configuration:' + COLORS.reset);
  workflowDetails.forEach(detail => {
    console.log(`\n  ${detail.name}:`);
    console.log(`    ${checkmark(detail.hasSecrets)} Uses environment secrets`);
    console.log(`    ${checkmark(detail.hasBuildStep)} Has build step`);
    console.log(`    ${checkmark(detail.hasUploadStep)} Has artifact upload`);
  });
  
  return allPresent;
}

function validateCapacitorConfig() {
  header('CAPACITOR CONFIGURATION');
  
  try {
    const config = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
    
    log(`${checkmark(true)} App ID: ${config.appId}`, 'green');
    log(`${checkmark(true)} App Name: ${config.appName}`, 'green');
    log(`${checkmark(true)} Web Dir: ${config.webDir}`, 'green');
    
    // Check if server config exists (should NOT for production)
    if (config.server && config.server.url) {
      log(`${checkmark(false)} ⚠️  Server URL configured: ${config.server.url}`, 'yellow');
      log('  Note: This should be removed for production builds!', 'yellow');
    } else {
      log(`${checkmark(true)} No development server URL (correct for production)`, 'green');
    }
    
    return true;
  } catch (error) {
    log(`${checkmark(false)} Failed to read capacitor.config.json`, 'red');
    return false;
  }
}

function validateElectronConfig() {
  header('ELECTRON CONFIGURATION');
  
  try {
    const config = JSON.parse(fs.readFileSync('electron-builder.json', 'utf8'));
    
    log(`${checkmark(true)} App ID: ${config.appId}`, 'green');
    log(`${checkmark(true)} Product Name: ${config.productName}`, 'green');
    log(`${checkmark(!!config.win)} Windows target configured`, config.win ? 'green' : 'yellow');
    log(`${checkmark(!!config.mac)} macOS target configured`, config.mac ? 'green' : 'yellow');
    log(`${checkmark(!!config.linux)} Linux target configured`, config.linux ? 'green' : 'yellow');
    
    return true;
  } catch (error) {
    log(`${checkmark(false)} Failed to read electron-builder.json`, 'red');
    return false;
  }
}

function validateEnvironmentConfig() {
  header('ENVIRONMENT CONFIGURATION');
  
  try {
    const envContent = fs.readFileSync('src/config/env.ts', 'utf8');
    const productionContent = fs.readFileSync('src/config/production.ts', 'utf8');
    
    // Check if env.ts validates required variables
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
    const hasMapbox = envContent.includes('VITE_MAPBOX_PUBLIC_TOKEN');
    const hasStripe = envContent.includes('VITE_STRIPE_PUBLISHABLE_KEY');
    
    log(`${checkmark(hasSupabaseUrl)} Validates VITE_SUPABASE_URL`, hasSupabaseUrl ? 'green' : 'red');
    log(`${checkmark(hasSupabaseKey)} Validates VITE_SUPABASE_ANON_KEY`, hasSupabaseKey ? 'green' : 'red');
    log(`${checkmark(hasMapbox)} Validates VITE_MAPBOX_PUBLIC_TOKEN`, hasMapbox ? 'green' : 'red');
    log(`${checkmark(hasStripe)} Validates VITE_STRIPE_PUBLISHABLE_KEY`, hasStripe ? 'green' : 'red');
    
    // Check production config
    const hasProductionDomain = productionContent.includes('redsquare.app');
    log(`${checkmark(hasProductionDomain)} Production domain configured`, hasProductionDomain ? 'green' : 'yellow');
    
    return hasSupabaseUrl && hasSupabaseKey && hasMapbox && hasStripe;
  } catch (error) {
    log(`${checkmark(false)} Failed to read environment config files`, 'red');
    return false;
  }
}

function checkGitHubSecrets() {
  header('GITHUB SECRETS CHECK');
  
  log('⚠️  Cannot automatically verify GitHub secrets.', 'yellow');
  log('Please manually verify in GitHub repository settings:', 'yellow');
  log(`\n  Settings → Secrets and variables → Actions\n`, 'blue');
  
  console.log('Required secrets:');
  REQUIRED_SECRETS.forEach(secret => {
    console.log(`  • ${secret}`);
  });
  
  console.log('\nOptional secrets (for code signing):');
  OPTIONAL_SECRETS.forEach(secret => {
    console.log(`  • ${secret}`);
  });
  
  console.log('\n' + COLORS.yellow + 'CRITICAL: Verify these match your actual Supabase project:' + COLORS.reset);
  console.log(`  VITE_SUPABASE_URL should be: ${EXPECTED_CONFIG.supabaseUrl}`);
  console.log(`  VITE_SUPABASE_PROJECT_ID should be: ${EXPECTED_CONFIG.supabaseProjectId}`);
  console.log(`  VITE_SUPABASE_ANON_KEY should start with: ${EXPECTED_CONFIG.supabaseAnonKey.substring(0, 50)}...`);
}

function generateReport(results) {
  header('VALIDATION SUMMARY');
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(v => v === true).length;
  const percentage = ((passedChecks / totalChecks) * 100).toFixed(0);
  
  console.log(`Overall Status: ${passedChecks}/${totalChecks} checks passed (${percentage}%)\n`);
  
  Object.entries(results).forEach(([check, passed]) => {
    log(`${checkmark(passed)} ${check}`, passed ? 'green' : 'red');
  });
  
  console.log('\n' + COLORS.bold + 'Recommendations:' + COLORS.reset + '\n');
  
  if (!results['Files Present']) {
    log('• Some required files are missing. Review the file list above.', 'yellow');
  }
  
  if (!results['Workflows Present']) {
    log('• Some build workflows are missing. Check the workflow list above.', 'yellow');
  }
  
  log('• Verify GitHub secrets match your Supabase project (see above)', 'yellow');
  log('• Test a build to ensure it produces a working application', 'yellow');
  log('• Configure code signing certificates for production releases', 'yellow');
  
  console.log('\n' + COLORS.blue + 'Next Steps:' + COLORS.reset);
  console.log('  1. Fix any ❌ items above');
  console.log('  2. Verify GitHub secrets');
  console.log('  3. Trigger a test build: /admin-project-overview → Build Manager');
  console.log('  4. Download and test the built application');
  console.log('  5. Review docs/BUILD_VALIDATION_REPORT.md for detailed guidance\n');
}

// Main execution
function main() {
  console.clear();
  
  log('🔍 Red Square Build Configuration Validator\n', 'bold');
  log('This script validates your build system configuration.', 'blue');
  log('It checks files, workflows, and configurations.\n', 'blue');
  
  const results = {
    'Files Present': validateFiles(),
    'Workflows Present': validateWorkflows(),
    'Capacitor Config': validateCapacitorConfig(),
    'Electron Config': validateElectronConfig(),
    'Environment Config': validateEnvironmentConfig()
  };
  
  checkGitHubSecrets();
  generateReport(results);
}

main();
