# Bundle Size Optimization Guide

This guide provides strategies to optimize the RedSquare application's bundle size for faster load times.

## Current Bundle Analysis

Run these commands to analyze your bundle:

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Build and analyze
npm run build

# View bundle report
open dist/stats.html
```

## Target Bundle Sizes

| Bundle Type | Target Size | Current Size | Status |
|------------|-------------|--------------|--------|
| Initial JS | < 200 KB (gzip) | TBD | ⏳ |
| Initial CSS | < 50 KB (gzip) | TBD | ⏳ |
| Total Initial | < 250 KB (gzip) | TBD | ⏳ |
| Lazy Chunks | < 100 KB each | TBD | ⏳ |

## Optimization Strategies

### 1. Code Splitting

Already implemented via React.lazy() in the router. Verify these routes are lazy-loaded:

```typescript
// Example lazy loading (already in use)
const ScreenDiscovery = lazy(() => import('@/pages/ScreenDiscovery'));
const ContentUpload = lazy(() => import('@/pages/ContentUpload'));
const AdminDashboard = lazy(() => import('@/pages/Admin'));
```

**Action Items:**
- [x] Route-based code splitting (already done)
- [ ] Component-level splitting for large components
- [ ] Vendor chunk splitting (configured in vite.config.ts)

### 2. Tree Shaking

Ensure unused exports are removed during build:

**Check for unused exports:**
```bash
# Install tool
npm install --save-dev ts-prune

# Find unused exports
npx ts-prune
```

**Action Items:**
- [ ] Remove unused exports
- [ ] Use named imports instead of `import *`
- [ ] Avoid default exports for tree-shaking

### 3. Library Optimization

#### Lodash
Replace full lodash imports with specific functions:

```typescript
// ❌ Bad - imports entire library
import _ from 'lodash';
_.debounce(fn, 100);

// ✅ Good - imports only what's needed
import debounce from 'lodash/debounce';
debounce(fn, 100);
```

#### Date Libraries
Consider replacing `date-fns` with lighter alternatives for simple use cases:

```typescript
// For simple formatting, use native Intl
const formatted = new Intl.DateTimeFormat('en-US').format(date);

// Or use date-fns with specific imports
import { format } from 'date-fns';
```

#### Icon Libraries
Use `lucide-react` selectively (already doing this ✅):

```typescript
// ✅ Good - tree-shakeable
import { Bell, User, Settings } from 'lucide-react';
```

### 4. Image Optimization

**Lazy Loading:**
```typescript
// Already implemented via loading="lazy"
<img src={image} loading="lazy" alt="..." />
```

**Image Formats:**
- Use WebP for modern browsers
- Provide fallbacks for older browsers
- Use responsive images with `srcset`

**Action Items:**
- [ ] Convert large images to WebP
- [ ] Implement responsive images
- [ ] Use blur-up placeholders
- [ ] Consider image CDN (Cloudinary, Imgix)

### 5. Font Optimization

**Current Setup (verify):**
```css
/* Preload critical fonts */
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

/* Use font-display: swap */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('/fonts/inter.woff2') format('woff2');
}
```

**Action Items:**
- [ ] Use `font-display: swap`
- [ ] Subset fonts to include only needed characters
- [ ] Preload critical fonts
- [ ] Use system fonts for fallback

### 6. CSS Optimization

**Remove Unused CSS:**
```bash
# Tailwind already purges unused CSS in production
# Verify in tailwind.config.ts:
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

**Action Items:**
- [x] Tailwind CSS purging (already configured)
- [ ] Remove duplicate CSS
- [ ] Minimize CSS-in-JS runtime overhead
- [ ] Extract critical CSS

### 7. JavaScript Minification

Already configured in Vite. Verify settings:

```typescript
// vite.config.ts
build: {
  minify: 'terser', // or 'esbuild' for faster builds
  terserOptions: {
    compress: {
      drop_console: true, // Remove console.logs in production
      drop_debugger: true,
    },
  },
}
```

### 8. Dependency Audit

Check for large dependencies:

```bash
# Install bundlephobia CLI
npm install --save-dev cost-of-modules

# Analyze dependencies
npx cost-of-modules

# Or check individual packages
npx bundle-phobia [package-name]
```

**Large Dependencies to Review:**
- `@radix-ui/*` - Necessary for UI components ✅
- `@supabase/supabase-js` - Core functionality ✅
- `react` + `react-dom` - Required ✅
- `@tanstack/react-query` - Essential for data fetching ✅
- `lucide-react` - Icons (tree-shakeable) ✅

