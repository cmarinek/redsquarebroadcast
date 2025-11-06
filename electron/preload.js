const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Screen and display methods
  getScreenInfo: () => ipcRenderer.invoke('get-screen-info'),
  setFullscreen: (fullscreen) => ipcRenderer.invoke('set-fullscreen', fullscreen),
  setKioskMode: (kiosk) => ipcRenderer.invoke('set-kiosk-mode', kiosk),
  
  // Event listeners
  onEmergencyAdminAccess: (callback) => {
    ipcRenderer.on('emergency-admin-access', callback);
    return () => ipcRenderer.removeListener('emergency-admin-access', callback);
  },
  
  // App info
  isElectron: true,
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

const allowedEnvKeys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PROJECT_ID',
  'VITE_MAPBOX_PUBLIC_TOKEN',
  'VITE_STRIPE_PUBLISHABLE_KEY',
];

const runtimeEnv = allowedEnvKeys.reduce((acc, key) => {
  const value = process.env[key];
  if (typeof value === 'string' && value.length > 0) {
    acc[key] = value;
  }
  return acc;
}, {});

contextBridge.exposeInMainWorld('__APP_ENV__', Object.freeze(runtimeEnv));

// Remove the loading text when the page loads
window.addEventListener('DOMContentLoaded', () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.remove();
  }
});