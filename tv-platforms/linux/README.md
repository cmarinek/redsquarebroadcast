# RedSquare Screens - Linux Platform

Transform your Linux computer into a digital advertising display with RedSquare Screens.

## Overview

RedSquare Screens for Linux enables any Linux system to function as a digital advertising display, supporting multiple distributions and hardware configurations for flexible, cost-effective digital signage solutions.

## Installation

### Package Managers (Recommended)

#### Debian/Ubuntu (APT)
```bash
# Add RedSquare repository
curl -fsSL https://packages.redsquare.tv/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redsquare.gpg
echo "deb [signed-by=/usr/share/keyrings/redsquare.gpg] https://packages.redsquare.tv/apt stable main" | sudo tee /etc/apt/sources.list.d/redsquare.list

# Install RedSquare Screens
sudo apt update
sudo apt install redsquare-screens
```

#### Red Hat/CentOS/Fedora (DNF/YUM)
```bash
# Add RedSquare repository
sudo dnf config-manager --add-repo https://packages.redsquare.tv/rpm/redsquare.repo

# Install RedSquare Screens
sudo dnf install redsquare-screens
```

#### Arch Linux (AUR)
```bash
# Using yay AUR helper
yay -S redsquare-screens

# Or using makepkg
git clone https://aur.archlinux.org/redsquare-screens.git
cd redsquare-screens
makepkg -si
```

### AppImage (Universal)
1. Download RedSquare Screens AppImage
2. Make executable: `chmod +x RedSquareScreens.AppImage`
3. Run: `./RedSquareScreens.AppImage`

### Snap Package
```bash
sudo snap install redsquare-screens
```

### Flatpak
```bash
flatpak install flathub tv.redsquare.Screens
```

## Supported Distributions

### Tier 1 Support (Fully Tested)
- **Ubuntu**: 20.04 LTS, 22.04 LTS, 24.04 LTS
- **Debian**: 11 (Bullseye), 12 (Bookworm)
- **RHEL/CentOS**: 8, 9
- **Fedora**: Latest 3 releases
- **openSUSE**: Leap, Tumbleweed

### Tier 2 Support (Community Tested)
- **Mint**: Latest LTS versions
- **Pop!_OS**: Latest releases
- **Manjaro**: Rolling release
- **Elementary OS**: Latest stable
- **Zorin OS**: Latest versions

### Specialized Distributions
- **Raspberry Pi OS**: Optimized for Pi 4 and newer
- **Ubuntu Server**: Headless operation support
- **CentOS Stream**: Enterprise deployment
- **Alpine Linux**: Lightweight container deployments

## System Requirements

### Minimum Requirements
- **Architecture**: x86_64 (AMD64) or ARM64
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 1GB available disk space
- **Graphics**: OpenGL 2.1 compatible GPU
- **Network**: Ethernet or WiFi connectivity
- **Display**: 1920x1080 minimum resolution

### Recommended Specifications
- **CPU**: Multi-core processor (Intel i5/AMD Ryzen 5 equivalent)
- **RAM**: 8GB for optimal performance
- **Storage**: SSD with 5GB+ available space
- **Graphics**: Hardware-accelerated video decoding support
- **Network**: Gigabit Ethernet for commercial installations
- **Display**: 4K capable with proper GPU support

### Raspberry Pi Requirements
- **Model**: Raspberry Pi 4 Model B (4GB+ RAM recommended)
- **OS**: Raspberry Pi OS (64-bit recommended)
- **Storage**: Class 10 microSD card (32GB+) or USB SSD
- **Cooling**: Active cooling for continuous operation
- **Power**: Official Pi 4 power supply or equivalent

## Features

### Linux-Specific Features
- **Systemd Integration**: Native service management
- **Wayland/X11 Support**: Modern and legacy display server compatibility
- **Multiple Desktop Environments**: GNOME, KDE, XFCE, etc.
- **Container Support**: Docker and Podman deployment options
- **Package Management**: Native package manager integration

### Display Technologies
- **DRM/KMS**: Direct Rendering Manager for optimal performance
- **Hardware Acceleration**: VA-API, VDPAU support
- **Multi-Monitor**: Xrandr and wlr-randr configuration
- **Framebuffer**: Direct framebuffer access for embedded systems
- **HDR Support**: HDR10 on supported hardware and drivers

### Hardware Support
- **Intel Graphics**: Full hardware acceleration support
- **AMD Graphics**: Open-source and proprietary driver support
- **NVIDIA**: Proprietary driver integration
- **ARM Mali**: GPU acceleration on ARM devices
- **Broadcom VideoCore**: Raspberry Pi GPU optimization

## Installation and Setup

