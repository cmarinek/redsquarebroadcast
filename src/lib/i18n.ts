import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

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
    debug: true, // Enable debug temporarily
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