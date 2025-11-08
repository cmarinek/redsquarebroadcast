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
    ].filter(Boolean),
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: true,
      rollupOptions: {
        external: isMobileTarget ? [
          '@capacitor/cli',
          '@capacitor/android',
          '@capacitor/ios'
        ] : [],
        output: {
          compact: true,
          generatedCode: {
            arrowFunctions: true,
            constBindings: true,
            objectShorthand: true,
          },
          // Separate chunks for different build targets
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
            supabase: ['@supabase/supabase-js'],
            ...(isScreenTarget && {
              screens: ['leaflet', 'react-leaflet', 'mapbox-gl'],
              player: ['dashjs', 'hls.js']
            }),
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
      },
    },
    chunkSizeWarningLimit: 1000,
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
      exclude: isMobileTarget ? [
        '@capacitor/cli',
        '@capacitor/android', 
        '@capacitor/ios'
      ] : [],
    },
  };
});
