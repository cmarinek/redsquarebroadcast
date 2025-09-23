import { useState, useCallback, useRef, useEffect } from 'react';
import { detectPlatform, isTVPlatform } from '@/utils/platformDetection';

export interface NavigationGrid {
  rows: number;
  cols: number;
  items: string[][];
}

export interface TVNavigationState {
  isActive: boolean;
  currentFocus: { row: number; col: number } | null;
  navigationGrid: NavigationGrid | null;
}

export interface TVNavigationControls {
  isActive: boolean;
  currentFocus: { row: number; col: number } | null;
  navigationGrid: NavigationGrid | null;
  focusFirst: () => void;
  focusLast: () => void;
  rebuildGrid: () => void;
  setNavigationGrid: (grid: NavigationGrid) => void;
}

export function useTVNavigation(): TVNavigationControls {
  const [state, setState] = useState<TVNavigationState>({
    isActive: false,
    currentFocus: null,
    navigationGrid: null
  });

  useEffect(() => {
    const platformInfo = detectPlatform();
    setState(prev => ({
      ...prev,
      isActive: isTVPlatform(platformInfo.platform)
    }));
  }, []);

  const focusFirst = useCallback(() => {
    if (state.navigationGrid && state.navigationGrid.items.length > 0) {
      setState(prev => ({
        ...prev,
        currentFocus: { row: 0, col: 0 }
      }));
    }
  }, [state.navigationGrid]);

  const focusLast = useCallback(() => {
    if (state.navigationGrid && state.navigationGrid.items.length > 0) {
      const lastRow = state.navigationGrid.rows - 1;
      const lastCol = state.navigationGrid.cols - 1;
      setState(prev => ({
        ...prev,
        currentFocus: { row: lastRow, col: lastCol }
      }));
    }
  }, [state.navigationGrid]);

  const rebuildGrid = useCallback(() => {
    // Rebuild navigation grid logic
    setState(prev => ({ ...prev }));
  }, []);

  const setNavigationGrid = useCallback((grid: NavigationGrid) => {
    setState(prev => ({
      ...prev,
      navigationGrid: grid
    }));
  }, []);

  return {
    isActive: state.isActive,
    currentFocus: state.currentFocus,
    navigationGrid: state.navigationGrid,
    focusFirst,
    focusLast,
    rebuildGrid,
    setNavigationGrid
  };
}