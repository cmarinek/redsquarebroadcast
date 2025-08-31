# RedSquare Screens - Windows Platform

Transform your Windows PC or laptop into a digital advertising display with RedSquare Screens.

## Overview

RedSquare Screens for Windows enables any Windows computer to function as a digital advertising display, turning PCs, laptops, tablets, and digital signage hardware into revenue-generating screens.

## Installation

### Microsoft Store (Future Release)
RedSquare Screens will be available in the Microsoft Store for easy installation and automatic updates.

### Direct Download (Current Method)
1. Download the RedSquare Screens Windows installer (`.exe` or `.msi`)
2. Right-click installer and select "Run as administrator"
3. Follow installation wizard steps
4. Launch RedSquare Screens from Start Menu or desktop shortcut

### Enterprise Deployment
- Group Policy deployment for domain-joined computers
- Microsoft Intune (MDM) deployment for managed devices
- Silent installation options for bulk deployments
- Custom MSI packaging for enterprise distribution

## Features

### Display Capabilities
- **4K Support**: Native 3840x2160 resolution on compatible hardware
- **Multi-Monitor**: Extended desktop across multiple displays
- **HDR Support**: High Dynamic Range content on compatible displays
- **Content Scheduling**: Automated content rotation based on schedule
- **Kiosk Mode**: Full-screen operation with Windows integration

### Windows-Specific Features
- **Windows Service**: Background operation without user login
- **Task Scheduler**: Integration with Windows scheduled tasks
- **System Tray**: Minimized operation with tray icon control
- **Windows Updates**: Automatic coordination with Windows Update
- **PowerShell**: Command-line management and automation

### Hardware Integration
- **Touch Screen**: Support for Windows touch displays
- **Surface Devices**: Optimized for Microsoft Surface tablets
- **Digital Signage**: Compatible with commercial Windows signage hardware
- **USB Control**: USB device integration for sensors and controls

## System Requirements

### Minimum Requirements
- **OS**: Windows 10 version 1903 or later
- **Processor**: Intel Core i3 or AMD equivalent (64-bit)
- **Memory**: 4GB RAM minimum
- **Storage**: 2GB available disk space
- **Graphics**: DirectX 11 compatible graphics card
- **Network**: Ethernet or WiFi connectivity

### Recommended Specifications
- **OS**: Windows 11 version 22H2 or later
- **Processor**: Intel Core i5 or AMD Ryzen 5 (64-bit)
- **Memory**: 8GB RAM or more
- **Storage**: SSD with 5GB+ available space
- **Graphics**: Dedicated graphics card with 2GB+ VRAM
- **Network**: Gigabit Ethernet for commercial installations

### Professional/Commercial Requirements
- **OS**: Windows 10/11 Pro, Enterprise, or Education editions
- **Hardware**: Commercial-grade components for 24/7 operation
- **Display**: Commercial displays with proper cooling
- **UPS**: Uninterruptible power supply for reliability
- **Network**: Enterprise network with proper security

## Installation Types

### Standard Desktop Installation
- Regular Windows application installation
- User-level permissions and operation
- Manual startup and control
- Suitable for temporary or personal use

### Service Installation (Recommended)
- Windows service for automatic startup
- System-level operation independent of user login
- Automatic restart after system reboot
- Ideal for permanent commercial installations

### Kiosk Mode Installation
- Specialized Windows configuration for dedicated signage
- Automatic login and app startup
- Restricted user interface and system access
- Shell replacement for dedicated display hardware

## Configuration

### Initial Setup
1. Launch RedSquare Screens application
2. Sign in with RedSquare account or create new account
3. Configure display settings and resolution
4. Register screen with unique ID (format: RS-WIN-XXXXXXXX)
5. Set up content scheduling and preferences

### Display Configuration
- **Resolution**: Automatic detection and optimization
- **Refresh Rate**: 60Hz standard, higher rates supported
- **Color Calibration**: Windows color management integration
- **Multi-Monitor**: Extended or duplicated display modes
- **Rotation**: Portrait/landscape orientation support

### Network Configuration
- **WiFi**: Windows wireless configuration
- **Ethernet**: Preferred for commercial installations
- **VPN**: Corporate VPN integration support
- **Proxy**: Enterprise proxy server configuration
- **Firewall**: Windows Defender Firewall integration

### Performance Settings
- **Power Management**: Custom power profiles for 24/7 operation
- **Windows Updates**: Coordinated update scheduling
- **Resource Management**: CPU and memory optimization
- **Startup Programs**: Automatic startup configuration

## Operation Modes

### Interactive Mode
- Full Windows desktop access
- Manual content control and scheduling
- Real-time configuration changes
- Suitable for managed environments with IT support

### Service Mode (Recommended)
- Background service operation
- Automatic startup after system boot
- Web-based remote configuration
- Minimal local user interface

