import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type DisplayMode = 'admin' | 'display';

interface DisplayModeState {
  mode: DisplayMode;
  isSecured: boolean;
  accessPin: string | null;
  scheduledModeSwitch: Date | null;
  emergencyAccessEnabled: boolean;
}

interface DisplayModeContextType extends DisplayModeState {
  setMode: (mode: DisplayMode) => void;
  setAccessPin: (pin: string | null) => void;
  verifyAccess: (pin: string) => boolean;
  scheduleAutoSwitch: (date: Date | null) => void;
  emergencyAccess: () => void;
  resetSecurity: () => void;
}

const DisplayModeContext = createContext<DisplayModeContextType | null>(null);

const STORAGE_KEY = 'redsquare_display_mode';
const PIN_KEY = 'redsquare_access_pin';

export function DisplayModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DisplayModeState>({
    mode: 'admin',
    isSecured: false,
    accessPin: null,
    scheduledModeSwitch: null,
    emergencyAccessEnabled: true
  });

  // Load persisted state on init
  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as DisplayMode;
    const savedPin = localStorage.getItem(PIN_KEY);
    
    if (savedMode) {
      setState(prev => ({
        ...prev,
        mode: savedMode,
        accessPin: savedPin,
        isSecured: !!savedPin
      }));
    }
  }, []);

  // Persist mode changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, state.mode);
  }, [state.mode]);

  // Handle scheduled mode switches
  useEffect(() => {
    if (!state.scheduledModeSwitch) return;

    const now = new Date();
    const timeUntilSwitch = state.scheduledModeSwitch.getTime() - now.getTime();

    if (timeUntilSwitch <= 0) {
      setMode('display');
      return;
    }

    const timeout = setTimeout(() => {
      setMode('display');
      toast.success('Automatically switched to display mode');
    }, timeUntilSwitch);

    return () => clearTimeout(timeout);
  }, [state.scheduledModeSwitch]);

  const setMode = (mode: DisplayMode) => {
    setState(prev => ({ ...prev, mode }));
    
    if (mode === 'display') {
      toast.success('Switched to display mode');
    } else {
      toast.success('Switched to admin mode');
    }
  };

  const setAccessPin = (pin: string | null) => {
    setState(prev => ({
      ...prev,
      accessPin: pin,
      isSecured: !!pin
    }));
    
    if (pin) {
      localStorage.setItem(PIN_KEY, pin);
      toast.success('Access PIN set successfully');
    } else {
      localStorage.removeItem(PIN_KEY);
      toast.success('Access PIN removed');
    }
  };

  const verifyAccess = (pin: string): boolean => {
    return !state.isSecured || state.accessPin === pin;
  };

  const scheduleAutoSwitch = (date: Date | null) => {
    setState(prev => ({ ...prev, scheduledModeSwitch: date }));
    
    if (date) {
      toast.success(`Scheduled auto-switch to display mode at ${date.toLocaleString()}`);
    } else {
      toast.success('Scheduled auto-switch cancelled');
    }
  };

  const emergencyAccess = () => {
    if (state.mode === 'display' && state.emergencyAccessEnabled) {
      setMode('admin');
      toast.warning('Emergency access activated');
    }
  };

  const resetSecurity = () => {
    setState(prev => ({
      ...prev,
      isSecured: false,
      accessPin: null
    }));
    localStorage.removeItem(PIN_KEY);
    toast.success('Security settings reset');
  };

  return (
    <DisplayModeContext.Provider value={{
      ...state,
      setMode,
      setAccessPin,
      verifyAccess,
      scheduleAutoSwitch,
      emergencyAccess,
      resetSecurity
    }}>
      {children}
    </DisplayModeContext.Provider>
  );
}

export function useDisplayMode() {
  const context = useContext(DisplayModeContext);
  if (!context) {
    throw new Error('useDisplayMode must be used within DisplayModeProvider');
  }
  return context;
}