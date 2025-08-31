#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

try {
  // Clean any existing compiled files
  if (fs.existsSync('dist-electron')) {
    fs.rmSync('dist-electron', { recursive: true, force: true });
    console.log('🗑️  Cleaned dist-electron');
  }

  console.log('🔄 Testing isolated TypeScript compilation...');
  
  // Run TypeScript compilation with verbose output to see exactly what's happening
  execSync('npx tsc --p electron/tsconfig.json --listFiles --traceResolution', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ TypeScript compilation test successful!');
  
} catch (error) {
  console.error('❌ TypeScript compilation test failed');
  console.error('Error output:', error.toString());
  
  // Let's also check what files TypeScript thinks it's compiling
  try {
    console.log('\n📁 Checking electron directory contents:');
    const files = fs.readdirSync('electron', { withFileTypes: true });
    files.forEach(file => {
      console.log(`  ${file.isDirectory() ? 'DIR' : 'FILE'}: ${file.name}`);
    });
  } catch (dirError) {
    console.error('Could not read electron directory:', dirError.message);
  }
}