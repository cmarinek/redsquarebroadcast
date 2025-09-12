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

// Remove the loading text when the page loads
window.addEventListener('DOMContentLoaded', () => {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.remove();
  }
});