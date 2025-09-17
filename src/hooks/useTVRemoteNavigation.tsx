import { useEffect, useCallback, useState, useRef } from 'react';
import { detectPlatform, isTVPlatform } from '@/utils/platformDetection';

export type TVRemoteButton = 
  | 'up' 
  | 'down' 
  | 'left' 
  | 'right' 
  | 'select' 
  | 'back' 
  | 'home' 
  | 'menu' 
  | 'play_pause' 
  | 'rewind' 
  | 'fast_forward' 
  | 'volume_up' 
  | 'volume_down' 
  | 'mute'
  | 'channel_up'
  | 'channel_down'
  | 'power'
  | 'info'
  | 'guide'
  | 'exit';

export interface TVRemoteEvent {
  button: TVRemoteButton;
  originalEvent: KeyboardEvent;
  preventDefault: () => void;
  platform: string;
}

export interface FocusableElement {
  element: HTMLElement;
  id: string;
  priority: number;
  row: number;
  column: number;
}

export interface NavigationGrid {
  rows: number;
  columns: number;
  elements: FocusableElement[];
}

export interface TVRemoteNavigationOptions {
  enabled?: boolean;
  gridMode?: boolean;
  wrapNavigation?: boolean;
  autoFocus?: boolean;
  focusClassName?: string;
  navigationDelay?: number;
  onButtonPress?: (event: TVRemoteEvent) => void;
  onNavigate?: (from: HTMLElement | null, to: HTMLElement | null) => void;
  selector?: string; // CSS selector for focusable elements
}

/**
 * TV Remote Navigation Hook
 * Provides unified remote control support across different TV platforms
 */
