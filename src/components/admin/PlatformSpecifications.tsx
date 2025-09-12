import { useState } from "react";
import { Monitor, Smartphone, Tv, Server, HardDrive, Cpu, Wifi, Shield, Download, ExternalLink, Copy, QrCode, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type Platform = 'redsquare_android' | 'redsquare_ios' | 'redsquare_web' | 'screens_android_tv' | 'screens_android_mobile' | 'screens_ios' | 'screens_windows' | 'screens_macos' | 'screens_linux' | 'screens_amazon_fire' | 'screens_roku' | 'screens_samsung_tizen' | 'screens_lg_webos' | 'system_test';

interface PlatformSpec {
  icon: React.ComponentType<any>;
  name: string;
  description: string;
  category: 'main' | 'screens' | 'test';
  status: 'stable' | 'beta' | 'coming-soon' | 'deprecated';
  fileExtension: string;
  fileSize: string;
  technical: {
    buildSystem: string;
    runtime: string;
    architecture: string[];
    frameworks: string[];
  };
  requirements: {
    os: string[];
    ram: string;
    storage: string;
    network: string;
    display?: string;
    hardware?: string[];
  };
  installation: {
    methods: string[];
    complexity: 'easy' | 'moderate' | 'advanced';
    developerMode?: boolean;
    sideloading?: boolean;
    store?: string;
  };
  features: {
    core: string[];
    platformSpecific: string[];
    limitations?: string[];
  };
  compatibility: {
    devices: string[];
    versions: string[];
    tested: string[];
    known_issues?: string[];
  };
  deployment: {
    enterprise: boolean;
    massSideload: boolean;
    remoteManagement: boolean;
    updateMechanism: string;
  };
}

const PLATFORM_SPECIFICATIONS: Record<Platform, PlatformSpec> = {
  redsquare_android: {
    icon: Smartphone,
    name: "RedSquare Android",
    description: "Main mobile app for advertisers and screen owners",
    category: 'main',
    status: 'stable',
    fileExtension: 'apk',
    fileSize: '~25MB',
    technical: {
      buildSystem: 'Capacitor + Android Studio',
      runtime: 'Android Runtime (ART)',
      architecture: ['arm64-v8a', 'armeabi-v7a', 'x86_64'],
      frameworks: ['React', 'Capacitor', 'Tailwind CSS']
    },
    requirements: {
      os: ['Android 7.0+', 'API Level 24+'],
      ram: '2GB minimum, 4GB recommended',
      storage: '100MB free space',
      network: 'WiFi or cellular data connection',
      hardware: ['Camera (for QR scanning)', 'GPS (for location features)']
    },
    installation: {
      methods: ['Google Play Store', 'APK sideload', 'Enterprise deployment'],
      complexity: 'easy',
      sideloading: true,
      store: 'Google Play Store'
    },
    features: {
      core: ['Screen discovery', 'Content upload', 'Booking system', 'Payment processing', 'Real-time notifications'],
      platformSpecific: ['QR code scanning', 'GPS location', 'Push notifications', 'Biometric authentication'],
      limitations: ['Requires internet connectivity for most features']
    },
    compatibility: {
      devices: ['Android phones', 'Android tablets', 'Chrome OS devices'],
      versions: ['Android 7.0 - 14.0'],
      tested: ['Samsung Galaxy series', 'Google Pixel series', 'OnePlus devices'],
      known_issues: ['Some older Huawei devices may have location issues']
    },
    deployment: {
      enterprise: true,
      massSideload: true,
      remoteManagement: true,
      updateMechanism: 'Auto-update via Play Store or manual APK'
    }
  },
  redsquare_ios: {
    icon: Smartphone,
    name: "RedSquare iOS",
    description: "Main mobile app for advertisers and screen owners",
    category: 'main',
    status: 'stable',
    fileExtension: 'ipa',
    fileSize: '~30MB',
    technical: {
      buildSystem: 'Capacitor + Xcode',
      runtime: 'iOS Runtime',
      architecture: ['arm64'],
      frameworks: ['React', 'Capacitor', 'Tailwind CSS']
    },
    requirements: {
      os: ['iOS 13.0+', 'iPadOS 13.0+'],
      ram: '3GB minimum, 4GB recommended',
      storage: '150MB free space',
      network: 'WiFi or cellular data connection'
    },
    installation: {
      methods: ['App Store', 'TestFlight', 'Enterprise deployment'],
      complexity: 'easy',
      store: 'Apple App Store'
    },
    features: {
      core: ['Screen discovery', 'Content upload', 'Booking system', 'Payment processing', 'Real-time notifications'],
      platformSpecific: ['Face ID/Touch ID', 'Core Location', 'AVFoundation video', 'Apple Pay integration'],
      limitations: ['App Store review required for public distribution']
    },
    compatibility: {
      devices: ['iPhone 6s and newer', 'iPad (5th gen and newer)', 'iPad Pro all models', 'iPad Air 2 and newer'],
      versions: ['iOS 13.0 - 17.0'],
      tested: ['iPhone 12-15 series', 'iPad Pro 2021-2023', 'iPad Air 4-5']
    },
    deployment: {
      enterprise: true,
      massSideload: false,
      remoteManagement: true,
      updateMechanism: 'Auto-update via App Store'
    }
  },
  redsquare_web: {
    icon: Monitor,
    name: "RedSquare Web",
    description: "Progressive web app accessible from any browser",
    category: 'main',
    status: 'stable',
    fileExtension: 'zip',
    fileSize: '~5MB compressed',
    technical: {
      buildSystem: 'Vite + React',
      runtime: 'Modern web browsers',
      architecture: ['Universal (JavaScript)'],
      frameworks: ['React', 'Vite', 'Tailwind CSS', 'PWA']
    },
    requirements: {
      os: ['Any modern OS with web browser'],
      ram: '2GB system RAM',
      storage: '50MB browser cache',
      network: 'Internet connection required',
      display: '1024x768 minimum resolution'
    },
    installation: {
      methods: ['Direct web access', 'PWA install', 'Offline cache'],
      complexity: 'easy'
    },
    features: {
      core: ['Full platform functionality', 'Cross-platform compatibility', 'Offline support', 'Push notifications'],
      platformSpecific: ['PWA installation', 'Web notifications', 'Service worker caching', 'Responsive design'],
      limitations: ['Limited file system access', 'Browser-dependent features']
    },
    compatibility: {
      devices: ['Desktop computers', 'Laptops', 'Tablets', 'Mobile devices'],
      versions: ['Chrome 88+', 'Firefox 85+', 'Safari 14+', 'Edge 88+'],
      tested: ['Chrome', 'Firefox', 'Safari', 'Edge']
    },
    deployment: {
      enterprise: true,
      massSideload: false,
      remoteManagement: true,
      updateMechanism: 'Automatic web updates'
    }
  },
  screens_android_tv: {
    icon: Tv,
    name: "RedSquare Screens (Android TV)",
    description: "Content display app for Android TV devices",
    category: 'screens',
    status: 'stable',
    fileExtension: 'apk',
    fileSize: '~20MB',
    technical: {
      buildSystem: 'Capacitor + Android Studio (TV target)',
      runtime: 'Android TV Runtime',
      architecture: ['arm64-v8a', 'x86_64'],
      frameworks: ['React', 'Capacitor', 'Android TV Leanback']
    },
    requirements: {
      os: ['Android TV 7.0+', 'API Level 24+'],
      ram: '2GB minimum, 4GB recommended',
      storage: '500MB free space (for content caching)',
      network: 'Stable WiFi connection (5Mbps+ recommended)',
      display: '1080p minimum, 4K supported',
      hardware: ['HDMI output', 'Remote control support']
    },
    installation: {
      methods: ['Google Play Store (TV)', 'APK sideload', 'ADB install'],
      complexity: 'moderate',
      sideloading: true,
      developerMode: true
    },
    features: {
      core: ['Full-screen content display', 'Automated scheduling', 'Remote management', 'Content caching'],
      platformSpecific: ['TV remote navigation', '4K video support', 'HDMI CEC control', 'Ambient mode'],
      limitations: ['No touch interface', 'Limited local storage']
    },
    compatibility: {
      devices: ['Android TV boxes', 'Smart TVs with Android TV', 'NVIDIA Shield', 'Chromecast with Google TV'],
      versions: ['Android TV 7.0 - 13.0'],
      tested: ['NVIDIA Shield TV', 'Xiaomi Mi Box', 'Sony Android TVs', 'TCL Android TVs'],
      known_issues: ['Some older boxes may have HEVC decoding issues']
    },
    deployment: {
      enterprise: true,
      massSideload: true,
      remoteManagement: true,
      updateMechanism: 'Remote update via API or Play Store'
    }
  },
  screens_android_mobile: {
    icon: Smartphone,
    name: "RedSquare Screens (Android Mobile)",
    description: "Content display app for Android mobile devices used as screens",
    category: 'screens',
    status: 'stable',
    fileExtension: 'apk',
    fileSize: '~22MB',
    technical: {
      buildSystem: 'Capacitor + Android Studio (Phone/Tablet target)',
      runtime: 'Android Runtime (ART)',
      architecture: ['arm64-v8a', 'armeabi-v7a'],
      frameworks: ['React', 'Capacitor', 'Android Kiosk Mode']
    },
    requirements: {
      os: ['Android 7.0+', 'API Level 24+'],
      ram: '3GB minimum, 4GB recommended',
      storage: '1GB free space (for content caching)',
      network: 'WiFi connection recommended',
      display: '5-inch minimum, any aspect ratio',
      hardware: ['Accelerometer', 'Orientation sensor']
    },
    installation: {
      methods: ['Google Play Store', 'APK sideload', 'Enterprise deployment'],
      complexity: 'easy',
      sideloading: true
    },
    features: {
      core: ['Kiosk mode operation', 'Content display', 'Remote management', 'Orientation lock'],
      platformSpecific: ['Touch interaction', 'Device administration', 'Kiosk launcher', 'Battery optimization'],
      limitations: ['Requires device admin permissions for kiosk mode']
    },
    compatibility: {
      devices: ['Android phones', 'Android tablets', 'Rugged Android devices'],
      versions: ['Android 7.0 - 14.0'],
      tested: ['Samsung tablets', 'Lenovo tablets', 'Amazon Fire tablets (with Google Play)']
    },
    deployment: {
      enterprise: true,
      massSideload: true,
      remoteManagement: true,
      updateMechanism: 'Remote update via API or Play Store'
    }
  },
  screens_ios: {
    icon: Smartphone,
    name: "RedSquare Screens (iOS Mobile)",
    description: "Content display app for iOS devices used as screens",
    category: 'screens',
    status: 'stable',
    fileExtension: 'ipa',
    fileSize: '~25MB',
    technical: {
      buildSystem: 'Capacitor + Xcode (iOS target)',
      runtime: 'iOS Runtime',
      architecture: ['arm64'],
      frameworks: ['React', 'Capacitor', 'iOS Guided Access']
    },
    requirements: {
      os: ['iOS 13.0+', 'iPadOS 13.0+'],
      ram: '3GB minimum',
      storage: '1GB free space (for content caching)',
      network: 'WiFi connection required',
      display: 'Any iOS device screen'
    },
    installation: {
      methods: ['App Store', 'Enterprise deployment', 'Apple Configurator'],
      complexity: 'moderate'
    },
    features: {
      core: ['Guided Access mode', 'Content display', 'Remote management', 'Orientation control'],
      platformSpecific: ['Guided Access integration', 'MDM support', 'AirPlay receiver', 'Low power mode'],
      limitations: ['Requires manual Guided Access setup', 'App Store approval for public distribution']
    },
    compatibility: {
      devices: ['iPhone 6S and newer', 'iPad (5th gen and newer)', 'iPad Pro all models'],
      versions: ['iOS 13.0 - 17.0'],
      tested: ['iPad Pro models', 'iPad Air', 'iPhone 12-15 series']
    },
    deployment: {
      enterprise: true,
      massSideload: false,
      remoteManagement: true,
      updateMechanism: 'App Store or enterprise distribution'
    }
  },
  screens_windows: {
    icon: Monitor,
    name: "RedSquare Screens (Windows)",
    description: "Content display app for Windows-based screens",
    category: 'screens',
    status: 'stable',
    fileExtension: 'exe',
    fileSize: '~80MB installer',
    technical: {
      buildSystem: 'Electron + Windows SDK',
      runtime: 'Electron/Chromium',
      architecture: ['x64', 'arm64'],
      frameworks: ['React', 'Electron', 'Windows APIs']
    },
    requirements: {
      os: ['Windows 10 (1809+)', 'Windows 11'],
      ram: '4GB minimum, 8GB recommended',
      storage: '2GB free space',
      network: 'Ethernet or WiFi connection',
      display: '1280x720 minimum, 4K supported',
      hardware: ['Hardware video acceleration recommended']
    },
    installation: {
      methods: ['MSI installer', 'Portable executable', 'Group Policy deployment'],
      complexity: 'easy'
    },
    features: {
      core: ['Full-screen kiosk mode', 'Multi-monitor support', 'Hardware acceleration', 'Auto-start'],
      platformSpecific: ['Windows services integration', 'Group Policy support', 'DirectX acceleration', 'UWP notifications'],
      limitations: ['Requires Windows defender exclusions for optimal performance']
    },
    compatibility: {
      devices: ['Desktop PCs', 'All-in-one computers', 'Mini PCs', 'Digital signage players'],
      versions: ['Windows 10 (1809+)', 'Windows 11 all versions'],
      tested: ['Intel NUC', 'Dell OptiPlex', 'HP Elite series', 'Lenovo ThinkCentre']
    },
    deployment: {
      enterprise: true,
      massSideload: false,
      remoteManagement: true,
      updateMechanism: 'Auto-updater or MSI deployment'
    }
  },
  screens_macos: {
    icon: Monitor,
    name: "RedSquare Screens (macOS)",
    description: "Content display app for macOS-based screens",
    category: 'screens',
    status: 'beta',
    fileExtension: 'dmg',
    fileSize: '~120MB disk image',
    technical: {
      buildSystem: 'Electron + Xcode tools',
      runtime: 'Electron/Chromium',
      architecture: ['x64', 'arm64 (Apple Silicon)'],
      frameworks: ['React', 'Electron', 'macOS APIs']
    },
    requirements: {
      os: ['macOS 10.15+', 'macOS Big Sur+', 'macOS Monterey+'],
      ram: '4GB minimum, 8GB recommended',
      storage: '2GB free space',
      network: 'WiFi or Ethernet connection',
      display: '1280x800 minimum, Retina supported'
    },
    installation: {
      methods: ['DMG installer', 'Mac App Store (future)', 'Enterprise deployment'],
      complexity: 'easy'
    },
    features: {
      core: ['Full-screen display', 'Multi-display support', 'Retina optimization', 'Menu bar integration'],
      platformSpecific: ['Touch Bar support', 'macOS notifications', 'Spotlight integration', 'AirPlay receiver'],
      limitations: ['Gatekeeper may require manual approval', 'Notarization required for distribution']
    },
    compatibility: {
      devices: ['MacBook Pro/Air', 'iMac', 'Mac mini', 'Mac Studio', 'Mac Pro'],
      versions: ['macOS 10.15 - 14.0'],
      tested: ['MacBook Pro (Intel/M1/M2)', 'iMac 24-inch', 'Mac mini M1/M2']
    },
    deployment: {
      enterprise: true,
      massSideload: false,
      remoteManagement: true,
      updateMechanism: 'Auto-updater or App Store'
    }
  },
  screens_linux: {
    icon: Monitor,
    name: "RedSquare Screens (Linux)",
    description: "Content display app for Linux-based screens",
    category: 'screens',
    status: 'beta',
    fileExtension: 'AppImage',
    fileSize: '~90MB AppImage',
    technical: {
      buildSystem: 'Electron + Linux build tools',
      runtime: 'Electron/Chromium',
      architecture: ['x64', 'arm64'],
      frameworks: ['React', 'Electron', 'Linux APIs']
    },
    requirements: {
      os: ['Ubuntu 18.04+', 'Debian 10+', 'CentOS 8+', 'Fedora 32+'],
      ram: '4GB minimum, 8GB recommended',
      storage: '2GB free space',
      network: 'Network connection required',
      display: 'X11 or Wayland display server'
    },
    installation: {
      methods: ['AppImage (portable)', 'DEB package', 'RPM package', 'Snap package'],
      complexity: 'moderate'
    },
    features: {
      core: ['Full-screen kiosk mode', 'Multi-monitor support', 'Auto-start with systemd', 'Hardware acceleration'],
      platformSpecific: ['Systemd integration', 'D-Bus notifications', 'Wayland support', 'GTK theming'],
      limitations: ['May require additional codecs for some video formats']
    },
    compatibility: {
      devices: ['Desktop PCs', 'Single-board computers', 'Raspberry Pi 4+', 'Industrial PCs'],
      versions: ['Ubuntu 18.04+', 'Debian 10+', 'RHEL 8+', 'Arch Linux'],
      tested: ['Ubuntu 20.04/22.04', 'Raspberry Pi OS', 'CentOS 8', 'Fedora 36+']
    },
    deployment: {
      enterprise: true,
      massSideload: false,
      remoteManagement: true,
      updateMechanism: 'Package manager or AppImage update'
    }
  },
  screens_amazon_fire: {
    icon: Tv,
    name: "RedSquare Screens (Amazon Fire TV)",
    description: "Content display app for Amazon Fire TV devices",
    category: 'screens',
    status: 'stable',
    fileExtension: 'apk',
    fileSize: '~18MB',
    technical: {
      buildSystem: 'Capacitor + Fire TV SDK',
      runtime: 'Fire OS (Android-based)',
      architecture: ['arm64-v8a', 'armeabi-v7a'],
      frameworks: ['React', 'Capacitor', 'Fire TV APIs']
    },
    requirements: {
      os: ['Fire OS 6.0+', 'Based on Android 7.0+'],
      ram: '2GB minimum, 4GB recommended',
      storage: '500MB free space',
      network: 'WiFi connection required',
      display: '1080p minimum, 4K supported',
      hardware: ['Fire TV remote', 'HDMI output']
    },
    installation: {
      methods: ['Amazon Appstore', 'APK sideload', 'ADB install'],
      complexity: 'moderate',
      sideloading: true,
      developerMode: true
    },
    features: {
      core: ['Fire TV optimized UI', 'Voice remote support', '4K HDR content', 'Alexa integration'],
      platformSpecific: ['Alexa voice commands', 'Fire TV launcher integration', 'Amazon services', 'Parental controls'],
      limitations: ['Amazon Appstore approval required', 'Limited to Fire TV ecosystem']
    },
    compatibility: {
      devices: ['Fire TV Stick 4K', 'Fire TV Cube', 'Fire TV Stick (3rd gen)', 'Fire TV (3rd gen)'],
      versions: ['Fire OS 6.0 - 7.0'],
      tested: ['Fire TV Stick 4K Max', 'Fire TV Cube 2nd gen', 'Fire TV Stick Lite']
    },
    deployment: {
      enterprise: true,
      massSideload: true,
      remoteManagement: true,
      updateMechanism: 'Amazon Appstore or sideload update'
    }
  },
  screens_roku: {
    icon: Tv,
    name: "RedSquare Screens (Roku)",
    description: "Content display app for Roku streaming devices",
    category: 'screens',
    status: 'coming-soon',
    fileExtension: 'zip',
    fileSize: '~5MB channel package',
    technical: {
      buildSystem: 'BrightScript + Roku SDK',
      runtime: 'Roku OS',
      architecture: ['Roku proprietary'],
      frameworks: ['BrightScript', 'SceneGraph', 'Roku APIs']
    },
    requirements: {
      os: ['Roku OS 9.0+'],
      ram: '512MB minimum (varies by model)',
      storage: '100MB free space',
      network: 'WiFi connection required',
      display: '720p minimum, 4K supported on compatible models'
    },
    installation: {
      methods: ['Roku Channel Store', 'Developer mode sideload'],
      complexity: 'advanced',
      sideloading: true,
      developerMode: true
    },
    features: {
      core: ['Native Roku channel', 'Remote control navigation', 'Content streaming', 'Screensaver mode'],
      platformSpecific: ['Roku remote integration', 'Voice search', 'Roku feed integration', 'Private channel support'],
      limitations: ['BrightScript development required', 'Roku certification needed for public channel']
    },
    compatibility: {
      devices: ['Roku Ultra', 'Roku Streaming Stick 4K+', 'Roku Express', 'Roku TVs'],
      versions: ['Roku OS 9.0+'],
      tested: ['Roku Ultra (2020-2022)', 'Roku Streaming Stick 4K+']
    },
    deployment: {
      enterprise: false,
      massSideload: true,
      remoteManagement: true,
      updateMechanism: 'Roku Channel Store or developer sideload'
    }
  },
  screens_samsung_tizen: {
    icon: Tv,
    name: "RedSquare Screens (Samsung Smart TV)",
    description: "Content display app for Samsung Tizen smart TVs",
    category: 'screens',
    status: 'coming-soon',
    fileExtension: 'tpk',
    fileSize: '~15MB Tizen package',
    technical: {
      buildSystem: 'Tizen Studio + Samsung TV SDK',
      runtime: 'Tizen OS',
      architecture: ['ARM', 'x86'],
      frameworks: ['HTML5', 'CSS3', 'JavaScript', 'Tizen APIs']
    },
    requirements: {
      os: ['Tizen OS 4.0+', 'Samsung Smart TV (2018+)'],
      ram: '1.5GB minimum',
      storage: '200MB free space',
      network: 'WiFi or Ethernet connection',
      display: '1080p minimum, 4K/8K supported'
    },
    installation: {
      methods: ['Samsung Smart TV App Store', 'Developer mode sideload'],
      complexity: 'advanced',
      sideloading: true,
      developerMode: true
    },
    features: {
      core: ['Native Tizen app', 'Smart remote support', '4K/8K content', 'Samsung services integration'],
      platformSpecific: ['Bixby integration', 'SmartThings connectivity', 'OneRemote support', 'Samsung account'],
      limitations: ['Samsung developer partnership required', 'TV-specific development']
    },
    compatibility: {
      devices: ['Samsung QLED TVs (2018+)', 'Samsung Crystal UHD TVs', 'Samsung Neo QLED TVs'],
      versions: ['Tizen OS 4.0 - 7.0'],
      tested: ['Samsung QN85A series', 'Samsung AU7000 series']
    },
    deployment: {
      enterprise: false,
      massSideload: true,
      remoteManagement: true,
      updateMechanism: 'Samsung App Store or developer install'
    }
  },
  screens_lg_webos: {
    icon: Tv,
    name: "RedSquare Screens (LG Smart TV)",
    description: "Content display app for LG webOS smart TVs",
    category: 'screens',
    status: 'coming-soon',
    fileExtension: 'ipk',
    fileSize: '~12MB webOS package',
    technical: {
      buildSystem: 'webOS SDK + LG Developer Tools',
      runtime: 'webOS',
      architecture: ['ARM'],
      frameworks: ['HTML5', 'CSS3', 'JavaScript', 'webOS APIs']
    },
    requirements: {
      os: ['webOS 4.0+', 'LG Smart TV (2018+)'],
      ram: '2GB minimum',
      storage: '200MB free space',
      network: 'WiFi or Ethernet connection',
      display: '1080p minimum, 4K/8K supported'
    },
    installation: {
      methods: ['LG Content Store', 'Developer mode install'],
      complexity: 'advanced',
      sideloading: true,
      developerMode: true
    },
    features: {
      core: ['Native webOS app', 'Magic Remote support', '4K/8K content', 'LG services integration'],
      platformSpecific: ['ThinQ AI integration', 'Magic Remote pointer', 'webOS launcher', 'LG account'],
      limitations: ['LG developer partnership required', 'webOS-specific development']
    },
    compatibility: {
      devices: ['LG OLED TVs (2018+)', 'LG NanoCell TVs', 'LG UltraFine displays'],
      versions: ['webOS 4.0 - 23.0'],
      tested: ['LG C1 OLED series', 'LG UP7500 series']
    },
    deployment: {
      enterprise: false,
      massSideload: true,
      remoteManagement: true,
      updateMechanism: 'LG Content Store or developer install'
    }
  },
  system_test: {
    icon: Server,
    name: "System Test Platform",
    description: "Internal testing and validation platform",
    category: 'test',
    status: 'stable',
    fileExtension: 'zip',
    fileSize: '~10MB test suite',
    technical: {
      buildSystem: 'Node.js + Testing Framework',
      runtime: 'Multi-platform test runner',
      architecture: ['Universal'],
      frameworks: ['Jest', 'Playwright', 'Custom test tools']
    },
    requirements: {
      os: ['Any OS with Node.js support'],
      ram: '4GB minimum',
      storage: '1GB free space',
      network: 'Internet connection for CI/CD'
    },
    installation: {
      methods: ['Direct execution', 'CI/CD integration'],
      complexity: 'advanced'
    },
    features: {
      core: ['Automated testing', 'Build validation', 'Performance testing', 'Integration testing'],
      platformSpecific: ['GitHub Actions integration', 'Automated reporting', 'Multi-platform testing'],
      limitations: ['For internal use only']
    },
    compatibility: {
      devices: ['Development machines', 'CI/CD servers', 'Testing infrastructure'],
      versions: ['Node.js 16+'],
      tested: ['GitHub Actions', 'Local development']
    },
    deployment: {
      enterprise: false,
      massSideload: false,
      remoteManagement: false,
      updateMechanism: 'Git repository updates'
    }
  }
};

const getStatusColor = (status: PlatformSpec['status']) => {
  switch (status) {
    case 'stable': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'beta': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'coming-soon': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'deprecated': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getComplexityColor = (complexity: PlatformSpec['installation']['complexity']) => {
  switch (complexity) {
    case 'easy': return 'bg-green-500/10 text-green-500';
    case 'moderate': return 'bg-yellow-500/10 text-yellow-500';
    case 'advanced': return 'bg-red-500/10 text-red-500';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const PlatformSpecifications = () => {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('redsquare_android');
  const [activeCategory, setActiveCategory] = useState<'main' | 'screens' | 'test'>('main');

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`
      });
    });
  };

  const platforms = Object.entries(PLATFORM_SPECIFICATIONS) as [Platform, PlatformSpec][];
  const categorizedPlatforms = platforms.reduce((acc, [key, spec]) => {
    if (!acc[spec.category]) acc[spec.category] = [];
    acc[spec.category].push([key, spec]);
    return acc;
  }, {} as Record<string, [Platform, PlatformSpec][]>);

  const currentSpec = PLATFORM_SPECIFICATIONS[selectedPlatform];
  const IconComponent = currentSpec.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Platform Specifications</h2>
        <p className="text-muted-foreground">
          Comprehensive technical specifications and deployment information for all RedSquare applications.
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Main Apps
          </TabsTrigger>
          <TabsTrigger value="screens" className="flex items-center gap-2">
            <Tv className="w-4 h-4" />
            Screen Apps
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            System Test
          </TabsTrigger>
        </TabsList>

        {/* Platform Grid for each category */}
        {(['main', 'screens', 'test'] as const).map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorizedPlatforms[category]?.map(([key, spec]) => {
                const PlatformIcon = spec.icon;
                return (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedPlatform === key ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPlatform(key)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PlatformIcon className="w-8 h-8 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{spec.name}</CardTitle>
                            <CardDescription className="text-sm">{spec.fileExtension.toUpperCase()}</CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(spec.status)}>
                          {spec.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{spec.description}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{spec.fileSize}</span>
                        <Badge variant="outline" className={getComplexityColor(spec.installation.complexity)}>
                          {spec.installation.complexity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detailed Specifications */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IconComponent className="w-10 h-10 text-primary" />
              <div>
                <CardTitle className="text-2xl">{currentSpec.name}</CardTitle>
                <CardDescription>{currentSpec.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(currentSpec.status)}>
                {currentSpec.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyToClipboard(selectedPlatform, 'Platform ID')}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy ID
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {/* Technical Specifications */}
            <AccordionItem value="technical">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Technical Specifications
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Build System</Label>
                    <p className="text-sm text-muted-foreground">{currentSpec.technical.buildSystem}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Runtime</Label>
                    <p className="text-sm text-muted-foreground">{currentSpec.technical.runtime}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Architecture</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentSpec.technical.architecture.map((arch) => (
                        <Badge key={arch} variant="secondary" className="text-xs">
                          {arch}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Frameworks</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentSpec.technical.frameworks.map((framework) => (
                        <Badge key={framework} variant="outline" className="text-xs">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">File Size</Label>
                    <p className="text-sm text-muted-foreground">{currentSpec.fileSize}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">File Extension</Label>
                    <p className="text-sm text-muted-foreground font-mono">.{currentSpec.fileExtension}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* System Requirements */}
            <AccordionItem value="requirements">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  System Requirements
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Operating System</Label>
                    <div className="space-y-1 mt-1">
                      {currentSpec.requirements.os.map((os) => (
                        <p key={os} className="text-sm text-muted-foreground">• {os}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Memory (RAM)</Label>
                    <p className="text-sm text-muted-foreground">{currentSpec.requirements.ram}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Storage</Label>
                    <p className="text-sm text-muted-foreground">{currentSpec.requirements.storage}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Network</Label>
                    <p className="text-sm text-muted-foreground">{currentSpec.requirements.network}</p>
                  </div>
                  {currentSpec.requirements.display && (
                    <div>
                      <Label className="text-sm font-medium">Display</Label>
                      <p className="text-sm text-muted-foreground">{currentSpec.requirements.display}</p>
                    </div>
                  )}
                  {currentSpec.requirements.hardware && (
                    <div>
                      <Label className="text-sm font-medium">Hardware</Label>
                      <div className="space-y-1 mt-1">
                        {currentSpec.requirements.hardware.map((hw) => (
                          <p key={hw} className="text-sm text-muted-foreground">• {hw}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Installation */}
            <AccordionItem value="installation">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Installation & Deployment
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Installation Methods</Label>
                    <div className="space-y-1 mt-1">
                      {currentSpec.installation.methods.map((method) => (
                        <p key={method} className="text-sm text-muted-foreground">• {method}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Complexity</Label>
                    <Badge className={getComplexityColor(currentSpec.installation.complexity)}>
                      {currentSpec.installation.complexity}
                    </Badge>
                  </div>
                  {currentSpec.installation.store && (
                    <div>
                      <Label className="text-sm font-medium">App Store</Label>
                      <p className="text-sm text-muted-foreground">{currentSpec.installation.store}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Enterprise Deployment</Label>
                    <Badge variant={currentSpec.deployment.enterprise ? "default" : "secondary"}>
                      {currentSpec.deployment.enterprise ? "Supported" : "Not Available"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Mass Sideload</Label>
                    <Badge variant={currentSpec.deployment.massSideload ? "default" : "secondary"}>
                      {currentSpec.deployment.massSideload ? "Supported" : "Not Available"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Remote Management</Label>
                    <Badge variant={currentSpec.deployment.remoteManagement ? "default" : "secondary"}>
                      {currentSpec.deployment.remoteManagement ? "Supported" : "Not Available"}
                    </Badge>
                  </div>
                </div>
                {(currentSpec.installation.developerMode || currentSpec.installation.sideloading) && (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      {currentSpec.installation.developerMode && "Requires developer mode to be enabled. "}
                      {currentSpec.installation.sideloading && "Supports sideloading for enterprise deployment."}
                    </AlertDescription>
                  </Alert>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Features */}
            <AccordionItem value="features">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Features & Capabilities
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Core Features</Label>
                    <div className="space-y-1 mt-2">
                      {currentSpec.features.core.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <p className="text-sm text-muted-foreground">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Platform-Specific Features</Label>
                    <div className="space-y-1 mt-2">
                      {currentSpec.features.platformSpecific.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          <p className="text-sm text-muted-foreground">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {currentSpec.features.limitations && (
                  <div>
                    <Label className="text-sm font-medium">Limitations</Label>
                    <div className="space-y-1 mt-2">
                      {currentSpec.features.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-yellow-500" />
                          <p className="text-sm text-muted-foreground">{limitation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Compatibility */}
            <AccordionItem value="compatibility">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Compatibility & Testing
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Supported Devices</Label>
                    <div className="space-y-1 mt-1">
                      {currentSpec.compatibility.devices.map((device) => (
                        <p key={device} className="text-sm text-muted-foreground">• {device}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">OS Versions</Label>
                    <div className="space-y-1 mt-1">
                      {currentSpec.compatibility.versions.map((version) => (
                        <p key={version} className="text-sm text-muted-foreground">• {version}</p>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium">Tested Hardware</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentSpec.compatibility.tested.map((device) => (
                        <Badge key={device} variant="outline" className="text-xs">
                          {device}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {currentSpec.compatibility.known_issues && (
                  <Alert>
                    <ExternalLink className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Known Issues:</strong>
                      <ul className="mt-2 space-y-1">
                        {currentSpec.compatibility.known_issues.map((issue) => (
                          <li key={issue} className="text-sm">• {issue}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyToClipboard(currentSpec.technical.buildSystem, 'Build system')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Build Info
            </Button>
            <Button
              variant="outline"  
              size="sm"
              onClick={() => handleCopyToClipboard(
                `${currentSpec.name}\nFile: .${currentSpec.fileExtension}\nSize: ${currentSpec.fileSize}\nOS: ${currentSpec.requirements.os.join(', ')}`,
                'Platform summary'
              )}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Copy Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyToClipboard(currentSpec.deployment.updateMechanism, 'Update mechanism')}
            >
              <Download className="w-4 h-4 mr-2" />
              Copy Update Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};