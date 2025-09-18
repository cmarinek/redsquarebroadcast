#!/usr/bin/env node
/**
 * Simple manifest generator for TV platforms.
 * Usage: node generate-manifest.js --platform tizen --out dist/tizen/manifest.xml --vars ./package.json
 *
 * This is a conservative starter. Does not sign or publish — that is left to release process.
 */

const fs = require('fs');
const path = require('path');

function loadTpl(platform) {
  const tplPath = path.join(__dirname, platform, 'manifest.tpl');
  if (!fs.existsSync(tplPath)) throw new Error(`Template not found: ${tplPath}`);
  return fs.readFileSync(tplPath, 'utf8');
}

function fillTemplate(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const platform = argv.platform || 'tizen';
  const out = argv.out || `dist/${platform}/manifest.out`;
  const varsFile = argv.vars || 'package.json';
  const vars = fs.existsSync(varsFile) ? JSON.parse(fs.readFileSync(varsFile, 'utf8')) : {};

  const tpl = loadTpl(platform);
  const content = fillTemplate(tpl, { name: vars.name || 'redsquare', version: vars.version || '0.0.0', author: (vars.author && vars.author.name) || vars.author || '' });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, content);
  console.log(`Generated manifest at ${out}`);
}

if (require.main === module) main();
