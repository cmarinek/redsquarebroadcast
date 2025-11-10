module.exports = {
  appId: 'com.redsquare.screens',
  appName: 'RedSquare Screens',
  webDir: 'dist',
  ...(process.env.CAP_SERVER_URL && {
    server: {
      url: process.env.CAP_SERVER_URL,
      cleartext: true
    }
  }),
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