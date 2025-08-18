import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Language resources - will be expanded with more translations
const resources = {
  en: {
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
    dashboard: {
      title: "Powerful Dashboard Experience",
      subtitle: "Manage your campaigns and screens with our intuitive dashboard. Built for both advertisers and screen owners.",
      advertiserView: "Advertiser View",
      screenOwner: "Screen Owner",
      totalCampaigns: "Total Campaigns",
      totalViews: "Total Views",
      activeScreens: "Active Screens",
      totalSpent: "Total Spent",
      myScreens: "My Screens",
      monthlyRevenue: "Monthly Revenue",
      occupancyRate: "Occupancy Rate",
      activeCampaigns: "Active Campaigns",
      uploadNewContent: "Upload New Content",
      screenStatus: "Screen Status",
      revenueAnalytics: "Revenue Analytics",
      addMediaForCampaign: "Add media for your next campaign",
      manageCampaigns: "Manage your running campaigns",
      monitorScreenNetwork: "Monitor your screen network",
      trackEarnings: "Track your earnings performance",
      dragDropFiles: "Drag and drop your files here, or click to browse",
      selectFiles: "Select Files",
      viewDetailedAnalytics: "View Detailed Analytics",
      analytics: "Analytics",
      campaigns: "Campaigns",
      screens: "Screens",
      earnings: "Earnings",
      settings: "Settings",
      profile: "Profile"
    },
    screenDashboard: {
      title: "Screen Management Dashboard",
      subtitle: "Monitor and manage all your digital screens from one central location.",
      totalRevenue: "Total Revenue",
      activeBookings: "Active Bookings",
      screenUptime: "Screen Uptime",
      pendingApprovals: "Pending Approvals",
      addNewScreen: "Add New Screen",
      manageBookings: "Manage Bookings",
      viewAnalytics: "View Analytics",
      settings: "Settings",
      revenueThisMonth: "Revenue This Month",
      bookingsToday: "Bookings Today",
      averageUptime: "Average Uptime",
      contentApprovals: "Content Approvals"
    },
    roleSelection: {
      title: "Choose Your Role",
      subtitle: "Select how you want to use Red Square",
      broadcaster: {
        title: "Broadcaster",
        description: "Upload content and broadcast to screens",
        features: [
          "Upload images, videos, and GIFs",
          "Schedule broadcasts",
          "Target specific locations",
          "Track campaign performance"
        ]
      },
      screenOwner: {
        title: "Screen Owner",
        description: "Monetize your screens by renting them out",
        features: [
          "Register your screens",
          "Set availability and pricing",
          "Earn passive income",
          "Manage content approvals"
        ]
      },
      both: {
        title: "Both",
        description: "Access both broadcaster and screen owner features"
      },
      getStarted: "Get Started"
    },
    profile: {
      title: "Profile Settings",
      personalInfo: "Personal Information",
      displayName: "Display Name",
      email: "Email Address",
      preferences: "Preferences",
      notifications: "Notifications",
      privacy: "Privacy Settings",
      billing: "Billing Information",
      subscription: "Subscription",
      dangerZone: "Danger Zone",
      deleteAccount: "Delete Account",
      save: "Save Changes",
      cancel: "Cancel",
      update: "Update Profile"
    },
    broadcasterDashboard: {
      title: "Broadcaster Dashboard",
      subtitle: "Create and manage your advertising campaigns",
      totalSpent: "Total Spent",
      activeCampaigns: "Active Campaigns",
      totalImpressions: "Total Impressions",
      conversionRate: "Conversion Rate",
      createCampaign: "Create Campaign",
      uploadContent: "Upload Content",
      viewReports: "View Reports",
      manageBudget: "Manage Budget",
      campaignPerformance: "Campaign Performance",
      recentActivity: "Recent Activity",
      budgetUsage: "Budget Usage",
      targetAudience: "Target Audience"
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
      login: "Login",
      signup: "Sign Up",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout"
    },
    components: {
      hero: {
        title: "Democratize Screen-Based Advertising",
        subtitle: "Upload your content to nearby digital screens instantly. Turn any screen into an advertising opportunity.",
        uploadContent: "Upload Content",
        discoverScreens: "Discover Screens",
        registerScreen: "Register Your Screen",
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
        title: "Why Choose Red Square?",
        subtitle: "Everything you need to succeed in digital advertising",
        description: "Transform how advertising works with our innovative platform that connects broadcasters directly with screen owners.",
        smartScreenNetwork: "Smart Screen Network",
        smartScreenNetworkDesc: "Connect with thousands of screens worldwide through our intelligent matching system.",
        easyContentUpload: "Easy Content Upload",
        easyContentUploadDesc: "Upload your content in seconds with support for images, videos, and interactive media.",
        advancedScheduling: "Advanced Scheduling",
        advancedSchedulingDesc: "Schedule your campaigns with precision timing and automated optimization.",
        flexiblePricing: "Flexible Pricing",
        flexiblePricingDesc: "Choose from multiple pricing models that fit your budget and campaign goals.",
        secureReliable: "Secure & Reliable",
        secureReliableDesc: "Enterprise-grade security with 99.9% uptime guarantee for your campaigns.",
        realTimeAnalytics: "Real-time Analytics",
        realTimeAnalyticsDesc: "Track performance, engagement, and ROI with comprehensive analytics dashboard.",
        accessibleAdvertising: {
          title: "Accessible Advertising",
          description: "No minimum spends, complex contracts, or lengthy approval processes. Just upload and broadcast."
        },
        screenOwnerRevenue: {
          title: "Screen Owner Revenue",
          description: "Monetize your existing screens by renting them out to broadcasters in your area."
        },
        viralNetwork: {
          title: "Viral Network Effect",
          description: "As more screens join, more opportunities arise for both broadcasters and screen owners."
        },
        instantBroadcasting: {
          title: "Instant Broadcasting",
          description: "Upload your content and see it live on screens within minutes."
        },
        globalReach: {
          title: "Global Reach",
          description: "Connect with screens and audiences worldwide through our growing network."
        }
      },
      howItWorks: {
        title: "How Red Square Works",
        subtitle: "Getting started is simple",
        step1Title: "Discover & Connect",
        step1Desc: "Find screens near you or register your own screen to start earning revenue.",
        step2Title: "Upload & Schedule", 
        step2Desc: "Upload your content and schedule when it should be displayed on target screens.",
        step3Title: "Track & Optimize",
        step3Desc: "Monitor performance in real-time and optimize your campaigns for better results.",
        forBroadcasters: {
          title: "For Broadcasters",
          step1: {
            title: "Discover Screens",
            description: "Find nearby digital screens using our map or QR code scanner"
          },
          step2: {
            title: "Upload Content",
            description: "Upload your images, videos, or GIFs and preview them"
          },
          step3: {
            title: "Schedule & Pay",
            description: "Choose your time slot, pay securely, and watch your content go live"
          }
        },
        forScreenOwners: {
          title: "For Screen Owners",
          step1: {
            title: "Register Screen",
            description: "Add your screen using our dongle or smart TV app"
          },
          step2: {
            title: "Set Availability",
            description: "Configure your screen's availability times and pricing"
          },
          step3: {
            title: "Earn Revenue",
            description: "Approve content and earn money from broadcasters automatically"
          }
        }
      },
      navigation: {
        home: "Home",
        features: "Features",
        howItWorks: "How It Works",
        pricing: "Pricing",
        contact: "Contact",
        login: "Login",
        signup: "Sign Up",
        dashboard: "Dashboard",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        findScreens: "Find Screens",
        myCampaigns: "My Campaigns",
        learn: "Learn",
        downloadApp: "Download App",
        getStarted: "Get Started",
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
      footer: {
        company: "Company",
        about: "About Us",
        careers: "Careers",
        press: "Press",
        blog: "Blog",
        product: "Product",
        features: "Features",
        pricing: "Pricing",
        api: "API",
        support: "Support",
        help: "Help Center",
        contact: "Contact Us",
        status: "Status",
        legal: "Legal",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        cookies: "Cookie Policy",
        followUs: "Follow Us",
        newsletter: "Subscribe to our newsletter",
        emailPlaceholder: "Enter your email",
        subscribe: "Subscribe",
        allRightsReserved: "All rights reserved.",
        brandDescription: "Democratizing screen-based advertising for everyone. Connect broadcasters with screen owners worldwide.",
        platform: "Platform",
        forAdvertisers: "For Advertisers",
        forScreenOwners: "For Screen Owners", 
        hardwareSolutions: "Hardware Solutions",
        apiDocumentation: "API Documentation",
        helpCenter: "Help Center",
        gettingStarted: "Getting Started",
        productionPlan: "Production Plan",
        technicalSupport: "Technical Support",
        contactSales: "Contact Sales",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        cookiePolicy: "Cookie Policy"
      }
    },
    screenDiscovery: {
      title: "Discover Nearby Screens",
      subtitle: "Find the perfect screen for your content",
      searchPlaceholder: "Search by location, screen name, or ID",
      filters: "Filters",
      mapView: "Map View", 
      listView: "List View",
      scanQR: "Scan QR Code",
      noScreensFound: "No screens found in this area",
      screenDetails: "Screen Details",
      bookNow: "Book Now",
      pricePerSlot: "per time slot",
      available: "Available",
      busy: "Busy",
      offline: "Offline"
    },
    screenRegistration: {
      title: "Register Your Screen",
      subtitle: "Start earning revenue from your digital display",
      screenName: "Screen Name",
      screenNamePlaceholder: "Enter a name for your screen",
      location: "Location",
      locationPlaceholder: "Enter screen location",
      pricing: "Pricing",
      pricePerSlot: "Price per time slot",
      currency: "Currency",
      availability: "Availability",
      description: "Description",
      descriptionPlaceholder: "Describe your screen location and audience",
      screenType: "Screen Type",
      indoor: "Indoor",
      outdoor: "Outdoor",
      screenSize: "Screen Size",
      register: "Register Screen",
      generateQR: "Generate QR Code",
      screenRegistered: "Screen registered successfully!",
      setupInstructions: "Setup Instructions"
    },
    contentUpload: {
      title: "Upload Your Content",
      subtitle: "Share your message with the world",
      selectFiles: "Select Files",
      dragAndDrop: "Drag and drop files here, or click to select",
      supportedFormats: "Supported formats: JPG, PNG, GIF, MP4",
      maxFileSize: "Maximum file size: 50MB",
      preview: "Preview",
      upload: "Upload",
      uploading: "Uploading...",
      uploadComplete: "Upload complete!",
      selectScreen: "Select Screen",
      scheduleTime: "Schedule Time",
      duration: "Duration",
      minutes: "minutes",
      totalCost: "Total Cost",
      proceedToPayment: "Proceed to Payment"
    },
    auth: {
      login: {
        title: "Welcome Back",
        subtitle: "Sign in to your Red Square account",
        email: "Email Address",
        password: "Password",
        forgotPassword: "Forgot your password?",
        signIn: "Sign In",
        noAccount: "Don't have an account?",
        signUp: "Sign up here"
      },
      register: {
        title: "Create Your Account",
        subtitle: "Join the Red Square network",
        fullName: "Full Name",
        email: "Email Address",
        password: "Password",
        confirmPassword: "Confirm Password",
        agreeToTerms: "I agree to the Terms of Service and Privacy Policy",
        createAccount: "Create Account",
        haveAccount: "Already have an account?",
        signIn: "Sign in here"
      },
      forgotPassword: {
        title: "Reset Your Password",
        subtitle: "Enter your email to receive reset instructions",
        email: "Email Address",
        sendReset: "Send Reset Link",
        backToLogin: "Back to Login"
      }
    },
    regional: {
      selectRegion: 'Select Region',
      selectCountry: 'Select Country',
      selectLanguage: 'Select Language',
      currency: 'Currency',
      timezone: 'Timezone',
      region: 'Region',
      country: 'Country',
      language: 'Language',
      regions: {
        east_africa: 'East Africa',
        east_asia: 'East Asia',
        east_europe: 'East Europe',
        west_africa: 'West Africa',
        west_europe: 'West Europe',
        south_africa: 'South Africa'
      }
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      confirm: 'Confirmar',
      back: 'Atrás',
      next: 'Siguiente',
      close: 'Cerrar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      refresh: 'Actualizar',
      select: 'Seleccionar',
      upload: 'Subir',
      download: 'Descargar',
      share: 'Compartir',
      copy: 'Copiar',
      settings: 'Configuración',
      help: 'Ayuda',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      profile: 'Perfil',
      dashboard: 'Panel de control',
      home: 'Inicio',
      about: 'Acerca de',
      contact: 'Contacto',
      privacy: 'Política de privacidad',
      terms: 'Términos de servicio',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información'
    },
    regional: {
      selectRegion: 'Seleccionar Región',
      selectCountry: 'Seleccionar País',
      selectLanguage: 'Seleccionar Idioma',
      currency: 'Moneda',
      timezone: 'Zona horaria',
      region: 'Región',
      country: 'País',
      language: 'Idioma',
      regions: {
        east_africa: 'África Oriental',
        east_asia: 'Asia Oriental',
        east_europe: 'Europa Oriental',
        west_africa: 'África Occidental',
        west_europe: 'Europa Occidental',
        south_africa: 'África Meridional'
      }
    }
  },
  fr: {
    common: {
      loading: 'Chargement...',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      confirm: 'Confirmer',
      back: 'Retour',
      next: 'Suivant',
      close: 'Fermer',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      refresh: 'Actualiser',
      select: 'Sélectionner',
      upload: 'Télécharger',
      download: 'Télécharger',
      share: 'Partager',
      copy: 'Copier',
      settings: 'Paramètres',
      help: 'Aide',
      logout: 'Déconnexion',
      login: 'Connexion',
      register: "S'inscrire",
      profile: 'Profil',
      dashboard: 'Tableau de bord',
      home: 'Accueil',
      about: 'À propos',
      contact: 'Contact',
      privacy: 'Politique de confidentialité',
      terms: 'Conditions de service',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information'
    },
    regional: {
      selectRegion: 'Sélectionner la région',
      selectCountry: 'Sélectionner le pays',
      selectLanguage: 'Sélectionner la langue',
      currency: 'Devise',
      timezone: 'Fuseau horaire',
      region: 'Région',
      country: 'Pays',
      language: 'Langue',
      regions: {
        east_africa: 'Afrique de l\'Est',
        east_asia: 'Asie de l\'Est',
        east_europe: 'Europe de l\'Est',
        west_africa: 'Afrique de l\'Ouest',
        west_europe: 'Europe de l\'Ouest',
        south_africa: 'Afrique australe'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;