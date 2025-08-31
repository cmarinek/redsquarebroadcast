#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🧹 Force cleaning all caches and rebuilding...');

const pathsToClean = [
  'dist-electron',
  'dist',
  'node_modules/.cache',
  '.cache',
  '.vite',
  'node_modules/.vite'
];

// Aggressive cleanup
pathsToClean.forEach(pathToClean => {
  try {
    if (fs.existsSync(pathToClean)) {
      console.log(`🗑️  Removing ${pathToClean}...`);
      fs.rmSync(pathToClean, { recursive: true, force: true });
    }
  } catch (error) {
    console.warn(`Warning: Could not remove ${pathToClean}:`, error.message);
  }
});

// Clean any potential cache files
const cacheFiles = [
  'tsconfig.tsbuildinfo',
  'electron/tsconfig.tsbuildinfo', 
  '.eslintcache'
];

cacheFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      console.log(`🗑️  Removing cache file ${file}...`);
      fs.unlinkSync(file);
    }
  } catch (error) {
    console.warn(`Warning: Could not remove ${file}:`, error.message);
  }
});

try {
  console.log('🔄 Running fresh TypeScript compilation...');
  
  // First, just compile the electron code separately to isolate any issues
  execSync('tsc --p electron/tsconfig.json --force', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Electron TypeScript compilation successful!');
  
} catch (error) {
  console.error('❌ TypeScript compilation failed:', error.message);
  process.exit(1);
}