# RedSquare Screens - Android TV Installation Guide

## Installation Instructions

### For Android TV Device Owners:

1. **Enable Developer Options (if needed):**
   - Go to Settings → Device Preferences → About
   - Find "Build" and click it 7 times to enable Developer Options
   - Go back and access Developer Options
   - Enable "Apps from unknown sources" or "Unknown sources"

2. **Install RedSquare Screens:**

   **Method 1 - USB Installation:**
   - Download the latest `.apk` file to a USB drive
   - Connect USB drive to your Android TV
   - Use a file manager app to navigate to the APK
   - Install the APK file

   **Method 2 - ADB Installation (Advanced):**
   - Enable "USB debugging" in Developer Options
   - Connect via ADB: `adb connect [Android TV IP]`
   - Install APK: `adb install screens-android-tv-app.apk`

   **Method 3 - Downloader App:**
   - Install a file downloader app from Google Play Store
   - Download the APK directly to your Android TV
   - Install using the file manager

3. **Setup Your Screen:**
   - Launch RedSquare Screens from your Android TV apps
   - Note the Screen ID prominently displayed
   - Visit redsquare.app on any device to register your screen
   - Configure availability, pricing, and display preferences

## Features:

- **Android TV Optimized:** Native Android TV interface with leanback experience
- **D-Pad Navigation:** Full support for Android TV remote control navigation
- **4K Content Support:** Display ultra-high-resolution advertisements
- **Auto-Launch Options:** Start automatically when TV powers on
- **Voice Search Ready:** "OK Google, open RedSquare Screens"
- **Picture-in-Picture:** Continue displaying ads while using other TV functions (where supported)

## Device Compatibility:

- Android TV OS 5.0+ (API level 21+)
- Google TV (Chromecast with Google TV)
- NVIDIA Shield TV (all generations)
- Sony Android TVs (2015+)
- Philips Android TVs (2016+)
- TCL Android TVs (2017+)
- Hisense Android TVs (2018+)
- Xiaomi Mi TV / Mi Box series
- And many other Android TV certified devices

## Remote Control Guide:

- **Home Button:** Return to Android TV home (app continues in background)
- **Back Button:** Access screen settings and controls
- **D-Pad (Arrow Keys):** Navigate menus and interface
- **Select/OK Button:** Interact with on-screen elements
- **Menu Button:** Quick access to advanced settings
- **Voice Button:** "OK Google, open RedSquare Screens"

## Advanced Features:

### Screen Saver Integration:
RedSquare Screens can integrate with Android TV's screen saver functionality to automatically display content when the TV is idle.

### HDMI-CEC Support:
Compatible TVs can automatically switch inputs and control the app using your TV's main remote.

### Multi-Display Support:
For setups with multiple screens, each can run independently with unique Screen IDs.

## Performance Optimization:

- **Close Background Apps:** Use the task switcher to close unused apps
- **Stable Internet:** Ensure 10+ Mbps for 4K content, 5+ Mbps for HD
- **Wired Connection:** Use Ethernet for most reliable performance
- **Storage Management:** Keep at least 1GB free space for content caching
- **Auto-Restart:** Schedule weekly TV restarts for optimal performance

## Support & Troubleshooting:

### Installation Issues:
- **"App not installed":** Enable "Unknown sources" in Settings
- **"There was a problem parsing the package":** Re-download the APK file
- **"Insufficient storage":** Clear cache and free up space

### App Issues:
- **Black screen on launch:** Clear app cache in Settings → Apps → RedSquare Screens
- **Remote not responsive:** Restart the app or reboot the Android TV
- **No content displaying:** Check internet connection and screen registration

### Content Issues:
- **Blurry or pixelated content:** Check internet speed and content resolution settings
- **Audio not playing:** Verify TV audio settings and content audio format
- **Content not updating:** Force refresh by restarting the app

### Network Issues:
- **Connection timeouts:** Check firewall settings and port restrictions
- **Certificate errors:** Ensure TV date/time is correct
- **DNS issues:** Try using Google DNS (8.8.8.8, 8.8.4.4)

## Technical Specifications:

- **Minimum RAM:** 1GB (2GB+ recommended)
- **Storage:** 100MB app + cache space for content
- **Network:** Wi-Fi 802.11n or Ethernet
- **Display:** 720p minimum, 4K support available
- **Audio:** Stereo/5.1 surround sound support

## For Developers & Advanced Users:

### ADB Commands:
```bash
# Install app
adb install screens-android-tv-app.apk

# Launch app
adb shell am start -n com.redsquare.screens/.MainActivity

# Check app status
adb shell dumpsys package com.redsquare.screens

# Clear app data
adb shell pm clear com.redsquare.screens
```

### Logs & Debugging:
```bash
# View app logs
adb logcat | grep RedSquare

# View system info
adb shell getprop ro.build.version.release
```

## Support Channels:

For technical support or questions:
- **Web Support:** https://redsquare.app/support
- **Email:** support@redsquare.tv
- **Community Forum:** https://community.redsquare.app/android-tv
- **Live Chat:** Available 24/7 on our website
- **Video Tutorials:** https://youtube.com/redsquare-screens

## Business Use:

RedSquare Screens is perfect for:
- Retail displays and digital signage
- Restaurant menu boards
- Hotel lobby information displays
- Corporate office screens
- Waiting room entertainment
- Trade show and event displays

---

**Transform your Android TV into a professional revenue-generating digital display with RedSquare Screens!**

*Compatible with 500+ Android TV models worldwide. Start earning passive income from your TV today.*