### Automated Installation
```bash
# Download and run installation script
curl -fsSL https://install.redsquare.tv/linux.sh | sudo bash

# Follow interactive setup prompts
sudo redsquare-screens --setup
```

### Manual Configuration
```bash
# Create configuration directory
sudo mkdir -p /etc/redsquare-screens

# Generate configuration file
sudo redsquare-screens --generate-config

# Edit configuration
sudo nano /etc/redsquare-screens/config.yaml

# Enable and start service
sudo systemctl enable redsquare-screens
sudo systemctl start redsquare-screens
```

### Container Deployment
```bash
# Docker deployment
docker run -d \
  --name redsquare-screens \
  --restart unless-stopped \
  -v /etc/redsquare-screens:/config \
  -e DISPLAY_ID=YOUR_DISPLAY_ID \
  redsquare/screens:latest

# Podman deployment
podman run -d \
  --name redsquare-screens \
  --restart unless-stopped \
  -v /etc/redsquare-screens:/config:Z \
  -e DISPLAY_ID=YOUR_DISPLAY_ID \
  redsquare/screens:latest
```

## Configuration

### Configuration File (YAML)
```yaml
# /etc/redsquare-screens/config.yaml
display:
  id: "RS-LINUX-XXXXXXXX"
  name: "Office Lobby Display"
  resolution: "1920x1080"
  rotation: 0
  
network:
  api_url: "https://api.redsquare.tv"
  timeout: 30
  retry_attempts: 3
  
content:
  cache_dir: "/var/cache/redsquare-screens"
  max_cache_size: "2GB"
  offline_mode: true
  
logging:
  level: "info"
  file: "/var/log/redsquare-screens/app.log"
  max_size: "10MB"
  rotate_count: 5
```

### Environment Variables
```bash
# Display configuration
export REDSQUARE_DISPLAY_ID="RS-LINUX-XXXXXXXX"
export REDSQUARE_API_URL="https://api.redsquare.tv"
export REDSQUARE_LOG_LEVEL="info"

# Hardware acceleration
export LIBVA_DRIVER_NAME="i965"  # Intel
export VDPAU_DRIVER="radeonsi"   # AMD
```

### Systemd Service Configuration
```ini
# /etc/systemd/system/redsquare-screens.service
[Unit]
Description=RedSquare Screens Digital Display
After=network-online.target graphical.target
Wants=network-online.target

[Service]
Type=simple
User=redsquare
Group=video
ExecStart=/usr/bin/redsquare-screens --daemon
Restart=always
RestartSec=10
Environment=DISPLAY=:0

[Install]
WantedBy=graphical.target
```

## Operation Modes

### Desktop Mode
- Runs as regular desktop application
- GUI interface for configuration and monitoring
- Suitable for development and testing environments
- Manual startup and control

### Service Mode (Recommended)
- Systemd service for automatic startup
- Background operation without desktop session
- Web-based remote configuration interface
- Automatic restart and recovery

### Kiosk Mode
- Dedicated full-screen display operation
- Minimal system services for optimal performance
- Auto-login and automatic application startup
- Locked-down system configuration

### Container Mode
- Docker/Podman container deployment
- Microservice architecture compatibility
- Easy scaling and orchestration
- Isolated execution environment

## Hardware Acceleration

### Intel Graphics
```bash
# Install Intel media drivers
sudo apt install intel-media-va-driver

# Verify VA-API support
vainfo

# Configure environment
export LIBVA_DRIVER_NAME=iHD
```

### AMD Graphics
```bash
# Install Mesa drivers
sudo apt install mesa-va-drivers

# Verify VDPAU support
vdpauinfo

# Configure environment
export VDPAU_DRIVER=radeonsi
```

### NVIDIA Graphics
```bash
# Install proprietary drivers
sudo apt install nvidia-driver-535

# Install VDPAU support
sudo apt install vdpau-va-driver

# Configure environment
export VDPAU_DRIVER=nvidia
```

### Raspberry Pi VideoCore
```bash
# Enable GPU memory split
sudo raspi-config
# Advanced Options > Memory Split > 128

# Enable hardware acceleration
echo 'gpu_mem=128' | sudo tee -a /boot/config.txt

# Install GPU firmware
sudo apt install raspi-config
```

## Performance Optimization

### System Tuning
```bash
# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable cups
sudo systemctl disable avahi-daemon

# Optimize kernel parameters
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf

# Configure CPU governor
echo 'performance' | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

### Graphics Optimization
```bash
# Configure compositing
export __GL_SYNC_TO_VBLANK=1
export __GL_YIELD="USLEEP"

# Disable desktop effects (KDE)
kwriteconfig5 --file kwinrc --group Compositing --key Enabled false

