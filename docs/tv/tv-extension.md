```markdown
# TV Remote Extension Guide

This document explains how to register custom remote button mappings and add gesture handlers.

## Register a custom mapping

In a module, call:

```js
window.RedSquareTV = window.RedSquareTV || {};
window.RedSquareTV.registerRemoteMapping({
  'CustomKeyCodeOrKeyName': 'my_custom_action'
});
```

Your app should listen to the onButtonPress callback in `useTVRemoteNavigation` and handle actions named by the mapping.

## Gesture hooks

When initializing the navigation hook, enable gestures:

```ts
useTVRemoteNavigation({
  enableGestures: true,
  longPressDelay: 600,
  doubleTapDelay: 300,
  onButtonPress: (event) => {
    if (event.type === 'longpress') { ... }
    if (event.type === 'doubletap') { ... }
    if (event.type === 'pointerdown') { ... } // pointer gestures
  }
});
```

Notes:
- Keep gestures optional to preserve default behavior.
- Provide accessible keyboard fallbacks for all gestures.
```
