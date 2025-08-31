// Environment detection utility for RedSquare applications
export const isElectronApp = (): boolean => {
  return typeof window !== 'undefined' && window.navigator.userAgent.includes('Electron');
};

export const isAndroidTVApp = (): boolean => {
  return typeof window !== 'undefined' && (
    window.navigator.userAgent.includes('Android') && 
    window.navigator.userAgent.includes('TV')
  );
};

export const isTVApp = (): boolean => {
  return typeof window !== 'undefined' && (
    isAndroidTVApp() ||
    window.navigator.userAgent.includes('Tizen') ||
    window.navigator.userAgent.includes('webOS') ||
    window.navigator.userAgent.includes('Roku') ||
    window.navigator.userAgent.includes('SmartTV')
  );
};

export const isScreenApplication = (): boolean => {
  return isElectronApp() || isTVApp();
};

export const getApplicationMode = (): 'web' | 'mobile' | 'screen' | 'tv' => {
  if (isTVApp()) return 'tv';
  if (isElectronApp()) return 'screen';
  if (typeof window !== 'undefined' && window.innerWidth < 768) return 'mobile';
  return 'web';
};

export const shouldAutoRedirectToScreen = (): boolean => {
  return isScreenApplication();
};