const fs = require('fs');
const path = require('path');

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