### Kiosk Mode
- Dedicated signage operation
- Restricted Windows shell
- Automatic recovery from errors
- No user interaction allowed

## Content Management

### Supported Formats
- **Images**: JPEG, PNG, BMP, GIF, TIFF, WebP
- **Videos**: MP4, AVI, WMV, MOV, MKV (hardware accelerated)
- **Web Content**: HTML5, CSS3, JavaScript via embedded browser
- **Documents**: PDF display support
- **Streaming**: RTMP, HLS, DASH protocols

### Content Storage
- **Local Cache**: Automatic content caching for offline operation
- **Network Storage**: UNC path and mapped drive support
- **Cloud Integration**: OneDrive, SharePoint integration
- **USB Storage**: External storage device support

### Content Optimization
- **Hardware Acceleration**: GPU-accelerated video decoding
- **Memory Management**: Efficient content loading and unloading
- **Bandwidth Optimization**: Adaptive quality based on connection
- **Caching Strategy**: Intelligent content pre-loading

## Remote Management

### Web Dashboard
- Browser-based configuration and monitoring
- Real-time status and performance metrics
- Content upload and scheduling
- Multi-screen management

### PowerShell Integration
- Command-line configuration and control
- Scripting support for automation
- Bulk configuration management
- Integration with existing IT tools

### Windows Admin Center
- Integration with Windows Admin Center for server management
- Remote desktop capabilities for troubleshooting
- Performance monitoring and alerting
- Centralized logging and diagnostics

## Security Features

### Windows Security Integration
- Windows Defender integration
- User Account Control (UAC) compliance
- Windows Firewall automatic configuration
- BitLocker encryption support

### Enterprise Security
- Domain joining and Group Policy support
- Active Directory authentication
- Certificate-based authentication
- Audit logging and compliance reporting

### Network Security
- TLS 1.3 encryption for all communications
- Certificate pinning for API connections
- VPN and proxy server support
- Network access control (NAC) compliance

## Troubleshooting

### Installation Issues

#### Installation Blocked by Windows
- **Cause**: Windows SmartScreen or antivirus blocking installation
- **Solution**: Right-click installer, select Properties, check "Unblock" checkbox

#### Service Installation Fails
- **Cause**: Insufficient permissions or conflicting services
- **Solution**: Run installer as administrator, check Windows Event Log

#### Application Won't Start
- **Cause**: Missing dependencies or corrupted installation
- **Solution**: Reinstall Microsoft Visual C++ Redistributables, repair installation

### Runtime Issues

#### Content Not Loading
- **Cause**: Network connectivity or Windows Firewall blocking
- **Solution**: Check internet connection, configure firewall rules

#### Poor Video Performance
- **Cause**: Insufficient hardware or outdated drivers
- **Solution**: Update graphics drivers, reduce video quality settings

#### System Crashes or Freezes
- **Cause**: Hardware issues or driver conflicts
- **Solution**: Check Windows Event Log, update drivers, run hardware diagnostics

### Performance Issues

#### High CPU Usage
- Check for Windows Update activity
- Disable unnecessary startup programs
- Update to latest version of RedSquare Screens
- Consider hardware upgrade for demanding content

#### Memory Usage Issues
- Increase virtual memory/page file size
- Close unnecessary applications
- Check for memory leaks in Windows Event Log
- Consider RAM upgrade for content-intensive displays

### Network Issues

#### Frequent Disconnections
- Check network adapter driver updates
- Configure network adapter power management
- Test with wired Ethernet connection
- Contact network administrator for enterprise networks

## Enterprise Features

### Active Directory Integration
- Domain authentication and authorization
- Group Policy-based configuration
- Centralized user and computer management
- Single sign-on (SSO) capabilities

### Management Tools
- **SCCM Integration**: System Center Configuration Manager deployment
- **Intune Support**: Microsoft Intune mobile device management
- **PowerShell DSC**: Desired State Configuration for automated setup
- **WMI/CIM**: Windows Management Instrumentation for monitoring

### Monitoring and Analytics
- Windows Performance Toolkit integration
- Event Tracing for Windows (ETW) support
- Performance counters for system monitoring
- Custom logging and alerting capabilities

## Professional Services

### Installation and Setup
- Professional installation services available
- Site survey and hardware recommendations
- Custom configuration and optimization
- Staff training and documentation

### Support Options
- **Standard Support**: Email and online documentation
- **Professional Support**: Phone support and remote assistance
- **Enterprise Support**: Dedicated account management and SLA
- **24/7 Support**: Critical infrastructure monitoring and support

### Maintenance Contracts
- Regular health checks and optimization
- Proactive monitoring and alerting
- Automatic updates and patch management
- Hardware replacement and warranty services

---

*RedSquare Screens for Windows provides enterprise-grade digital signage capabilities with the reliability, security, and manageability that Windows environments require.*