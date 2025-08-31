import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceCSS = path.join(__dirname, '..', 'src', 'electron-fallback.css');
const targetCSS = path.join(__dirname, '..', 'dist', 'electron-fallback.css');

try {
  // Ensure dist directory exists
  if (!fs.existsSync(path.dirname(targetCSS))) {
    fs.mkdirSync(path.dirname(targetCSS), { recursive: true });
  }
  
  // Copy CSS file
  fs.copyFileSync(sourceCSS, targetCSS);
  console.log('Electron fallback CSS copied successfully');
} catch (error) {
  console.error('Failed to copy electron fallback CSS:', error);
  process.exit(1);
}