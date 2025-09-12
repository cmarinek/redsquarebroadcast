import { useState, useEffect } from 'react';
import { useDisplayMode } from '@/contexts/DisplayModeContext';

export function EmergencyAccess() {
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const { emergencyAccess } = useDisplayMode();
  
  // Emergency key sequence: Ctrl + Shift + E + M + E + R + G
  const EMERGENCY_SEQUENCE = ['Control', 'Shift', 'e', 'm', 'e', 'r', 'g'];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const newSequence = [...keySequence];
      
      // Add current key to sequence
      if (e.ctrlKey && keySequence.length === 0) {
        newSequence.push('Control');
      } else if (e.shiftKey && keySequence.includes('Control') && keySequence.length === 1) {
        newSequence.push('Shift');
      } else if (keySequence.length >= 2) {
        newSequence.push(key);
      }
      
      // Check if sequence matches
      const isValidSequence = newSequence.every((k, i) => 
        k === EMERGENCY_SEQUENCE[i]
      );
      
      if (newSequence.length === EMERGENCY_SEQUENCE.length && isValidSequence) {
        // Emergency access triggered
        emergencyAccess();
        setKeySequence([]);
      } else if (isValidSequence) {
        // Sequence is valid so far
        setKeySequence(newSequence);
      } else {
        // Invalid sequence, reset
        setKeySequence([]);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset sequence if modifier keys are released too early
      if ((e.key === 'Control' || e.key === 'Shift') && keySequence.length < 7) {
        setTimeout(() => setKeySequence([]), 100);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keySequence, emergencyAccess]);
  
  // Auto-reset sequence after 5 seconds of inactivity
  useEffect(() => {
    if (keySequence.length > 0) {
      const timeout = setTimeout(() => {
        setKeySequence([]);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [keySequence]);
  
  return null; // This component only handles keyboard events
}