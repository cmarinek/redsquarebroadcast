// Partial modifications to the existing hook to add gesture, long-press and double-tap support.
// Preserve your repository's existing navigation logic and adapt naming/imports as needed.

import { useEffect, useCallback, useState, useRef } from 'react';
import { detectPlatform, isTVPlatform } from '@/utils/platformDetection';

export interface TVRemoteNavigationOptions {
  enabled?: boolean;
  gridMode?: boolean;
  wrapNavigation?: boolean;
  autoFocus?: boolean;
  focusClassName?: string;
  navigationDelay?: number;
  onButtonPress?: (event: any) => void;
  onNavigate?: (from: HTMLElement | null, to: HTMLElement | null) => void;
  selector?: string;
  enableGestures?: boolean;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export function useTVRemoteNavigation(options: TVRemoteNavigationOptions = {}) {
  const {
    enabled = true,
    enableGestures = false,
    longPressDelay = 600,
    doubleTapDelay = 300,
  } = options as TVRemoteNavigationOptions;

  const [isActive, setIsActive] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);

  const lastKeyTimeRef = useRef<number>(0);
  const lastKeyRef = useRef<string | null>(null);
  const longPressTimer = useRef<number | null>(null);

  useEffect(() => {
    const platformInfo = detectPlatform();
    setIsActive(enabled && isTVPlatform(platformInfo.platform));
  }, [enabled]);

  // Global registration API for custom mappings
  useEffect(() => {
    (window as any).RedSquareTV = (window as any).RedSquareTV || {};
    (window as any).RedSquareTV.registerRemoteMapping = (mapping: Record<string, string>) => {
      (window as any).RedSquareTV._customMappings = {
        ...(window as any).RedSquareTV._customMappings || {},
        ...mapping
      };
    };
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;

    const key = event.key || String(event.keyCode);
    const now = Date.now();

    // Double-tap detection
    if (lastKeyRef.current === key && now - lastKeyTimeRef.current <= doubleTapDelay) {
      const doubleTapEvent = { type: 'doubletap', key, originalEvent: event };
      (options.onButtonPress || (() => {}))(doubleTapEvent);
      lastKeyRef.current = null;
      lastKeyTimeRef.current = 0;
      event.preventDefault();
      return;
    }

    // Long-press detection: start timer on keydown
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    longPressTimer.current = window.setTimeout(() => {
      const longPressEvent = { type: 'longpress', key, originalEvent: event };
      (options.onButtonPress || (() => {}))(longPressEvent);
    }, longPressDelay);

    lastKeyRef.current = key;
    lastKeyTimeRef.current = now;

    // Existing mapping/navigation behavior continues here (not overridden)
    // TODO: integrate with your existing key-to-action mapping and navigation engine.
  }, [isActive, doubleTapDelay, longPressDelay, options]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Emit normal button press event (short press)
    const key = event.key || String(event.keyCode);
    const shortPressEvent = { type: 'press', key, originalEvent: event };
    (options.onButtonPress || (() => {}))(shortPressEvent);
  }, [isActive, options]);

  // Pointer-based gesture support (touchpad/air-mouse)
  useEffect(() => {
    if (!isActive || !enableGestures) return;
    const onPointerDown = (ev: PointerEvent) => {
      const gesture = { type: 'pointerdown', pointerType: ev.pointerType, x: ev.clientX, y: ev.clientY, originalEvent: ev };
      (options.onButtonPress || (() => {}))(gesture);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [isActive, enableGestures]);

  useEffect(() => {
    if (!isActive) return;
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isActive, handleKeyDown, handleKeyUp]);

  return {
    isActive,
    currentFocus,
    registerMapping: (mapping: Record<string, string>) => {
      (window as any).RedSquareTV = (window as any).RedSquareTV || {};
      (window as any).RedSquareTV._customMappings = {
        ...(window as any).RedSquareTV._customMappings || {},
        ...mapping
      };
    }
  };
}

export default useTVRemoteNavigation;
