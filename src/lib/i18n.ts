import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        confirm: 'Confirm',
        close: 'Close',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        yes: 'Yes',
        no: 'No',
        uploading: 'Uploading...',
        downloading: 'Downloading...',
        tryAgain: 'Please try again.',
        login: 'Login',
        logout: 'Logout'
      },
      navigation: {
        findScreens: "Find Screens",
        myCampaigns: "My Campaigns",
        dashboard: "Dashboard",
        learn: "Learn",
        downloadApp: "Download App",
        getStarted: "Get Started",
        howItWorks: "How It Works",
        home: "Home",
        features: "Features",
        pricing: "Pricing",
        contact: "Contact",
        signup: "Sign Up",
        profile: "Profile",
        settings: "Settings",
        adminPanel: "Admin Panel",
        projectOverview: "Project Overview",
        performance: "Performance",
        documentation: "Documentation",
        myAccount: "My Account",
        profileSettings: "Profile Settings",
        registerNewScreen: "Register New Screen",
        deviceSetup: "Device Setup",
        becomeScreenOwner: "Become Screen Owner",
        broadcasterGuide: "Broadcaster Guide",
        screenOwnerGuide: "Screen Owner Guide",
        becomeABroadcaster: "Become a Broadcaster",
        subscription: "Subscription"
      },
      hero: {
        title: "Democratize Screen-Based Advertising",
        subtitle: "Upload your content to nearby digital screens instantly. Turn any screen into an advertising opportunity.",
        platformLiveReady: "Platform Live & Ready",
        publicAdvertisingTitle: "PUBLIC ADVERTISING",
        forEveryoneTitle: "FOR EVERYONE",
        startBroadcasting: "Start Broadcasting",
        viewDemo: "View Demo",
        activeScreens: "Active Screens",
        monthlyViews: "Monthly Views",
        uptime: "Uptime",
        liveBroadcast: "Live Broadcast",
        uploadReady: "Upload Ready"
      },
      features: {
        title: "Powerful Features",
        subtitle: "For Everyone",
        description: "Everything you need to broadcast content and manage screens efficiently.",
        smartScreenNetwork: "Smart Screen Network",
        smartScreenNetworkDesc: "Connect to screens across multiple locations with our intelligent network.",
        easyContentUpload: "Easy Content Upload",
        easyContentUploadDesc: "Upload images, videos, and GIFs with drag-and-drop simplicity.",
        advancedScheduling: "Advanced Scheduling",
        advancedSchedulingDesc: "Schedule your content with precision timing and automation.",
        flexiblePricing: "Flexible Pricing",
        flexiblePricingDesc: "Pay-as-you-go pricing with transparent costs and no hidden fees.",
        secureReliable: "Secure & Reliable",
        secureReliableDesc: "Enterprise-grade security with 99.9% uptime guarantee.",
        realTimeAnalytics: "Real-time Analytics",
        realTimeAnalyticsDesc: "Track performance with detailed analytics and insights."
      },
      howItWorks: {
        title: "How It Works",
        subtitle: "In 3 Simple Steps",
        description: "From content upload to broadcast - streamlined for maximum efficiency.",
        step1Title: "Upload Content",
        step1Desc: "Upload your images, videos, or GIFs through our intuitive platform.",
        step2Title: "Find Screens",
        step2Desc: "Discover and select screens in your target locations using our map interface.",
        step3Title: "Start Broadcasting",
        step3Desc: "Schedule your content and start broadcasting to your selected screens.",
        professionalTitle: "Professional",
        hardwareSolutionTitle: "Hardware Solution",
        hardwareDescription: "Our plug-and-play dongle transforms any screen into a smart advertising display with enterprise-grade reliability.",
        feature4kSupport: "4K Ultra HD video support",
        featureConnectivity: "Wi-Fi and Ethernet connectivity",
        featureRemoteManagement: "Remote management & updates",
        featureMonitoring: "Real-time monitoring & analytics"
      },
      footer: {
        brandDescription: "Democratizing screen-based advertising for everyone.",
        platform: "Platform",
        forAdvertisers: "For Advertisers",
        forScreenOwners: "For Screen Owners",
        hardwareSolutions: "Hardware Solutions",
        apiDocumentation: "API Documentation",
        support: "Support",
        helpCenter: "Help Center",
        gettingStarted: "Getting Started",
        productionPlan: "Production Plan",
        technicalSupport: "Technical Support",
        contactSales: "Contact Sales",
        contact: "Contact",
        allRightsReserved: "© 2024 Red Square. All rights reserved.",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        cookiePolicy: "Cookie Policy"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: false, // Disable debug now that issue is fixed
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    initImmediate: false, // Ensures i18n is ready synchronously
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
    },
  });

export default i18n;