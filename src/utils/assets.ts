/**
 * Asset resolution utility for different runtime environments
 * Handles file:// protocols, Capacitor apps, and Electron applications
 */

const isCapacitor = !!(window as any).Capacitor;
const isElectron = !!(window as any).electronAPI || !!(window as any).require || navigator.userAgent.includes('Electron');
const isFileProtocol = window.location.protocol === 'file:';

/**
 * Resolves asset paths for different environments
 * @param path - Asset path starting with /
 * @returns Resolved asset path
 */
export function resolveAsset(path: string): string {
  // Remove leading slash for relative path resolution
  const relativePath = path.startsWith('/') ? path.slice(1) : path;
  
  // For Capacitor apps, use the bundled assets
  if (isCapacitor) {
    return `./${relativePath}`;
  }
  
  // For Electron or file:// protocol, use relative paths
  if (isElectron || isFileProtocol) {
    return `./${relativePath}`;
  }
  
  // For web apps, use absolute paths
  return path;
}

/**
 * Common asset paths with environment-aware resolution
 */
export const assets = {
  logo192: resolveAsset('/icon-192x192.png'),
  logo512: resolveAsset('/icon-512x512.png'),
  logo1024: resolveAsset('/icon-1024x1024.png'),
  manifest: resolveAsset('/manifest.json'),
} as const;