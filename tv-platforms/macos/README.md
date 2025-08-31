# RedSquare Screens - macOS Platform

Transform your Mac computer into a digital advertising display with RedSquare Screens.

## Overview

RedSquare Screens for macOS enables any Mac to function as a digital advertising display, turning iMacs, MacBooks, Mac minis, and Mac Studios into revenue-generating screens with native macOS integration.

## Installation

### Mac App Store (Future Release)
RedSquare Screens will be available in the Mac App Store for easy installation and automatic updates.

### Direct Download (Current Method)
1. Download the RedSquare Screens macOS installer (`.dmg`)
2. Open the DMG file and drag RedSquare Screens to Applications folder
3. Launch from Applications folder or Launchpad
4. Allow necessary permissions when prompted

### Enterprise Deployment
- Apple Business Manager integration for bulk deployment
- Mobile Device Management (MDM) deployment via Jamf or similar
- Silent installation options for automated deployment
- Custom package creation for enterprise distribution

## Features

### Display Capabilities
- **Retina Support**: Native high-DPI display optimization
- **5K/6K Support**: Pro Display XDR and Studio Display compatibility
- **Multi-Monitor**: Extended desktop across multiple displays
- **HDR Support**: High Dynamic Range content on compatible displays
- **Content Scheduling**: Automated content rotation with Calendar integration

### macOS-Specific Features
- **Launch Agent**: Background operation using macOS Launch Services
- **Menu Bar App**: Unobtrusive menu bar icon for easy access
- **Notification Center**: Native macOS notification integration
- **Shortcuts**: macOS Shortcuts app integration for automation
- **Handoff**: Seamless integration with other Apple devices

### Apple Ecosystem Integration
- **AirPlay**: Receive content from iOS devices via AirPlay
- **Universal Clipboard**: Copy content between Apple devices
- **Continuity Camera**: Use iPhone as camera for content capture
- **Screen Time**: Integration with macOS Screen Time controls

## System Requirements

### Minimum Requirements (Intel Macs)
- **macOS**: macOS Big Sur 11.0 or later
- **Processor**: Intel Core i5 (64-bit)
- **Memory**: 4GB RAM minimum
- **Storage**: 2GB available disk space
- **Graphics**: Intel integrated graphics or better
- **Network**: WiFi or Ethernet connectivity

### Minimum Requirements (Apple Silicon)
- **macOS**: macOS Big Sur 11.0 or later
- **Processor**: Apple M1 or later
- **Memory**: 8GB unified memory
- **Storage**: 2GB available disk space
- **Graphics**: Integrated Apple GPU
- **Network**: WiFi or Ethernet connectivity

### Recommended Specifications
- **macOS**: macOS Ventura 13.0 or later
- **Processor**: Apple M1 Pro/Max/Ultra or Intel Core i7
- **Memory**: 16GB or more
- **Storage**: SSD with 5GB+ available space
- **Graphics**: Dedicated GPU for 4K+ content
- **Network**: Gigabit Ethernet for commercial use

### Professional Display Requirements
- **iMac Pro/Studio Display**: Ideal for permanent installations
- **Pro Display XDR**: Premium commercial display option
- **Mac mini**: Cost-effective solution with external display
- **Mac Studio**: High-performance option for demanding content

## Installation and Configuration

### Standard Installation
1. Download RedSquare Screens DMG file
2. Verify digital signature (signed by Apple Developer Program)
3. Open DMG and drag app to Applications folder
4. Launch and complete initial setup wizard
5. Grant necessary permissions (Network, Screen Recording, etc.)

### Security and Permissions
- **Gatekeeper**: App is notarized for macOS security
- **System Preferences**: Grant screen recording and accessibility permissions
- **Privacy**: Configure location services if using nearby display discovery
- **Firewall**: Automatic firewall rule configuration

### Launch Agent Setup (Service Mode)
1. Enable "Launch at Login" in app preferences
2. Configure as Launch Agent for automatic startup
3. Set up background operation without user session
4. Configure automatic recovery from crashes or hangs

## Configuration Options

### Display Setup
1. Launch RedSquare Screens from Applications
2. Sign in with RedSquare account or create new account
3. Configure display resolution and preferences
4. Register screen with unique ID (format: RS-MAC-XXXXXXXX)
5. Set up content scheduling and display hours

### Network Configuration
- **WiFi**: macOS network preferences integration
- **Ethernet**: Preferred for commercial installations
- **VPN**: Corporate VPN client compatibility
- **Proxy**: Enterprise proxy configuration support
- **Bonjour**: Local network discovery capabilities

### Content Management
- **iCloud**: iCloud Drive integration for content storage
- **Photos**: macOS Photos app integration
- **Files**: Native file management and organization
- **Dropbox/Google Drive**: Third-party cloud storage support

## Operation Modes

### Desktop App Mode
- Full macOS application with standard interface
- Dock icon and menu bar presence
- Manual control and real-time configuration
- Suitable for interactive or temporary displays

### Menu Bar Mode
- Minimal interface with menu bar icon only
- Background operation with minimal user interaction
- Quick access to status and basic controls
- Ideal for permanent installations with occasional management

### Kiosk Mode (Full Screen)
- Dedicated full-screen display operation
- Hidden dock and menu bar for clean presentation
- Automatic content display without user interface
- Perfect for commercial signage applications

### Screensaver Mode
- Integration with macOS screensaver system
- Displays RedSquare content during screen idle time
- Automatic activation based on system idle settings
- Seamless transition between normal use and display mode

