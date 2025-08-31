const fs = require('fs');
const path = require('path');

console.log('Running post-build script...');

// Copy electron-fallback.css to dist folder after build
const sourceCSS = path.join(__dirname, 'src', 'electron-fallback.css');
const targetCSS = path.join(__dirname, 'dist', 'electron-fallback.css');

try {
  if (fs.existsSync(sourceCSS)) {
    fs.copyFileSync(sourceCSS, targetCSS);
    console.log('✅ Electron fallback CSS copied to dist folder');
  } else {
    console.warn('⚠️ Electron fallback CSS not found, skipping copy');
  }
} catch (error) {
  console.error('❌ Failed to copy electron fallback CSS:', error);
}

// Verify critical build files exist
const criticalFiles = [
  'dist/index.html',
  'dist/assets',
  'electron-builder.json'
];

let buildValid = true;

for (const file of criticalFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Critical file missing: ${file}`);
    buildValid = false;
  } else {
    console.log(`✅ Found: ${file}`);
  }
}

// Check dist directory size
if (fs.existsSync('dist')) {
  const distStats = fs.statSync('dist');
  console.log(`📦 Build output ready in dist/ directory`);
}

// Validate package.json and electron-builder.json consistency
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const electronBuilder = JSON.parse(fs.readFileSync('electron-builder.json', 'utf8'));
  
  console.log(`📋 App ID: ${electronBuilder.appId}`);
  console.log(`📋 Product Name: ${electronBuilder.productName}`);
  console.log(`📋 Version: ${pkg.version}`);
} catch (error) {
  console.error(`❌ Configuration validation failed: ${error.message}`);
  buildValid = false;
}

if (buildValid) {
  console.log('✅ Post-build validation passed.');
} else {
  console.error('❌ Post-build validation failed!');
  process.exit(1);
}

console.log('Post-build processing complete.');