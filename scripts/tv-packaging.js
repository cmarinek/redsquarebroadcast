#!/usr/bin/env node

/**
 * TV Platform Packaging Script
 * Creates platform-specific packages for Smart TV platforms
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const TV_PLATFORMS = {
  'samsung-tizen': {
    name: 'Samsung Tizen',
    description: 'Samsung Smart TV application package',
    buildCommand: 'npm run build:tv:samsung',
    packageFunction: packageTizen,
    configFiles: ['tizen/config.xml', 'tizen/icon.png'],
    outputDir: 'dist-tizen'
  },
  'lg-webos': {
    name: 'LG webOS',
    description: 'LG Smart TV application package',
    buildCommand: 'npm run build:tv:lg',
    packageFunction: packageWebOS,
    configFiles: ['webos/appinfo.json', 'webos/icon-80.png'],
    outputDir: 'dist-webos'
  },
  'roku': {
    name: 'Roku',
    description: 'Roku streaming application package',
    buildCommand: 'npm run build:tv:roku',
    packageFunction: packageRoku,
    configFiles: ['roku/manifest', 'roku/source/'],
    outputDir: 'dist-roku'
  },
  'android-tv': {
    name: 'Android TV',
    description: 'Android TV application package',
    buildCommand: 'npm run build:tv:android',
    packageFunction: packageAndroidTV,
    configFiles: ['androidtv/AndroidManifest.xml'],
    outputDir: 'dist-androidtv'
  }
};

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warning: '\x1b[33m'  // yellow
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

async function packageTizen() {
  log('📦 Packaging for Samsung Tizen...', 'info');
  
  const distDir = 'dist';
  const outputDir = 'dist-tizen';
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy build files
  execSync(`cp -r ${distDir}/* ${outputDir}/`, { stdio: 'inherit' });
  
  // Create Tizen config.xml
  const tizenConfig = `<?xml version="1.0" encoding="UTF-8"?>
<widget xmlns="http://www.w3.org/ns/widgets" xmlns:tizen="http://tizen.org/ns/widgets" 
        id="http://redsquarebroadcast.com/tv" version="1.0.0" viewmodes="maximized">
    <tizen:application id="redSquareTV" package="redSquareTV" required_version="5.0"/>
    <content src="index.html"/>
    <feature name="http://tizen.org/feature/screen.size.all"/>
    <icon src="icon.png"/>
    <name>Red Square TV</name>
    <tizen:privilege name="http://tizen.org/privilege/application.launch"/>
    <tizen:privilege name="http://tizen.org/privilege/internet"/>
    <tizen:privilege name="http://tizen.org/privilege/filesystem.read"/>
    <tizen:setting screen-orientation="landscape" context-menu="enable" background-support="disable" 
                   encryption="disable" install-location="auto" hwkey-event="enable"/>
</widget>`;

  fs.writeFileSync(path.join(outputDir, 'config.xml'), tizenConfig);
  
  // Create a simple icon if it doesn't exist
  if (!fs.existsSync(path.join(outputDir, 'icon.png'))) {
    // Copy a default icon or create one
    log('⚠️  Warning: No icon.png found, using default', 'warning');
  }
  
  // Create .wgt package
  const wgtPath = path.join(outputDir, 'RedSquareTV.wgt');
  await createZipPackage(outputDir, wgtPath, ['.wgt']);
  
  log('✅ Tizen package created successfully!', 'success');
  log(`📁 Package location: ${wgtPath}`, 'info');
}

async function packageWebOS() {
  log('📦 Packaging for LG webOS...', 'info');
  
  const distDir = 'dist';
  const outputDir = 'dist-webos';
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy build files
  execSync(`cp -r ${distDir}/* ${outputDir}/`, { stdio: 'inherit' });
  
  // Create webOS appinfo.json
  const webosConfig = {
    id: "com.redsquare.tv",
    version: "1.0.0",
    vendor: "Red Square Broadcasting",
    type: "web",
    main: "index.html",
    title: "Red Square TV",
    icon: "icon-80.png",
    largeIcon: "icon-130.png",
    splashBackground: "splash.png",
    transparent: false,
    enableSearchAPI: true,
    requestedWindowOrientation: "landscape",
    supportGIP: true,
    handlesRelaunch: true,
    iconColor: "#000000",
    bgColor: "#000000",
    imageForRecents: "icon-80.png",
    spinnerOnLaunch: true,
    removable: true,
    privileged: false,
    supportQuickStart: false,
    resolution: "1920x1080",
    allowVideoCapture: false,
    allowAudioCapture: false,
    mediaOption: {
      option: "audioGuidance",
      value: "on"
    }
  };

  fs.writeFileSync(path.join(outputDir, 'appinfo.json'), JSON.stringify(webosConfig, null, 2));
  
  // Create IPK package
  const ipkPath = path.join(outputDir, 'RedSquareTV.ipk');
  await createZipPackage(outputDir, ipkPath, ['.ipk']);
  
  log('✅ webOS package created successfully!', 'success');
  log(`📁 Package location: ${ipkPath}`, 'info');
}

async function packageRoku() {
  log('📦 Packaging for Roku...', 'info');
  
  const distDir = 'dist';
  const outputDir = 'dist-roku';
  
  // Create output directory structure
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const sourceDir = path.join(outputDir, 'source');
  const componentsDir = path.join(outputDir, 'components');
  const imagesDir = path.join(outputDir, 'images');
  
  [sourceDir, componentsDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Create Roku manifest
  const rokuManifest = `title=Red Square TV
major_version=1
minor_version=0
build_version=1
mm_icon_focus_hd=pkg:/images/icon_focus_hd.png
mm_icon_side_hd=pkg:/images/icon_side_hd.png
mm_icon_focus_sd=pkg:/images/icon_focus_sd.png
mm_icon_side_sd=pkg:/images/icon_side_sd.png
splash_screen_hd=pkg:/images/splash_hd.jpg
splash_screen_sd=pkg:/images/splash_sd.jpg
splash_color=#000000
splash_min_time=1000
ui_resolutions=hd
bs_const=DEBUG=false`;

  fs.writeFileSync(path.join(outputDir, 'manifest'), rokuManifest);
  
  // Create basic Roku BrightScript files
  const mainBrs = `sub Main()
    screen = CreateObject("roSGScreen")
    m.port = CreateObject("roMessagePort")
    screen.setMessagePort(m.port)
    
    scene = screen.CreateScene("MainScene")
    screen.show()
    
    while(true)
        msg = wait(0, m.port)
        msgType = type(msg)
        
        if msgType = "roSGScreenEvent"
            if msg.isScreenClosed() then return
        end if
    end while
end sub`;

  fs.writeFileSync(path.join(sourceDir, 'main.brs'), mainBrs);
  
  // Note: For a real Roku app, you'd need to implement the web content 
  // using Roku's scene graph XML and BrightScript
  log('⚠️  Note: Roku requires native BrightScript implementation', 'warning');
  log('   This package creates the basic structure only', 'warning');
  
  // Create ZIP package
  const zipPath = path.join(outputDir, 'RedSquareTV_roku.zip');
  await createZipPackage(outputDir, zipPath, ['.zip']);
  
  log('✅ Roku package structure created!', 'success');
  log(`📁 Package location: ${zipPath}`, 'info');
}

async function packageAndroidTV() {
  log('📦 Packaging for Android TV...', 'info');
  
  const distDir = 'dist';
  const outputDir = 'dist-androidtv';
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy build files to assets/www
  const assetsDir = path.join(outputDir, 'assets', 'www');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  execSync(`cp -r ${distDir}/* ${assetsDir}/`, { stdio: 'inherit' });
  
  // Create Android TV AndroidManifest.xml
  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.redsquare.tv">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <uses-feature
        android:name="android.software.leanback"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme"
        android:banner="@drawable/banner">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="sensorLandscape">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  fs.writeFileSync(path.join(outputDir, 'AndroidManifest.xml'), androidManifest);
  
  log('✅ Android TV package structure created!', 'success');
  log('   Use Android Studio to build the final APK', 'info');
  log(`📁 Package location: ${outputDir}`, 'info');
}

async function createZipPackage(sourceDir, outputPath, excludeExtensions = []) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      log(`📦 Package created: ${archive.pointer()} total bytes`, 'info');
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add files to archive, excluding certain extensions
    const files = fs.readdirSync(sourceDir);
    files.forEach(file => {
      const filePath = path.join(sourceDir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        archive.directory(filePath, file);
      } else {
        const ext = path.extname(file);
        if (!excludeExtensions.includes(ext)) {
          archive.file(filePath, { name: file });
        }
      }
    });

    archive.finalize();
  });
}

function buildPlatform(platform) {
  const config = TV_PLATFORMS[platform];
  if (!config) {
    log(`❌ Unknown platform: ${platform}`, 'error');
    process.exit(1);
  }

  log(`🚀 Building ${config.name}...`, 'info');
  log(`📝 ${config.description}`, 'info');

  try {
    // Run build command
    execSync(config.buildCommand, { stdio: 'inherit' });
    log(`✅ Build completed for ${config.name}!`, 'success');
    
    // Run packaging
    return config.packageFunction();
  } catch (error) {
    log(`❌ Build failed for ${config.name}`, 'error');
    log(error.message, 'error');
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
📺 Red Square TV Platform Packager

Usage: node scripts/tv-packaging.js [platform]

Available platforms:`);

  Object.entries(TV_PLATFORMS).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(15)} - ${config.description}`);
  });

  console.log(`
Examples:
  node scripts/tv-packaging.js samsung-tizen  # Package for Samsung Tizen
  node scripts/tv-packaging.js lg-webos       # Package for LG webOS
  node scripts/tv-packaging.js roku           # Package for Roku
  node scripts/tv-packaging.js android-tv     # Package for Android TV
  node scripts/tv-packaging.js all            # Package for all platforms

Notes:
- Make sure to run 'npm install' before packaging
- Platform-specific configuration files should be in their respective directories
- Some platforms may require additional setup or SDKs
`);
}

async function buildAll() {
  log('🚀 Building all TV platforms...', 'info');
  
  for (const platform of Object.keys(TV_PLATFORMS)) {
    try {
      await buildPlatform(platform);
      log(`✅ ${TV_PLATFORMS[platform].name} completed!`, 'success');
    } catch (error) {
      log(`❌ ${TV_PLATFORMS[platform].name} failed: ${error.message}`, 'error');
    }
  }
  
  log('🎉 All TV platform builds completed!', 'success');
}

// Main execution
const platform = process.argv[2];

if (!platform || platform === 'help' || platform === '--help' || platform === '-h') {
  showHelp();
} else if (platform === 'all') {
  buildAll().catch(console.error);
} else {
  buildPlatform(platform);
}