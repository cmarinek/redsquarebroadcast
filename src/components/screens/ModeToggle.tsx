import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Play, Shield, Clock } from 'lucide-react';
import { useDisplayMode } from '@/contexts/DisplayModeContext';

interface ModeToggleProps {
  currentMode: 'admin' | 'display';
  onModeChange: () => void;
}

export function ModeToggle({ currentMode, onModeChange }: ModeToggleProps) {
  const { isSecured, scheduledModeSwitch } = useDisplayMode();

  return (
    <div className="flex items-center gap-3">
      {/* Scheduled Switch Indicator */}
      {scheduledModeSwitch && (
        <Badge variant="outline" className="text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Auto-switch: {scheduledModeSwitch.toLocaleTimeString()}
        </Badge>
      )}
      
      {/* Security Indicator */}
      {isSecured && (
        <Badge variant="secondary" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Secured
        </Badge>
      )}
      
      {/* Mode Toggle Button */}
      <Button
        onClick={onModeChange}
        className="bg-primary hover:bg-primary/90"
      >
        {currentMode === 'admin' ? (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start Display Mode
          </>
        ) : (
          <>
            <Monitor className="w-4 h-4 mr-2" />
            Admin Mode
          </>
        )}
      </Button>
    </div>
  );
}