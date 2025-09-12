import { useEffect, useState } from 'react';
import { useDisplayMode } from '@/contexts/DisplayModeContext';
import { AdminMode } from './AdminMode';
import { DisplayMode } from './DisplayMode';
import { AccessDialog } from './AccessDialog';
import { EmergencyAccess } from './EmergencyAccess';

interface ScreenApplicationProps {
  screenId?: string;
}

export function ScreenApplication({ screenId }: ScreenApplicationProps) {
  const { mode, isSecured } = useDisplayMode();
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [requestedMode, setRequestedMode] = useState<'admin' | 'display'>('admin');

  // Handle mode switching with security check
  const handleModeSwitch = (targetMode: 'admin' | 'display') => {
    if (isSecured && targetMode === 'admin') {
      setRequestedMode('admin');
      setShowAccessDialog(true);
    } else {
      // Direct switch for display mode or when not secured
      useDisplayMode().setMode(targetMode);
    }
  };

  // Prevent back button in display mode
  useEffect(() => {
    if (mode === 'display') {
      const handlePopState = (event: PopStateEvent) => {
        event.preventDefault();
        window.history.pushState(null, '', window.location.href);
      };

      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [mode]);

  // Disable context menu in display mode
  useEffect(() => {
    if (mode === 'display') {
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      document.addEventListener('contextmenu', handleContextMenu);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [mode]);

  if (mode === 'display') {
    return (
      <>
        <DisplayMode 
          screenId={screenId} 
          onRequestAdminMode={() => handleModeSwitch('admin')}
        />
        <EmergencyAccess />
        <AccessDialog
          open={showAccessDialog}
          onOpenChange={setShowAccessDialog}
          onSuccess={() => {
            setShowAccessDialog(false);
            useDisplayMode().setMode(requestedMode);
          }}
        />
      </>
    );
  }

  return (
    <>
      <AdminMode 
        screenId={screenId} 
        onRequestDisplayMode={() => handleModeSwitch('display')}
      />
      <AccessDialog
        open={showAccessDialog}
        onOpenChange={setShowAccessDialog}
        onSuccess={() => {
          setShowAccessDialog(false);
          useDisplayMode().setMode(requestedMode);
        }}
      />
    </>
  );
}