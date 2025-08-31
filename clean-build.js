#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const pathsToClean = [
  'dist-electron',
  'dist',
  'node_modules/.cache',
  '.cache'
];

// Find and remove .tsbuildinfo files
const findTsBuildInfo = (dir) => {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        findTsBuildInfo(fullPath);
      } else if (file.name.endsWith('.tsbuildinfo')) {
        console.log(`Removing ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
    }
  } catch (error) {
    // Ignore directory access errors
  }
};

console.log('🧹 Cleaning build caches...');

// Clean known cache directories
pathsToClean.forEach(pathToClean => {
  try {
    if (fs.existsSync(pathToClean)) {
      console.log(`Cleaning ${pathToClean}...`);
      fs.rmSync(pathToClean, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn(`Warning: Could not clean ${pathToClean}:`, error.message);
  }
});

// Clean .tsbuildinfo files
console.log('Searching for .tsbuildinfo files...');
findTsBuildInfo('.');

// Clean electron temp files
const electronTempPaths = [
  'electron/tsconfig.tsbuildinfo',
  'tsconfig.tsbuildinfo'
];

electronTempPaths.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`Removing ${filePath}`);
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(`Warning: Could not remove ${filePath}:`, error.message);
  }
});

console.log('✅ Cache cleaning complete. Run npm run build now.');