# Disable animations (GNOME)
gsettings set org.gnome.desktop.interface enable-animations false
```

### Network Optimization
```bash
# Increase network buffer sizes
echo 'net.core.rmem_max = 134217728' | sudo tee -a /etc/sysctl.conf
echo 'net.core.wmem_max = 134217728' | sudo tee -a /etc/sysctl.conf

# Optimize TCP settings
echo 'net.ipv4.tcp_congestion_control = bbr' | sudo tee -a /etc/sysctl.conf
```

## Security Configuration

### User and Permissions
```bash
# Create dedicated user
sudo useradd -r -s /bin/false -d /var/lib/redsquare-screens redsquare

# Add to required groups
sudo usermod -a -G video,audio redsquare

# Set up proper permissions
sudo chown -R redsquare:redsquare /var/lib/redsquare-screens
sudo chmod 750 /var/lib/redsquare-screens
```

### Firewall Configuration
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow out 80/tcp
sudo ufw allow out 443/tcp
sudo ufw deny in 22/tcp

# firewalld (RHEL/Fedora)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# iptables (manual)
sudo iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
```

### SELinux Configuration (RHEL/Fedora)
```bash
# Install SELinux policy
sudo dnf install redsquare-screens-selinux

# Set appropriate contexts
sudo restorecon -R /usr/bin/redsquare-screens
sudo restorecon -R /var/lib/redsquare-screens

# Check for denials
sudo ausearch -m AVC -ts recent
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check service status
sudo systemctl status redsquare-screens

# Check logs
sudo journalctl -u redsquare-screens -f

# Verify configuration
redsquare-screens --check-config
```

#### Display Issues
```bash
# Check display configuration
xrandr  # X11
wlr-randr  # Wayland

# Test hardware acceleration
vainfo  # VA-API
vdpauinfo  # VDPAU

# Check graphics drivers
lspci -k | grep -A 2 VGA
```

#### Network Connectivity
```bash
# Test connectivity
curl -I https://api.redsquare.tv

# Check DNS resolution
nslookup api.redsquare.tv

# Verify firewall rules
sudo iptables -L -n
```

### Performance Issues

#### High CPU Usage
```bash
# Check process usage
top -p $(pgrep redsquare-screens)

# Profile application
perf record -g redsquare-screens
perf report

# Check for hardware acceleration
grep -i "hardware" /var/log/redsquare-screens/app.log
```

#### Memory Leaks
```bash
# Monitor memory usage
watch -n 1 'ps aux | grep redsquare-screens'

# Check for memory issues
valgrind --leak-check=full redsquare-screens

# Analyze core dumps
sudo coredumpctl list redsquare-screens
```

## Advanced Configuration

### Custom Builds
```bash
# Build from source
git clone https://github.com/redsquare/screens-linux.git
cd screens-linux
make configure
make build
sudo make install
```

### Integration Scripts
```bash
#!/bin/bash
# Custom startup script
# /usr/local/bin/redsquare-startup.sh

# Configure displays
xrandr --output HDMI-1 --mode 1920x1080 --rotate left

# Set background
feh --bg-fill /usr/share/backgrounds/redsquare-bg.jpg

# Start application
/usr/bin/redsquare-screens --kiosk-mode
```

### Monitoring Integration
```bash
# Prometheus metrics endpoint
curl http://localhost:8080/metrics

# Grafana dashboard configuration
# Available at https://grafana.com/grafana/dashboards/redsquare-screens

# Custom monitoring script
#!/bin/bash
STATUS=$(curl -s http://localhost:8080/health)
if [ "$STATUS" != "OK" ]; then
    systemctl restart redsquare-screens
fi
```

## Support and Community

### Getting Help
- **Documentation**: [Linux Platform Guide](https://docs.redsquare.tv/linux)
- **GitHub**: [Issue Tracker](https://github.com/redsquare/screens-linux/issues)
- **Forums**: [Linux Community Forum](https://community.redsquare.tv/linux)
- **IRC**: `#redsquare-linux` on Libera.Chat

### Contributing
- **Bug Reports**: GitHub issues with detailed system information
- **Feature Requests**: Community forum discussion and voting
- **Code Contributions**: Pull requests welcome with proper testing
- **Documentation**: Help improve installation and configuration guides

### Professional Support
- **Enterprise Support**: Commercial support contracts available
- **Custom Integration**: Professional services for complex deployments
- **Training**: Linux administration and troubleshooting training
- **Consulting**: Architecture and deployment consultation services

---

*RedSquare Screens for Linux provides flexible, open-source digital signage capabilities with the reliability, performance, and customization options that Linux users expect.*