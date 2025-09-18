```markdown
Title: Add TV platform enhancements: detection, navigation, profiling, packaging, docs

Summary
- Add platform detection utilities that probe runtime APIs (window.RedSquareTV) and fall back to conservative user-agent heuristics.
  - src/utils/platformDetection.ts exports probePlatformCapabilities() and detectPlatformEnhanced().
- Add a TV remote navigation hook that registers runtime remote mappings, handles gestures/long-press/double-tap, emits nav-latency events, and falls back to window events.
  - src/hooks/useTVRemoteNavigation.tsx
- Add a TV profiling hook that samples RAF for FPS estimates, listens for nav-latency events, batches samples, and posts to telemetry.
  - src/hooks/useTVProfiling.tsx
- Add a small metrics client that respects build config analyticsEnabled and retries transient failures.
  - src/utils/metricsClient.ts
- Add packaging manifest generator and template for Tizen builds.
  - scripts/packaging/generate-manifest.js
  - scripts/packaging/tizen/manifest.tpl
- Add documentation for the TV extension and telemetry.
  - docs/tv/tv-extension.md
  - docs/tv/tv-telemetry.md
- Add a minimal TV profiling dashboard dev preview page.
  - src/pages/TVProfilingDashboard.tsx

Rationale
- Improve detection and runtime integration for TV platforms (remotes, gestures).
- Collect lightweight profiling (FPS, navigation latency) to identify performance regressions and tune TV UX.
- Provide packaging helpers for TV platform manifests and docs to guide runtime integration.

Reviewer checklist
- [ ] Confirm runtime API names and surface: window.RedSquareTV.registerRemoteMapping, onRemoteEvent, unregisterRemoteMapping. Update calls if your runtime uses different names.
- [ ] Confirm getBuildConfig() import path (the new files import from src/config/getBuildConfig). Adjust imports if your project places it elsewhere.
- [ ] Confirm the server endpoint POST /api/metrics/tv-profiling exists or implement it server-side to accept profiling batches.
- [ ] Run the TypeScript build and run linters; fix any path/type mismatches.
- [ ] Test on a TV runtime and on desktop browser to verify runtime probe and UA fallbacks.
- [ ] Validate packaging script output path (build/manifest.xml) matches your build pipeline expectations.

Assumptions and stubs
- getBuildConfig() is expected at src/config/getBuildConfig and returns an object including analyticsEnabled. If your project stores config elsewhere adapt imports.
- The runtime integration point is window.RedSquareTV (used as a best-effort placeholder). Adjust runtime calls if your TV runtime exposes different globals.
- Server-side endpoint /api/metrics/tv-profiling is not implemented by this PR — implement or adapt server to receive profiling batches if required.
- The packaging script writes build/manifest.xml; change output path if your CI expects a different location.

Files added
- src/utils/platformDetection.ts
- src/hooks/useTVRemoteNavigation.tsx
- src/hooks/useTVProfiling.tsx
- src/utils/metricsClient.ts
- scripts/packaging/generate-manifest.js
- scripts/packaging/tizen/manifest.tpl
- docs/tv/tv-extension.md
- docs/tv/tv-telemetry.md
- src/pages/TVProfilingDashboard.tsx

Post-PR integration steps
1. Create branch feature/tv-enhancements, add and commit these files, push the branch, and open the PR (see CLI command below).
2. Run TypeScript build and tests; fix any path or type issues specific to the repo.
3. Implement or confirm server endpoint POST /api/metrics/tv-profiling to accept batches, or change telemetry URL to match existing metrics ingestion endpoints.
4. Validate runtime behavior on TV device(s) and on desktop to ensure fallbacks are correct.
5. Optionally add unit/integration tests for the metrics client and the platform probe.

Notes
- This PR uses conservative defaults for unknown runtimes (assumes minimal capabilities).
- Telemetry respects analyticsEnabled: the metrics client will not post if analytics is disabled in build config.
- Event listeners and runtime registrations are cleaned up on unmount to avoid leaks.

```
