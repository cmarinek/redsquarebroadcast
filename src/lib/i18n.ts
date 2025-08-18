import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Language resources - will be expanded with more translations
const resources = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      refresh: 'Refresh',
      select: 'Select',
      upload: 'Upload',
      download: 'Download',
      share: 'Share',
      copy: 'Copy',
      settings: 'Settings',
      help: 'Help',
      logout: 'Sign Out',
      login: 'Sign In',
      register: 'Sign Up',
      profile: 'Profile',
      dashboard: 'Dashboard',
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information'
    },
    navigation: {
      howItWorks: 'How It Works',
      learn: 'Learn',
      downloadApp: 'Download App',
      findScreens: 'Find Screens',
      getStarted: 'Get Started',
      adminPanel: 'Admin Panel',
      notifications: 'Notifications',
      myScreens: 'My Screens',
      myCampaigns: 'My Campaigns',
      analytics: 'Analytics',
      bookings: 'Bookings',
      earnings: 'Earnings',
      deviceSetup: 'Device Setup',
      mobileApp: 'Mobile App'
    },
    hero: {
      title: 'Democratize Digital Advertising',
      subtitle: 'Upload content to nearby screens or monetize your display with our global network',
      uploadContent: 'Upload Content',
      registerScreen: 'Register Screen',
      learnMore: 'Learn More'
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      signInWithGoogle: 'Sign in with Google',
      signUpWithGoogle: 'Sign up with Google',
      invalidCredentials: 'Invalid email or password',
      passwordTooShort: 'Password must be at least 6 characters',
      emailRequired: 'Email is required',
      passwordRequired: 'Password is required'
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
        east_europe: 'Eastern Europe',
        west_africa: 'West Africa',
        west_europe: 'Western Europe',
        south_africa: 'Southern Africa'
      }
    },
    screens: {
      registerScreen: 'Register Screen',
      screenName: 'Screen Name',
      location: 'Location',
      pricing: 'Pricing per 10 seconds',
      availability: 'Availability',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      paused: 'Paused',
      maintenance: 'Maintenance'
    },
    content: {
      uploadContent: 'Upload Content',
      selectFile: 'Select File',
      preview: 'Preview',
      schedule: 'Schedule',
      duration: 'Duration',
      startTime: 'Start Time',
      endTime: 'End Time',
      cost: 'Cost',
      payment: 'Payment'
    },
    errors: {
      somethingWentWrong: 'Something went wrong',
      networkError: 'Network error. Please check your connection.',
      unauthorized: 'You are not authorized to perform this action',
      notFound: 'The requested resource was not found',
      validationFailed: 'Please check your input and try again',
      uploadFailed: 'File upload failed. Please try again.',
      paymentFailed: 'Payment failed. Please try again.'
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
      logout: 'Cerrar Sesión',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      profile: 'Perfil',
      dashboard: 'Panel',
      home: 'Inicio',
      about: 'Acerca de',
      contact: 'Contacto',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información'
    },
    navigation: {
      howItWorks: 'Cómo Funciona',
      learn: 'Aprender',
      downloadApp: 'Descargar App',
      findScreens: 'Encontrar Pantallas',
      getStarted: 'Comenzar',
      adminPanel: 'Panel Admin',
      notifications: 'Notificaciones',
      myScreens: 'Mis Pantallas',
      myCampaigns: 'Mis Campañas',
      analytics: 'Analíticas',
      bookings: 'Reservas',
      earnings: 'Ganancias',
      deviceSetup: 'Configurar Dispositivo',
      mobileApp: 'App Móvil'
    },
    hero: {
      title: 'Democratizar la Publicidad Digital',
      subtitle: 'Sube contenido a pantallas cercanas o monetiza tu pantalla con nuestra red global',
      uploadContent: 'Subir Contenido',
      registerScreen: 'Registrar Pantalla',
      learnMore: 'Saber Más'
    },
    regional: {
      selectRegion: 'Seleccionar Región',
      selectCountry: 'Seleccionar País',
      selectLanguage: 'Seleccionar Idioma',
      currency: 'Moneda',
      timezone: 'Zona Horaria',
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
  .use(Backend)
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
      caches: ['localStorage']
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    }
  });

export default i18n;