#!/usr/bin/env node
// Simple manifest generator for Tizen (or other TV platforms)
// Usage: node scripts/packaging/generate-manifest.js --template scripts/packaging/tizen/manifest.tpl --out build/manifest.xml

const fs = require('fs');
const path = require('path');

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return {};
  }
}

const args = require('minimist')(process.argv.slice(2));
const tplPath = args.template || path.join(__dirname, 'tizen', 'manifest.tpl');
const outPath = args.out || path.join(process.cwd(), 'build', 'manifest.xml');

const pkg = readJSON(path.join(process.cwd(), 'package.json'));
const buildConfig = readJSON(path.join(process.cwd(), 'build-config.json'));

let tpl = '';
try {
  tpl = fs.readFileSync(tplPath, 'utf8');
} catch (err) {
  console.error('Template not found:', tplPath);
  process.exit(1);
}

const substitutions = {
  APP_ID: (pkg.name || 'app').replace(/[^a-zA-Z0-9_.-]/g, '_'),
  APP_VERSION: (pkg.version || '0.0.0'),
  APP_TITLE: (pkg.productName || pkg.name || 'App'),
  AUTHOR: (pkg.author && (pkg.author.name || pkg.author)) || buildConfig.author || 'Unknown Author',
  DESCRIPTION: pkg.description || '',
};

let out = tpl;
Object.keys(substitutions).forEach((k) => {
  out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), substitutions[k]);
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote manifest to', outPath);
