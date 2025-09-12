/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildTarget = process.env.VITE_BUILD_TARGET || 'web';
  
  return {
    base: '/',
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_BUILD_TARGET': JSON.stringify(buildTarget),
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
          },
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
