#!/usr/bin/env node

/**
 * Build Verification Script
 * Verifies that all platform builds are working correctly
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const PLATFORMS = {
  'windows': {
    extension: '.exe',
    maxSize: 500 * 1024 * 1024, // 500MB
    buildDir: 'release'
  },
  'macos': {
    extension: '.dmg',
    maxSize: 500 * 1024 * 1024, // 500MB
    buildDir: 'release'
  },
  'linux': {
    extension: '.AppImage',
    maxSize: 500 * 1024 * 1024, // 500MB
    buildDir: 'release'
  },
  'android': {
    extension: '.apk',
    maxSize: 100 * 1024 * 1024, // 100MB
    buildDir: 'android/app/build/outputs/apk/release'
  },
  'ios': {
    extension: '.ipa',
    maxSize: 100 * 1024 * 1024, // 100MB
    buildDir: 'ios/App/build'
  }
};

class BuildVerifier {
  constructor() {
    this.results = {};
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📋',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async verifyPlatform(platform) {
    this.log(`Verifying ${platform} build...`);
    
    const config = PLATFORMS[platform];
    if (!config) {
      this.errors.push(`Unknown platform: ${platform}`);
      return false;
    }

    const buildDir = path.resolve(config.buildDir);
    
    try {
      // Check if build directory exists
      if (!fs.existsSync(buildDir)) {
        this.errors.push(`Build directory not found: ${buildDir}`);
        return false;
      }

      // Find build files
      const files = fs.readdirSync(buildDir)
        .filter(file => file.endsWith(config.extension))
        .map(file => path.join(buildDir, file));

      if (files.length === 0) {
        this.errors.push(`No ${config.extension} files found in ${buildDir}`);
        return false;
      }

      const buildFile = files[0];
      const stats = fs.statSync(buildFile);
      
      // Verify file size
      if (stats.size > config.maxSize) {
        this.errors.push(`${platform} build too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max: ${(config.maxSize / 1024 / 1024)}MB)`);
        return false;
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(buildFile);
      
      // Verify file integrity
      if (!await this.verifyFileIntegrity(buildFile, platform)) {
        this.errors.push(`${platform} build failed integrity check`);
        return false;
      }

      this.results[platform] = {
        file: buildFile,
        size: stats.size,
        sizeHuman: `${(stats.size / 1024 / 1024).toFixed(2)}MB`,
        checksum,
        buildTime: stats.mtime,
        verified: true
      };

      this.log(`${platform} build verified: ${this.results[platform].sizeHuman}`, 'success');
      return true;

    } catch (error) {
      this.errors.push(`Error verifying ${platform}: ${error.message}`);
      return false;
    }
  }

  async calculateChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  async verifyFileIntegrity(filePath, platform) {
    try {
      // Basic file integrity checks
      const stats = fs.statSync(filePath);
      
      // Check if file is readable
      fs.accessSync(filePath, fs.constants.R_OK);
      
      // Platform-specific integrity checks
      switch (platform) {
        case 'windows':
          // Verify PE header for Windows executables
          const buffer = fs.readFileSync(filePath, { start: 0, end: 2 });
          return buffer.toString() === 'MZ'; // DOS header signature
          
        case 'macos':
          // Basic DMG verification (check for magic bytes)
          const dmgBuffer = fs.readFileSync(filePath, { start: 0, end: 4 });
          return dmgBuffer.readUInt32BE(0) === 0x78DA || // zlib compressed
                 dmgBuffer.readUInt32BE(0) === 0x6B6F6C79; // "koly" signature
          
        case 'linux':
          // AppImage verification
          const appImageBuffer = fs.readFileSync(filePath, { start: 0, end: 4 });
          return appImageBuffer.readUInt32BE(0) === 0x7F454C46; // ELF header
          
        case 'android':
          // APK is a ZIP file
          const apkBuffer = fs.readFileSync(filePath, { start: 0, end: 4 });
          return apkBuffer.readUInt32LE(0) === 0x04034B50; // ZIP signature
          
        case 'ios':
          // IPA is also a ZIP file
          const ipaBuffer = fs.readFileSync(filePath, { start: 0, end: 4 });
          return ipaBuffer.readUInt32LE(0) === 0x04034B50; // ZIP signature
          
        default:
          return true;
      }
    } catch (error) {
      this.log(`Integrity check failed for ${platform}: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalPlatforms: Object.keys(PLATFORMS).length,
      verifiedPlatforms: Object.keys(this.results).length,
      failedPlatforms: this.errors.length,
      results: this.results,
      errors: this.errors,
      summary: {
        totalSize: Object.values(this.results).reduce((sum, r) => sum + r.size, 0),
        allPassed: this.errors.length === 0 && Object.keys(this.results).length === Object.keys(PLATFORMS).length
      }
    };

    // Write report to file
    const reportPath = path.resolve('build-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Build verification report saved to: ${reportPath}`);
    
    return report;
  }

  async run(platforms = Object.keys(PLATFORMS)) {
    this.log('Starting build verification process...');
    
    const results = [];
    for (const platform of platforms) {
      const success = await this.verifyPlatform(platform);
      results.push({ platform, success });
    }

    const report = await this.generateReport();
    
    // Print summary
    console.log('\n📊 BUILD VERIFICATION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total Platforms: ${report.totalPlatforms}`);
    console.log(`Verified: ${report.verifiedPlatforms}`);
    console.log(`Failed: ${report.failedPlatforms}`);
    console.log(`Total Size: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Overall Status: ${report.summary.allPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (Object.keys(this.results).length > 0) {
      console.log('\n✅ VERIFIED BUILDS:');
      Object.entries(this.results).forEach(([platform, result]) => {
        console.log(`  • ${platform}: ${result.sizeHuman} (${result.checksum.substring(0, 8)}...)`);
      });
    }

    return report.summary.allPassed;
  }
}

// CLI execution
if (require.main === module) {
  const platforms = process.argv.slice(2);
  const verifier = new BuildVerifier();
  
  verifier.run(platforms.length > 0 ? platforms : undefined)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = BuildVerifier;