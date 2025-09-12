/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildTarget = process.env.VITE_BUILD_TARGET || 'web';
  const isTVOptimized = process.env.VITE_TV_OPTIMIZED === 'true';
  const isKioskMode = process.env.VITE_KIOSK_MODE === 'true';
  const isScreenTarget = buildTarget === 'screen';
  
  return {
    base: '/',
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
    ],
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: true,
      rollupOptions: {
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
            ...(buildTarget === 'mobile' && {
              capacitor: ['@capacitor/core', '@capacitor/android', '@capacitor/ios']
            }),
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
  };
});
