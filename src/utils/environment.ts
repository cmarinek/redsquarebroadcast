// Environment detection utility for RedSquare applications
export const isElectronApp = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           typeof navigator !== 'undefined' && 
           navigator.userAgent.includes('Electron');
  } catch {
    return false;
  }
};

export const isAndroidTVApp = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           typeof navigator !== 'undefined' && (
      navigator.userAgent.includes('Android') && 
      navigator.userAgent.includes('TV')
    );
  } catch {
    return false;
  }
};

export const isTVApp = (): boolean => {
  try {
    return typeof window !== 'undefined' && 
           typeof navigator !== 'undefined' && (
      isAndroidTVApp() ||
      navigator.userAgent.includes('Tizen') ||
      navigator.userAgent.includes('webOS') ||
      navigator.userAgent.includes('Roku') ||
      navigator.userAgent.includes('SmartTV')
    );
  } catch {
    return false;
  }
};

export const isScreenApplication = (): boolean => {
  return isElectronApp() || isTVApp();
};

export const getApplicationMode = (): 'web' | 'mobile' | 'screen' | 'tv' => {
  try {
    if (isTVApp()) return 'tv';
    if (isElectronApp()) return 'screen';
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'mobile';
    return 'web';
  } catch {
    return 'web';
  }
};
