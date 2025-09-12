import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useDisplayMode } from '@/contexts/DisplayModeContext';
import { toast } from 'sonner';

interface AccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AccessDialog({ open, onOpenChange, onSuccess }: AccessDialogProps) {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const { verifyAccess, isSecured } = useDisplayMode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSecured) {
      onSuccess();
      return;
    }
    
    if (verifyAccess(pin)) {
      onSuccess();
      setPin('');
      toast.success('Access granted');
    } else {
      toast.error('Invalid PIN');
      setPin('');
    }
  };

  const handleClose = () => {
    setPin('');
    setShowPin(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin Access Required
          </DialogTitle>
          <DialogDescription>
            {isSecured 
              ? "Enter your PIN to access admin mode." 
              : "Click continue to access admin mode."
            }
          </DialogDescription>
        </DialogHeader>
        
        {isSecured && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pin">Access PIN</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter PIN"
                    className="pr-10"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!pin.trim()}>
                Access Admin Mode
              </Button>
            </DialogFooter>
          </form>
        )}
        
        {!isSecured && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={onSuccess}>
              Continue to Admin Mode
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}