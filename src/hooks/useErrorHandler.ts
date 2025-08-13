import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ErrorHandlerOptions {
  title?: string;
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      title = "Something went wrong",
      showToast = true,
      logError = true,
      fallbackMessage = "An unexpected error occurred. Please try again."
    } = options;

    // Extract error message
    let errorMessage = fallbackMessage;
    let errorCode: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      const errorObj = error as any;
      errorMessage = errorObj.message || errorObj.error || errorObj.details || fallbackMessage;
      errorCode = errorObj.code;
    }

    // Categorize errors
    const isNetworkError = 
      errorCode === 'NETWORK_ERROR' || 
      errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('fetch') ||
      !navigator.onLine;

    const isAuthError = 
      errorCode === 'INVALID_JWT' ||
      errorMessage.toLowerCase().includes('unauthorized') ||
      errorMessage.toLowerCase().includes('authentication');

    const isValidationError = 
      errorCode === 'VALIDATION_ERROR' ||
      errorMessage.toLowerCase().includes('validation') ||
      errorMessage.toLowerCase().includes('invalid');

    const isRateLimitError = 
      errorCode === 'RATE_LIMIT_EXCEEDED' ||
      errorMessage.toLowerCase().includes('rate limit') ||
      errorMessage.toLowerCase().includes('too many requests');

    // Customize error message based on category
    let displayMessage = errorMessage;
    let variant: "default" | "destructive" = "destructive";

    if (isNetworkError) {
      displayMessage = "Network error. Please check your connection and try again.";
    } else if (isAuthError) {
      displayMessage = "Authentication expired. Please log in again.";
    } else if (isValidationError) {
      displayMessage = `Validation error: ${errorMessage}`;
    } else if (isRateLimitError) {
      displayMessage = "Too many requests. Please wait a moment and try again.";
      variant = "default";
    }

    // Log error for debugging
    if (logError) {
      console.error('Error handled:', {
        original: error,
        message: errorMessage,
        code: errorCode,
        category: {
          isNetworkError,
          isAuthError,
          isValidationError,
          isRateLimitError
        },
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      // Dispatch error event for global error tracking
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: {
          error: errorMessage,
          code: errorCode,
          category: isNetworkError ? 'network' : 
                   isAuthError ? 'auth' :
                   isValidationError ? 'validation' :
                   isRateLimitError ? 'rate_limit' : 'unknown',
          timestamp: Date.now(),
          url: window.location.href
        }
      }));
    }

    // Show toast notification
    if (showToast) {
      toast({
        title,
        description: displayMessage,
        variant
      });
    }

    return {
      message: displayMessage,
      category: {
        isNetworkError,
        isAuthError,
        isValidationError,
        isRateLimitError
      },
      shouldRetry: isNetworkError || isRateLimitError,
      shouldRedirectToAuth: isAuthError
    };
  }, [toast]);

  // Specialized error handlers
  const handleNetworkError = useCallback((error: unknown, title = "Connection Error") => {
    return handleError(error, {
      title,
      fallbackMessage: "Unable to connect to the server. Please check your internet connection."
    });
  }, [handleError]);

  const handleAuthError = useCallback((error: unknown, title = "Authentication Error") => {
    return handleError(error, {
      title,
      fallbackMessage: "Your session has expired. Please log in again."
    });
  }, [handleError]);

  const handleValidationError = useCallback((error: unknown, title = "Validation Error") => {
    return handleError(error, {
      title,
      fallbackMessage: "Please check your input and try again."
    });
  }, [handleError]);

  return {
    handleError,
    handleNetworkError,
    handleAuthError,
    handleValidationError
  };
}