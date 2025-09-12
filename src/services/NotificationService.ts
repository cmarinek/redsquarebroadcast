import { toast } from "@/hooks/use-toast";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export class NotificationService {
  static success(message: string, options?: NotificationOptions) {
    toast({
      title: options?.title || "Success",
      description: options?.description || message,
      duration: options?.duration,
    });
  }

  static error(message: string, options?: NotificationOptions) {
    toast({
      title: options?.title || "Error",
      description: options?.description || message,
      variant: "destructive",
      duration: options?.duration,
    });
  }

  static warning(message: string, options?: NotificationOptions) {
    toast({
      title: options?.title || "Warning",
      description: options?.description || message,
      duration: options?.duration,
    });
  }

  static info(message: string, options?: NotificationOptions) {
    toast({
      title: options?.title || "Info",
      description: options?.description || message,
      duration: options?.duration,
    });
  }

  // Role-specific notifications
  static roleAdded(role: string) {
    this.success(`${role} role granted`);
  }

  static roleRemoved(role: string) {
    this.success(`${role} role removed`);
  }

  static roleError(action: string, role: string, error?: string) {
    this.error(`Failed to ${action} ${role} role`, {
      description: error || "Please try again."
    });
  }

  // Device-specific notifications
  static deviceCommandSent(command: string) {
    this.success(`${command} command sent to device`);
  }

  static deviceError(action: string, error?: string) {
    this.error(`Failed to ${action} device`, {
      description: error || "Please try again."
    });
  }
}