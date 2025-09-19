```markdown
# TV Extension: Remote Navigation and Integration

This document describes how to use the TV integration added in the TV enhancements.

## Hooks

### useTVRemoteNavigation(options)

Imports:
```ts
import { useTVRemoteNavigation } from 'src/hooks/useTVRemoteNavigation';
```

Options:
- enableGestures?: boolean — whether to enable gesture mappings if available.
- onNavigate?: (route, params) => void — callback invoked when a navigation action is received.
- mapping?: Record<string, string> — mapping of runtime action names to app routes.
- enableLongPress?: boolean
- enableDoubleTap?: boolean

Behavior:
- Attempts to register a mapping with the runtime via `window.RedSquareTV.registerRemoteMapping(mappingPayload)` if present.
- Fallback: listens for `remote-nav` custom events or `RedSquareTV.onRemoteEvent`.
- Emits a `nav-latency` event (CustomEvent) on navigation with detail: { action, startTs, endTs } to allow telemetry collection.

Example:
```tsx
useTVRemoteNavigation({
  enableGestures: true,
  mapping: { 'KEY_ENTER': '/select', 'KEY_UP': '/up' },
  onNavigate: (route) => {
    history.push(route);
  }
});
```

## Runtime setup

Your TV runtime should:
- Expose `window.RedSquareTV.registerRemoteMapping(mappingPayload)` to register available actions.
- Optionally emit remote events via `RedSquareTV.onRemoteEvent(handler)`.
- If runtime doesn't support registration, the app will still work via custom `remote-nav` events.
```
