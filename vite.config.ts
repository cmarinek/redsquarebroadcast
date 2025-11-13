/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildTarget = process.env.VITE_BUILD_TARGET || process.env.BUILD_TARGET || 'web';
  const isTVOptimized = (process.env.VITE_TV_OPTIMIZED || process.env.TV_OPTIMIZED) === 'true';
  const isKioskMode = (process.env.VITE_KIOSK_MODE || process.env.KIOSK_MODE) === 'true';
  const isScreenTarget = buildTarget === 'screen';
  const isMobileTarget = buildTarget === 'mobile';
  const isElectronTarget = buildTarget === 'electron';
  const isCapacitor = (process.env.CAPACITOR === 'true' || process.env.VITE_CAPACITOR === 'true');
  
  return {
    // Use relative base for Capacitor mobile and electron builds, absolute for web
    base: (isMobileTarget || isElectronTarget || isCapacitor) ? './' : '/',
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_BUILD_TARGET': JSON.stringify(buildTarget),
      'import.meta.env.VITE_TV_OPTIMIZED': JSON.stringify(isTVOptimized),
      'import.meta.env.VITE_KIOSK_MODE': JSON.stringify(isKioskMode),
    },
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      // Prevent Capacitor CLI packages from being resolved/bundled
      {
        name: 'exclude-capacitor-packages',
        resolveId(id: string) {
          if (id.startsWith('@capacitor/cli') || 
              id.startsWith('@capacitor/android') || 
              id.startsWith('@capacitor/ios')) {
            return { id, external: true };
          }
          return null;
        }
      }
    ].filter(Boolean),
    build: {
      target: 'esnext',
      minify: mode === 'production' ? 'terser' : 'esbuild',
      sourcemap: mode === 'production',
      // Bundle size warning threshold (KB)
      chunkSizeWarningLimit: 500,
      // CSS code splitting for better caching
      cssCodeSplit: true,
      // Terser options for production
      ...(mode === 'production' && {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
          },
          mangle: {
            safari10: true,
          },
        },
      }),
      rollupOptions: {
        external: (id: string) => {
          // Always externalize Capacitor CLI packages (they're not meant to be bundled)
          if (id.startsWith('@capacitor/cli') ||
              id.startsWith('@capacitor/android') ||
              id.startsWith('@capacitor/ios')) {
            return true;
          }
          return false;
        },
        output: {
          compact: true,
          generatedCode: {
            arrowFunctions: true,
            constBindings: true,
            objectShorthand: true,
          },
          // Optimized chunk splitting strategy
          manualChunks: (id) => {
            // Core React libraries
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // React Router
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router';
            }
            // Radix UI components
            if (id.includes('node_modules/@radix-ui')) {
              return 'vendor-ui';
            }
            // Supabase
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            // TanStack Query
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Lucide icons
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            // Screen-specific dependencies
            if (isScreenTarget) {
              if (id.includes('leaflet') || id.includes('mapbox')) {
                return 'feature-maps';
              }
              if (id.includes('dashjs') || id.includes('hls.js')) {
                return 'feature-player';
              }
            }
            // Admin pages (lazy loaded)
            if (id.includes('/src/pages/Admin')) {
              return 'page-admin';
            }
            // Other large features can be split as needed
            return undefined;
          },
          // Screen-specific optimizations
          ...(isScreenTarget && {
            assetFileNames: (assetInfo) => {
              if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
              const info = assetInfo.name.split('.');
              const ext = info[info.length - 1];
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                return `assets/images/[name]-[hash][extname]`;
              }
              if (/woff2?|eot|ttf|otf/i.test(ext)) {
                return `assets/fonts/[name]-[hash][extname]`;
              }
              return `assets/[name]-[hash][extname]`;
            },
          }),
        },
      },
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        '@tanstack/react-query',
      ],
      exclude: isMobileTarget ? [
        '@capacitor/cli',
        '@capacitor/android',
        '@capacitor/ios'
      ] : [],
    },
  };
});