export function useTVRemoteNavigation(options: TVRemoteNavigationOptions = {}) {
  const {
    enabled = true,
    gridMode = true,
    wrapNavigation = true,
    autoFocus = true,
    focusClassName = 'tv-focused',
    navigationDelay = 150,
    onButtonPress,
    onNavigate,
    selector = '[data-tv-focusable], button, a, input, select, [tabindex]:not([tabindex="-1"])'
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);
  const [navigationGrid, setNavigationGrid] = useState<NavigationGrid | null>(null);
  const [platform, setPlatform] = useState<string>('unknown');
  
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationTime = useRef<number>(0);

  // Initialize platform detection
  useEffect(() => {
    const platformInfo = detectPlatform();
    setPlatform(platformInfo.platform);
    setIsActive(enabled && isTVPlatform(platformInfo.platform));
  }, [enabled]);

  // Key mapping for different TV platforms
  const getRemoteButton = useCallback((event: KeyboardEvent): TVRemoteButton | null => {
    const { key, keyCode, code } = event;
    
    // Standard navigation keys
    switch (key) {
      case 'ArrowUp': return 'up';
      case 'ArrowDown': return 'down';
      case 'ArrowLeft': return 'left';
      case 'ArrowRight': return 'right';
      case 'Enter': return 'select';
      case 'Escape': return 'back';
      case ' ': return 'play_pause';
      case 'Home': return 'home';
      case 'Tab': return event.shiftKey ? 'left' : 'right';
    }
    
    // Platform-specific mappings
    switch (keyCode) {
      // Samsung Tizen
      case 10009: return 'back'; // Tizen back
      case 10182: return 'home'; // Tizen home
      case 412: return 'rewind';
      case 417: return 'fast_forward';
      case 19: return 'up';
      case 20: return 'down';
      case 21: return 'left';
      case 22: return 'right';
      case 23: return 'select';
      
      // LG webOS
      case 461: return 'back'; // webOS back
      case 172: return 'home';
      
      // Amazon Fire TV
      case 166: return 'back'; // Fire TV back
      case 3: return 'home'; // Fire TV home
      
      // Android TV
      case 4: return 'back'; // Android TV back
      case 66: return 'select'; // Android TV select (KEYCODE_ENTER)
      case 85: return 'play_pause';
      case 89: return 'rewind';
      case 90: return 'fast_forward';
      
      // Roku
      case 27: return 'back'; // Roku back
      case 36: return 'home'; // Roku home
      
      // Apple TV
      case 8: return 'back'; // Apple TV back
      case 13: return 'select'; // Apple TV select
      case 32: return 'play_pause'; // Apple TV play/pause
    }
    
    // Additional key codes
    switch (code) {
      case 'MediaPlayPause': return 'play_pause';
      case 'MediaTrackPrevious': return 'rewind';
      case 'MediaTrackNext': return 'fast_forward';
      case 'AudioVolumeUp': return 'volume_up';
      case 'AudioVolumeDown': return 'volume_down';
      case 'AudioVolumeMute': return 'mute';
    }
    
    return null;
  }, []);

  // Build navigation grid from focusable elements
  const buildNavigationGrid = useCallback(() => {
    if (!gridMode) return null;
    
    const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    const focusableElements: FocusableElement[] = [];
    
    elements.forEach((element, index) => {
      if (element.offsetParent !== null && !element.disabled) { // visible and enabled
        const rect = element.getBoundingClientRect();
        const row = Math.floor(rect.top / 100); // Rough grid calculation
        const column = Math.floor(rect.left / 100);
        
        focusableElements.push({
          element,
          id: element.id || `focusable-${index}`,
          priority: parseInt(element.dataset.tvPriority || '0'),
          row,
          column
        });
      }
    });
    
    // Sort by priority, then by position
    focusableElements.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.row !== b.row) return a.row - b.row;
      return a.column - b.column;
    });
    
    const grid: NavigationGrid = {
      rows: Math.max(...focusableElements.map(el => el.row), 0) + 1,
      columns: Math.max(...focusableElements.map(el => el.column), 0) + 1,
      elements: focusableElements
    };
    
    return grid;
  }, [selector, gridMode]);

  // Update navigation grid when DOM changes
  useEffect(() => {
    if (!isActive) return;
    
    const updateGrid = () => {
      const grid = buildNavigationGrid();
      setNavigationGrid(grid);
      
      // Auto-focus first element if no current focus
      if (autoFocus && !currentFocus && grid && grid.elements.length > 0) {
        const firstElement = grid.elements[0].element;
        setCurrentFocus(firstElement);
        firstElement.focus();
      }
    };
    
    updateGrid();
    
    // Listen for DOM changes
    const observer = new MutationObserver(updateGrid);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden', 'disabled']
    });
    
    return () => observer.disconnect();
  }, [isActive, buildNavigationGrid, autoFocus, currentFocus]);

  // Apply focus styling
  useEffect(() => {
    if (!currentFocus || !focusClassName) return;
    
    // Remove focus class from all elements
    document.querySelectorAll(`.${focusClassName}`).forEach(el => {
      el.classList.remove(focusClassName);
    });
    
    // Add focus class to current element
    currentFocus.classList.add(focusClassName);
    
    // Notify navigation callback
    onNavigate?.(null, currentFocus);
    
    return () => {
      if (currentFocus) {
        currentFocus.classList.remove(focusClassName);
      }
    };
  }, [currentFocus, focusClassName, onNavigate]);

  // Navigate to next element in specified direction
  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!navigationGrid || !currentFocus) return;
    
    const currentIndex = navigationGrid.elements.findIndex(el => el.element === currentFocus);
    if (currentIndex === -1) return;
    
    const currentElement = navigationGrid.elements[currentIndex];
    let targetElement: FocusableElement | null = null;
    
    if (gridMode) {
      // Grid-based navigation
      const { row, column } = currentElement;
      
      switch (direction) {
        case 'up':
          targetElement = navigationGrid.elements.find(el => 
            el.column === column && el.row < row) || 
            (wrapNavigation ? navigationGrid.elements.filter(el => el.column === column).pop() : null);
          break;
        case 'down':
          targetElement = navigationGrid.elements.find(el => 
            el.column === column && el.row > row) || 
            (wrapNavigation ? navigationGrid.elements.find(el => el.column === column) : null);
          break;
        case 'left':
          targetElement = navigationGrid.elements.find(el => 
            el.row === row && el.column < column) || 
            (wrapNavigation ? navigationGrid.elements.filter(el => el.row === row).pop() : null);
          break;
        case 'right':
          targetElement = navigationGrid.elements.find(el => 
            el.row === row && el.column > column) || 
            (wrapNavigation ? navigationGrid.elements.find(el => el.row === row) : null);
          break;
      }
    } else {
      // Linear navigation
      switch (direction) {
        case 'up':
        case 'left':
          targetElement = navigationGrid.elements[currentIndex - 1] || 
            (wrapNavigation ? navigationGrid.elements[navigationGrid.elements.length - 1] : null);
          break;
        case 'down':
        case 'right':
          targetElement = navigationGrid.elements[currentIndex + 1] || 
            (wrapNavigation ? navigationGrid.elements[0] : null);
          break;
      }
    }
    
    if (targetElement) {
      const previousFocus = currentFocus;
      setCurrentFocus(targetElement.element);
      targetElement.element.focus();
      onNavigate?.(previousFocus, targetElement.element);
    }
  }, [navigationGrid, currentFocus, gridMode, wrapNavigation, onNavigate]);

  // Handle remote button presses
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive) return;
    
    // Throttle navigation to prevent rapid-fire
    const now = Date.now();
    if (now - lastNavigationTime.current < navigationDelay) {
      event.preventDefault();
      return;
    }
    
    const button = getRemoteButton(event);
    if (!button) return;
    
    const remoteEvent: TVRemoteEvent = {
      button,
      originalEvent: event,
      preventDefault: () => event.preventDefault(),
      platform
    };
    
    // Call custom button handler
    onButtonPress?.(remoteEvent);
    
    // Handle navigation buttons
    switch (button) {
      case 'up':
      case 'down':
      case 'left':
      case 'right':
        event.preventDefault();
        navigate(button);
        lastNavigationTime.current = now;
        break;
      case 'select':
        event.preventDefault();
        if (currentFocus) {
          currentFocus.click();
        }
        break;
      case 'back':
        event.preventDefault();
        // Let the application handle back navigation
        break;
    }
  }, [isActive, getRemoteButton, platform, onButtonPress, navigate, currentFocus, navigationDelay]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (!isActive) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleKeyDown]);

  // Public API
  const api = {
    isActive,
    platform,
    currentFocus,
    navigationGrid,
    
    // Manual navigation
    navigateUp: () => navigate('up'),
    navigateDown: () => navigate('down'),
    navigateLeft: () => navigate('left'),
    navigateRight: () => navigate('right'),
    
    // Focus management
    focusElement: (element: HTMLElement) => {
      setCurrentFocus(element);
      element.focus();
    },
    
    focusFirst: () => {
      if (navigationGrid && navigationGrid.elements.length > 0) {
        const firstElement = navigationGrid.elements[0].element;
        setCurrentFocus(firstElement);
        firstElement.focus();
      }
    },
    
    focusLast: () => {
      if (navigationGrid && navigationGrid.elements.length > 0) {
        const lastElement = navigationGrid.elements[navigationGrid.elements.length - 1].element;
        setCurrentFocus(lastElement);
        lastElement.focus();
      }
    },
    
    // Grid management
    rebuildGrid: () => {
      const grid = buildNavigationGrid();
      setNavigationGrid(grid);
    },
    
    // State management
    activate: () => setIsActive(true),
    deactivate: () => setIsActive(false)
  };

  return api;
}

export default useTVRemoteNavigation;