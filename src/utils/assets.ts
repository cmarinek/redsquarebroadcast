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
  logo192: resolveAsset('/lovable-uploads/901ca0b5-a900-440e-b16d-bdd30112cc94.png'),
  logo512: resolveAsset('/lovable-uploads/901ca0b5-a900-440e-b16d-bdd30112cc94.png'),
  logo1024: resolveAsset('/lovable-uploads/901ca0b5-a900-440e-b16d-bdd30112cc94.png'),
  manifest: resolveAsset('/manifest.json'),
} as const;