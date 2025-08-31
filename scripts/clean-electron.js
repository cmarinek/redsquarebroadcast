#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Clean dist-electron directory to force fresh TypeScript compilation
const distElectronPath = path.resolve('dist-electron');

try {
  if (fs.existsSync(distElectronPath)) {
    fs.rmSync(distElectronPath, { recursive: true, force: true });
    console.log('✅ Cleaned dist-electron directory');
  } else {
    console.log('ℹ️ dist-electron directory does not exist');
  }
} catch (error) {
  console.error('❌ Error cleaning dist-electron:', error.message);
  process.exit(1);
}