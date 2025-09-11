/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        compact: true,
        // Reduce function names and variable names
        generatedCode: {
          arrowFunctions: true,
          constBindings: true,
          objectShorthand: true,
        },
      },
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
      },
    },
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.log for Electron debugging
        drop_debugger: true,
        pure_funcs: ['console.debug', 'console.trace'], // Only remove debug/trace
        passes: 3, // Multiple compression passes
        unsafe: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_symbols: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
      },
      mangle: {
        toplevel: true,
        safari10: true,
      },
      format: {
        beautify: false,
        comments: false,
      },
    },
    chunkSizeWarningLimit: 1000, // Reduce chunk size warning
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
}));