## Apple Integration Features

### Shortcuts and Automation
- **Shortcuts App**: Create custom workflows and automations
- **AppleScript**: Script integration for advanced automation
- **Calendar**: Schedule content using macOS Calendar app
- **Reminders**: Set up maintenance and content update reminders

### Continuity Features
- **Handoff**: Start content selection on iPhone, finish on Mac
- **Universal Clipboard**: Copy content URLs between devices
- **AirDrop**: Receive content files via AirDrop
- **Sidecar**: Use iPad as secondary display for content management

### Voice and Accessibility
- **Siri**: "Hey Siri, show display status" voice commands
- **VoiceOver**: Full accessibility support for visually impaired users
- **Voice Control**: Navigate interface using voice commands
- **Switch Control**: Support for adaptive hardware controls

## Performance Optimization

### Hardware Acceleration
- **Metal**: macOS Metal framework for GPU acceleration
- **VideoToolbox**: Hardware video decoding and encoding
- **Core Animation**: Smooth content transitions and effects
- **Grand Central Dispatch**: Efficient multi-core processing

### Memory and Storage
- **Automatic Reference Counting**: Efficient memory management
- **Compressed Memory**: macOS memory compression benefits
- **SSD Optimization**: Native SSD wear leveling and TRIM support
- **Content Caching**: Intelligent local content storage

### Power Management
- **Energy Saver**: Integration with macOS power management
- **Thermal Management**: Automatic thermal throttling prevention
- **Sleep/Wake**: Smart sleep scheduling during non-display hours
- **Battery Health**: MacBook battery optimization for extended use

## Security and Privacy

### macOS Security Integration
- **System Integrity Protection**: Full SIP compliance
- **Secure Boot**: Apple T2/Apple Silicon secure boot support
- **FileVault**: Disk encryption compatibility
- **Hardened Runtime**: Enhanced security for app execution

### Enterprise Security
- **Managed Apple ID**: Apple Business Manager integration
- **MDM Compliance**: Mobile Device Management support
- **Certificate Management**: Enterprise certificate deployment
- **Audit Logging**: Comprehensive security event logging

### Privacy Protection
- **Privacy-First Design**: Minimal data collection
- **Local Processing**: Content processing on device when possible
- **Encrypted Communications**: End-to-end encryption for all data
- **No Tracking**: No user behavior tracking or analytics collection

## Troubleshooting

### Installation Issues

#### App Cannot Be Opened (Gatekeeper)
- **Cause**: macOS security blocking unnotarized app
- **Solution**: Right-click app, select "Open", confirm in security dialog

#### Permission Denied Errors
- **Cause**: Insufficient permissions for screen recording or accessibility
- **Solution**: System Preferences > Security & Privacy > Grant permissions

#### Launch Agent Fails to Start
- **Cause**: Incorrect plist configuration or permissions
- **Solution**: Check Console app for errors, reinstall launch agent

### Runtime Issues

#### Content Not Loading
- **Cause**: Network connectivity or firewall blocking
- **Solution**: Check Network preferences, configure firewall exceptions

#### Poor Performance on Older Macs
- **Cause**: Hardware limitations or thermal throttling
- **Solution**: Reduce content quality, check Activity Monitor, improve cooling

#### App Crashes or Hangs
- **Cause**: macOS compatibility or memory issues
- **Solution**: Check Console logs, update macOS, restart application

### Display Issues

#### Resolution Problems
- Check Display preferences for correct scaling
- Ensure display is set to native resolution
- Update GPU drivers if using external graphics
- Reset display preferences to defaults if needed

#### Color Accuracy Issues
- Calibrate display using macOS Display Calibrator
- Check ColorSync profiles for display
- Ensure proper ambient lighting for color accuracy
- Consider professional display calibration for commercial use

### Network Connectivity

#### Frequent Disconnections
- Check WiFi signal strength and interference
- Reset network settings in Network preferences
- Update network drivers and firmware
- Use Ethernet connection for stability

## Advanced Features

### Developer Integration
- **Xcode**: Native development environment integration
- **Swift**: Native Swift API for custom integrations
- **Objective-C**: Legacy Objective-C support for existing tools
- **Core Data**: Native data management integration

### System Integration
- **Launch Services**: Deep macOS service integration
- **Spotlight**: Content search and indexing
- **Quick Look**: Preview content directly in Finder
- **Time Machine**: Automatic backup inclusion

### Commercial Features
- **Multi-User**: Support for multiple user accounts
- **Remote Management**: Screen Sharing and VNC compatibility
- **Fleet Management**: Bulk configuration and monitoring
- **Analytics**: Detailed performance and usage reporting

## Support and Resources

### Getting Help
- **Built-in Help**: Comprehensive help system within app
- **Email Support**: macos-support@redsquare.tv
- **Video Tutorials**: Platform-specific macOS guides
- **Community**: macOS user community discussions

### Professional Services
- **Site Survey**: Professional installation consultation
- **Configuration**: Expert setup and optimization
- **Training**: Staff training for operation and maintenance
- **Support Contracts**: Ongoing professional support options

### Updates and Maintenance
- **Automatic Updates**: App Store style automatic updates
- **Beta Program**: Early access to new features
- **macOS Compatibility**: Continuous compatibility testing
- **Performance Optimization**: Regular performance improvements

---

*RedSquare Screens for macOS provides seamless integration with Apple's ecosystem while delivering professional-grade digital signage capabilities with the reliability and user experience Mac users expect.*