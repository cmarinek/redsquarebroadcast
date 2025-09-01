import { useState, useCallback } from "react";
import { NotificationService } from "@/services/NotificationService";

interface AsyncOperationOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const useAsyncOperation = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  options: AsyncOperationOptions = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    errorMessage
  } = options;

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation(...args);
      
      if (showSuccessToast && successMessage) {
        NotificationService.success(successMessage);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (showErrorToast) {
        NotificationService.error(errorMessage || error.message);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [operation, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null)
  };
};