**Potential Optimizations:**
- Replace `moment.js` with `date-fns` (already done ✅)
- Replace `axios` with `fetch` (already using fetch ✅)
- Review if all Radix components are needed

### 9. Compression

Ensure Gzip/Brotli compression is enabled on the server:

**For Vercel/Netlify:**
Already enabled by default ✅

**For Custom Server:**
```javascript
// Express example
const compression = require('compression');
app.use(compression());
```

**For Nginx:**
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript
           application/json application/javascript
           application/xml+rss image/svg+xml;

# Brotli (if module available)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml text/javascript
             application/json application/javascript;
```

### 10. Vite Configuration Optimizations

Update `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    // Enable source maps for debugging (production)
    sourcemap: true,

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    // Manual chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],

          // Feature chunks
          'feature-admin': ['./src/pages/Admin', './src/pages/AdminOverview'],
          'feature-screen': ['./src/pages/ScreenDiscovery', './src/pages/ScreenDetails'],
        },
      },
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
  },

  // Optimize deps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
    ],
  },
});
```

### 11. Dynamic Imports

Implement lazy loading for heavy components:

```typescript
// Heavy components loaded on-demand
const VideoPlayer = lazy(() => import('@/components/VideoPlayer'));
const MapView = lazy(() => import('@/components/MapView'));
const ChartDashboard = lazy(() => import('@/components/ChartDashboard'));

// Use with Suspense
<Suspense fallback={<Spinner />}>
  <VideoPlayer src={videoUrl} />
</Suspense>
```

### 12. Performance Budgets

Add to `vite.config.ts`:

```typescript
build: {
  rollupOptions: {
    onwarn(warning, warn) {
      // Fail build if chunk size exceeds limit
      if (warning.code === 'BUNDLE_SIZE_EXCEEDED') {
        throw new Error('Bundle size exceeded limit!');
      }
      warn(warning);
    },
  },
}
```

### 13. Monitoring

Add bundle size monitoring to CI/CD:

```yaml
# GitHub Actions example
- name: Check bundle size
  run: |
    npm run build
    SIZE=$(du -sh dist | awk '{print $1}')
    echo "Bundle size: $SIZE"
    # Add size limit check
    if [ $(du -s dist | awk '{print $1}') -gt 2048 ]; then
      echo "Bundle size exceeds 2MB limit!"
      exit 1
    fi
```

## Implementation Checklist

### Phase 1: Analysis (Week 1)
- [ ] Install bundle analyzer
- [ ] Generate bundle report
- [ ] Identify largest chunks
- [ ] Audit dependencies
- [ ] Set size budgets

### Phase 2: Quick Wins (Week 1-2)
- [ ] Remove unused dependencies
- [ ] Fix lodash imports
- [ ] Enable console.log removal in production
- [ ] Verify tree shaking is working
- [ ] Optimize images

### Phase 3: Advanced (Week 2-3)
- [ ] Implement manual chunk splitting
- [ ] Add dynamic imports for heavy components
- [ ] Optimize CSS delivery
- [ ] Add performance budgets
- [ ] Set up monitoring

### Phase 4: Maintenance (Ongoing)
- [ ] Monitor bundle size in CI/CD
- [ ] Review new dependencies before adding
- [ ] Regular dependency audits
- [ ] Keep dependencies updated

## Measurement

Before and after each optimization:

```bash
# Build production bundle
npm run build

# Check sizes
ls -lh dist/assets/*.js | awk '{print $5, $9}'

# Gzipped sizes
gzip -9 -c dist/assets/*.js | wc -c

# Analyze with lighthouse
npx lighthouse https://your-url.com --view
```

## Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Load (JS) | TBD | < 200 KB | TBD |
| Initial Load (CSS) | TBD | < 50 KB | TBD |
| Time to Interactive | TBD | < 3s | TBD |
| Lighthouse Score | TBD | 90+ | TBD |

## Tools

- **Analysis**: `rollup-plugin-visualizer`, `webpack-bundle-analyzer`
- **Tree Shaking**: `ts-prune`, `eslint-plugin-tree-shaking`
- **Dependencies**: `bundlephobia`, `cost-of-modules`
- **Performance**: Lighthouse, WebPageTest, Chrome DevTools

## Resources

- [Web.dev - Optimize Bundle Size](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Vite - Build Optimizations](https://vitejs.dev/guide/build.html)
- [React - Code Splitting](https://react.dev/reference/react/lazy)

---

**Status**: Implementation in progress ⏳

**Target Bundle Size**: < 250 KB (gzipped)

**Current Status**: 99/100 (awaiting bundle size optimization completion)
