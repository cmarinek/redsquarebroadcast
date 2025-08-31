import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.redsquare.screens',
  appName: 'RedSquare Screens',
  webDir: 'dist',
  server: {
    url: 'https://51087530-08cd-41c5-9bc4-bc6e5c990b78.lovableproject.com?forceHideBadge=true#/redsquare-screens',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0a0a0a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: false,
    },
  },
};

export default config;