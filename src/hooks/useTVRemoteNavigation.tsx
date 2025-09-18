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
  enableGamepad?: boolean;
  gamepadIndex?: number;
  enableVoiceControl?: boolean;
  spatialNavigationAlgorithm?: 'nearest' | 'directional' | 'grid';
  overscanCompensation?: boolean;
  onButtonPress?: (event: TVRemoteEvent) => void;
  onNavigate?: (from: HTMLElement | null, to: HTMLElement | null) => void;
  onGamepadConnect?: (gamepad: Gamepad) => void;
  onGamepadDisconnect?: (gamepad: Gamepad) => void;
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
    enableGamepad = true,
    gamepadIndex = 0,
    enableVoiceControl = false,
    spatialNavigationAlgorithm = 'directional',
    overscanCompensation = true,
    onButtonPress,
    onNavigate,
    onGamepadConnect,
    onGamepadDisconnect,
    selector = '[data-tv-focusable], button, a, input, select, [tabindex]:not([tabindex="-1"])'
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);
  const [navigationGrid, setNavigationGrid] = useState<NavigationGrid | null>(null);
  const [platform, setPlatform] = useState<string>('unknown');
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [connectedGamepads, setConnectedGamepads] = useState<Gamepad[]>([]);
  
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationTime = useRef<number>(0);
  const gamepadPollRef = useRef<number | null>(null);
  const voiceRecognitionRef = useRef<any>(null);

  // Initialize platform detection and gamepad support
  useEffect(() => {
    const platformInfo = detectPlatform();
    setPlatform(platformInfo.platform);
    setIsActive(enabled && isTVPlatform(platformInfo.platform));
    
    // Initialize gamepad support if enabled and supported
    if (enableGamepad && platformInfo.capabilities.supportsGamepad) {
      initializeGamepadSupport();
    }
    
    // Initialize voice control if enabled and supported
    if (enableVoiceControl && platformInfo.capabilities.supportsVoiceControl) {
      initializeVoiceControl();
    }
    
    return () => {
      cleanupGamepadSupport();
      cleanupVoiceControl();
    };
  }, [enabled, enableGamepad, enableVoiceControl]);

  // Initialize gamepad support
  const initializeGamepadSupport = useCallback(() => {
    const handleGamepadConnected = (event: GamepadEvent) => {
      const gamepad = event.gamepad;
      setConnectedGamepads(prev => [...prev.filter(g => g.index !== gamepad.index), gamepad]);
      setGamepadConnected(true);
      onGamepadConnect?.(gamepad);
      
      // Start polling for gamepad input
      if (!gamepadPollRef.current) {
        gamepadPollRef.current = requestAnimationFrame(pollGamepadInput);
      }
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
      const gamepad = event.gamepad;
      setConnectedGamepads(prev => prev.filter(g => g.index !== gamepad.index));
      onGamepadDisconnect?.(gamepad);
      
      if (connectedGamepads.length <= 1) {
        setGamepadConnected(false);
        if (gamepadPollRef.current) {
          cancelAnimationFrame(gamepadPollRef.current);
          gamepadPollRef.current = null;
        }
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [onGamepadConnect, onGamepadDisconnect, connectedGamepads.length]);

  // Cleanup gamepad support
  const cleanupGamepadSupport = useCallback(() => {
    if (gamepadPollRef.current) {
      cancelAnimationFrame(gamepadPollRef.current);
      gamepadPollRef.current = null;
    }
  }, []);

  // Poll gamepad input
  const pollGamepadInput = useCallback(() => {
    if (!gamepadConnected || !isActive) {
      gamepadPollRef.current = null;
      return;
    }

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (gamepad) {
      handleGamepadInput(gamepad);
    }

    gamepadPollRef.current = requestAnimationFrame(pollGamepadInput);
  }, [gamepadConnected, isActive, gamepadIndex]);

  // Handle gamepad input
  const handleGamepadInput = useCallback((gamepad: Gamepad) => {
    const threshold = 0.5;
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    let button: TVRemoteButton | null = null;

    // D-pad or left stick navigation
    if (gamepad.axes[0] < -threshold || gamepad.axes[0] > threshold ||
        gamepad.axes[1] < -threshold || gamepad.axes[1] > threshold) {
      
      if (gamepad.axes[0] < -threshold) direction = 'left';
      else if (gamepad.axes[0] > threshold) direction = 'right';
      else if (gamepad.axes[1] < -threshold) direction = 'up';
      else if (gamepad.axes[1] > threshold) direction = 'down';
    }

    // Button presses
    if (gamepad.buttons[0].pressed) button = 'select'; // A button
    if (gamepad.buttons[1].pressed) button = 'back';   // B button
    if (gamepad.buttons[2].pressed) button = 'menu';   // X button
    if (gamepad.buttons[3].pressed) button = 'home';   // Y button
    if (gamepad.buttons[9].pressed) button = 'menu';   // Menu button
    if (gamepad.buttons[8].pressed) button = 'back';   // Select/back button

    // Handle navigation
    if (direction) {
      const now = Date.now();
      if (now - lastNavigationTime.current >= navigationDelay) {
        navigate(direction);
        lastNavigationTime.current = now;
      }
    }

    // Handle button presses
    if (button) {
      const mockEvent = new KeyboardEvent('keydown', { key: button });
      const remoteEvent: TVRemoteEvent = {
        button,
        originalEvent: mockEvent,
        preventDefault: () => {},
        platform
      };
      onButtonPress?.(remoteEvent);

      if (button === 'select' && currentFocus) {
        currentFocus.click();
      }
    }
  }, [navigate, navigationDelay, platform, onButtonPress, currentFocus]);

  // Initialize voice control
  const initializeVoiceControl = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      handleVoiceCommand(command);
    };

    voiceRecognitionRef.current = recognition;
  }, []);

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string) => {
    const commands: Record<string, () => void> = {
      'up': () => navigate('up'),
      'down': () => navigate('down'),
      'left': () => navigate('left'),
      'right': () => navigate('right'),
      'select': () => currentFocus?.click(),
      'back': () => window.history.back(),
      'home': () => window.location.href = '/',
      'menu': () => {}, // Could trigger a menu
    };

    const commandFunction = commands[command];
    if (commandFunction) {
      commandFunction();
    }
  }, [navigate, currentFocus]);

  // Cleanup voice control
  const cleanupVoiceControl = useCallback(() => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      voiceRecognitionRef.current = null;
    }
  }, []);

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
    
    // Platform-specific mappings based on current platform
    if (platform === 'screens_samsung_tizen') {
      switch (keyCode) {
        case 10009: return 'back'; // Tizen back
        case 10182: return 'home'; // Tizen home
        case 412: return 'rewind';
        case 417: return 'fast_forward';
        case 19: return 'up';
        case 20: return 'down';
        case 21: return 'left';
        case 22: return 'right';
        case 23: return 'select'; // Tizen select
      }
    } else if (platform === 'screens_lg_webos') {
      switch (keyCode) {
        case 461: return 'back'; // webOS back
        case 172: return 'home';
      }
    } else if (platform === 'screens_amazon_fire') {
      switch (keyCode) {
        case 166: return 'back'; // Fire TV back
        case 3: return 'home'; // Fire TV home
      }
    } else if (platform === 'screens_android_tv') {
      switch (keyCode) {
        case 4: return 'back'; // Android TV back
        case 23: return 'select'; // Android TV select
        case 85: return 'play_pause';
        case 89: return 'rewind';
        case 90: return 'fast_forward';
      }
    } else if (platform === 'screens_roku') {
      switch (keyCode) {
        case 27: return 'back'; // Roku back
        case 36: return 'home'; // Roku home
      }
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
  }, [platform]);

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

  // Enhanced spatial navigation with multiple algorithms
  const navigate = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!navigationGrid || !currentFocus) return;
    
    const currentIndex = navigationGrid.elements.findIndex(el => el.element === currentFocus);
    if (currentIndex === -1) return;
    
    const currentElement = navigationGrid.elements[currentIndex];
    let targetElement: FocusableElement | null = null;
    
    switch (spatialNavigationAlgorithm) {
      case 'nearest':
        targetElement = findNearestElement(currentElement, direction, navigationGrid.elements);
        break;
      case 'directional':
        targetElement = findDirectionalElement(currentElement, direction, navigationGrid.elements);
        break;
      case 'grid':
      default:
        targetElement = findGridElement(currentElement, direction, navigationGrid.elements);
        break;
    }
    
    // Apply wrap navigation if no target found
    if (!targetElement && wrapNavigation) {
      targetElement = findWrappedElement(currentElement, direction, navigationGrid.elements);
    }
    
    if (targetElement) {
      const previousFocus = currentFocus;
      setCurrentFocus(targetElement.element);
      targetElement.element.focus();
      
      // Scroll into view with overscan compensation
      if (overscanCompensation) {
        scrollIntoViewWithOverscan(targetElement.element);
      } else {
        targetElement.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      
      onNavigate?.(previousFocus, targetElement.element);
    }
  }, [navigationGrid, currentFocus, spatialNavigationAlgorithm, wrapNavigation, overscanCompensation, onNavigate]);

  // Find nearest element using distance calculation
  const findNearestElement = useCallback((current: FocusableElement, direction: string, elements: FocusableElement[]): FocusableElement | null => {
    const currentRect = current.element.getBoundingClientRect();
    const candidates = elements.filter(el => el.element !== current.element);
    
    let bestCandidate: FocusableElement | null = null;
    let bestDistance = Infinity;
    
    candidates.forEach(candidate => {
      const candidateRect = candidate.element.getBoundingClientRect();
      const distance = calculateDistance(currentRect, candidateRect, direction);
      
      if (distance < bestDistance && isInDirection(currentRect, candidateRect, direction)) {
        bestDistance = distance;
        bestCandidate = candidate;
      }
    });
    
    return bestCandidate;
  }, []);

  // Find element using directional algorithm
  const findDirectionalElement = useCallback((current: FocusableElement, direction: string, elements: FocusableElement[]): FocusableElement | null => {
    const currentRect = current.element.getBoundingClientRect();
    const candidates = elements.filter(el => el.element !== current.element);
    
    // Filter candidates that are in the correct direction
    const validCandidates = candidates.filter(candidate => {
      const candidateRect = candidate.element.getBoundingClientRect();
      return isInDirection(currentRect, candidateRect, direction);
    });
    
    if (validCandidates.length === 0) return null;
    
    // Sort by distance and direction alignment
    validCandidates.sort((a, b) => {
      const aRect = a.element.getBoundingClientRect();
      const bRect = b.element.getBoundingClientRect();
      
      const aDistance = calculateDistance(currentRect, aRect, direction);
      const bDistance = calculateDistance(currentRect, bRect, direction);
      
      return aDistance - bDistance;
    });
    
    return validCandidates[0];
  }, []);

  // Find element using grid-based algorithm (original implementation)
  const findGridElement = useCallback((current: FocusableElement, direction: string, elements: FocusableElement[]): FocusableElement | null => {
    const { row, column } = current;
    
    switch (direction) {
      case 'up':
        return elements.find(el => el.column === column && el.row < row) || null;
      case 'down':
        return elements.find(el => el.column === column && el.row > row) || null;
      case 'left':
        return elements.find(el => el.row === row && el.column < column) || null;
      case 'right':
        return elements.find(el => el.row === row && el.column > column) || null;
      default:
        return null;
    }
  }, []);

  // Find wrapped element for wrap navigation
  const findWrappedElement = useCallback((current: FocusableElement, direction: string, elements: FocusableElement[]): FocusableElement | null => {
    const { row, column } = current;
    
    switch (direction) {
      case 'up':
        return elements.filter(el => el.column === column).pop() || null;
      case 'down':
        return elements.find(el => el.column === column) || null;
      case 'left':
        return elements.filter(el => el.row === row).pop() || null;
      case 'right':
        return elements.find(el => el.row === row) || null;
      default:
        return null;
    }
  }, []);

  // Calculate distance between two rectangles considering direction
  const calculateDistance = useCallback((rect1: DOMRect, rect2: DOMRect, direction: string): number => {
    const center1 = { x: rect1.left + rect1.width / 2, y: rect1.top + rect1.height / 2 };
    const center2 = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };
    
    switch (direction) {
      case 'up':
        return Math.abs(center1.x - center2.x) + Math.max(0, center1.y - center2.y) * 2;
      case 'down':
        return Math.abs(center1.x - center2.x) + Math.max(0, center2.y - center1.y) * 2;
      case 'left':
        return Math.abs(center1.y - center2.y) + Math.max(0, center1.x - center2.x) * 2;
      case 'right':
        return Math.abs(center1.y - center2.y) + Math.max(0, center2.x - center1.x) * 2;
      default:
        return Math.sqrt(Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2));
    }
  }, []);

  // Check if rect2 is in the direction from rect1
  const isInDirection = useCallback((rect1: DOMRect, rect2: DOMRect, direction: string): boolean => {
    const center1 = { x: rect1.left + rect1.width / 2, y: rect1.top + rect1.height / 2 };
    const center2 = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2 };
    
    switch (direction) {
      case 'up':
        return center2.y < center1.y;
      case 'down':
        return center2.y > center1.y;
      case 'left':
        return center2.x < center1.x;
      case 'right':
        return center2.x > center1.x;
      default:
        return false;
    }
  }, []);

  // Scroll element into view with overscan compensation
  const scrollIntoViewWithOverscan = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    
    // Calculate overscan safe area (typically 5% on each side for older TVs)
    const overscan = {
      top: viewport.height * 0.05,
      right: viewport.width * 0.05,
      bottom: viewport.height * 0.05,
      left: viewport.width * 0.05
    };
    
    let scrollX = 0;
    let scrollY = 0;
    
    // Check if element is outside safe area and calculate scroll needed
    if (rect.left < overscan.left) {
      scrollX = rect.left - overscan.left;
    } else if (rect.right > viewport.width - overscan.right) {
      scrollX = rect.right - (viewport.width - overscan.right);
    }
    
    if (rect.top < overscan.top) {
      scrollY = rect.top - overscan.top;
    } else if (rect.bottom > viewport.height - overscan.bottom) {
      scrollY = rect.bottom - (viewport.height - overscan.bottom);
    }
    
    if (scrollX !== 0 || scrollY !== 0) {
      window.scrollBy({ left: scrollX, top: scrollY, behavior: 'smooth' });
    }
  }, []);

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
    gamepadConnected,
    connectedGamepads,
    
    // Manual navigation
    navigateUp: () => navigate('up'),
    navigateDown: () => navigate('down'),
    navigateLeft: () => navigate('left'),
    navigateRight: () => navigate('right'),
    
    // Focus management
    focusElement: (element: HTMLElement) => {
      setCurrentFocus(element);
      element.focus();
      if (overscanCompensation) {
        scrollIntoViewWithOverscan(element);
      }
    },
    
    focusFirst: () => {
      if (navigationGrid && navigationGrid.elements.length > 0) {
        const firstElement = navigationGrid.elements[0].element;
        setCurrentFocus(firstElement);
        firstElement.focus();
        if (overscanCompensation) {
          scrollIntoViewWithOverscan(firstElement);
        }
      }
    },
    
    focusLast: () => {
      if (navigationGrid && navigationGrid.elements.length > 0) {
        const lastElement = navigationGrid.elements[navigationGrid.elements.length - 1].element;
        setCurrentFocus(lastElement);
        lastElement.focus();
        if (overscanCompensation) {
          scrollIntoViewWithOverscan(lastElement);
        }
      }
    },
    
    // Grid management
    rebuildGrid: () => {
      const grid = buildNavigationGrid();
      setNavigationGrid(grid);
    },
    
    // State management
    activate: () => setIsActive(true),
    deactivate: () => setIsActive(false),
    
    // Gamepad control
    getConnectedGamepads: () => connectedGamepads,
    
    // Voice control
    startVoiceRecognition: () => {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.start();
      }
    },
    
    stopVoiceRecognition: () => {
      if (voiceRecognitionRef.current) {
        voiceRecognitionRef.current.stop();
      }
    },
    
    // Overscan utilities
    scrollIntoViewSafe: scrollIntoViewWithOverscan,
    
    // Algorithm switching
    setSpatialNavigationAlgorithm: (algorithm: 'nearest' | 'directional' | 'grid') => {
      // This would require updating the options, but for now we'll document it
      console.warn('Algorithm switching requires reinitializing the hook with new options');
    }
  };

  return api;
}

export default useTVRemoteNavigation;