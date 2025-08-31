import React, { useEffect, useCallback } from 'react';

interface TVRemoteHandlerProps {
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onSelect?: () => void;
  onBack?: () => void;
  onMenu?: () => void;
  onHome?: () => void;
  children: React.ReactNode;
}

// Android TV key codes
const TV_KEY_CODES = {
  DPAD_UP: 19,
  DPAD_DOWN: 20,
  DPAD_LEFT: 21,
  DPAD_RIGHT: 22,
  DPAD_CENTER: 23,
  ENTER: 13,
  BACK: 4,
  MENU: 82,
  HOME: 3,
  MEDIA_PLAY: 126,
  MEDIA_PAUSE: 127,
  MEDIA_PLAY_PAUSE: 85,
  VOLUME_UP: 24,
  VOLUME_DOWN: 25,
  POWER: 26
};

export const TVRemoteHandler: React.FC<TVRemoteHandlerProps> = ({
  onNavigate,
  onSelect,
  onBack,
  onMenu,
  onHome,
  children
}) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { keyCode, key } = event;
    
    // Prevent default browser behavior for TV navigation
    if ([19, 20, 21, 22, 23, 13, 4, 82, 3].includes(keyCode) || 
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'].includes(key)) {
      event.preventDefault();
    }

    // Handle Android TV D-pad navigation
    switch (keyCode) {
      case TV_KEY_CODES.DPAD_UP:
        onNavigate?.('up');
        break;
      case TV_KEY_CODES.DPAD_DOWN:
        onNavigate?.('down');
        break;
      case TV_KEY_CODES.DPAD_LEFT:
        onNavigate?.('left');
        break;
      case TV_KEY_CODES.DPAD_RIGHT:
        onNavigate?.('right');
        break;
      case TV_KEY_CODES.DPAD_CENTER:
      case TV_KEY_CODES.ENTER:
        onSelect?.();
        break;
      case TV_KEY_CODES.BACK:
        onBack?.();
        break;
      case TV_KEY_CODES.MENU:
        onMenu?.();
        break;
      case TV_KEY_CODES.HOME:
        onHome?.();
        break;
    }

    // Fallback for web testing with regular keyboard
    switch (key) {
      case 'ArrowUp':
        onNavigate?.('up');
        break;
      case 'ArrowDown':
        onNavigate?.('down');
        break;
      case 'ArrowLeft':
        onNavigate?.('left');
        break;
      case 'ArrowRight':
        onNavigate?.('right');
        break;
      case 'Enter':
      case ' ':
        onSelect?.();
        break;
      case 'Escape':
      case 'Backspace':
        onBack?.();
        break;
      case 'F1': // Menu key fallback
        onMenu?.();
        break;
    }
  }, [onNavigate, onSelect, onBack, onMenu, onHome]);

  useEffect(() => {
    // Add TV-specific event listeners
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    
    // Add Android TV specific optimizations
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);

    // Disable text selection for TV interface
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    // Hide cursor for TV interface
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.head.removeChild(meta);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.cursor = '';
    };
  }, [handleKeyDown]);

  return (
    <div className="tv-interface" style={{ outline: 'none' }}>
      {children}
    </div>
  );
};