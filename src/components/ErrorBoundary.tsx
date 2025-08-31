import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Enhanced logging for Electron environment
    const isElectron = !!(window as any).electronAPI || !!(window as any).require || navigator.userAgent.indexOf('Electron') !== -1;
    if (isElectron) {
      console.error('Running in Electron environment - Error details:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        location: window.location.href,
        timestamp: Date.now()
      });
    }
    
    // Report to error tracking service
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: Date.now(),
          isElectron
        }
      }));
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. This has been logged and our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(process.env.NODE_ENV === 'development' || navigator.userAgent.indexOf('Electron') !== -1) && this.state.error && (
                <div className="p-3 bg-muted rounded text-sm font-mono text-xs overflow-auto max-h-32">
                  <div>Error: {this.state.error.message}</div>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer">Stack trace</summary>
                      <pre className="mt-1 text-xs">{this.state.error.stack}</pre>
                    </details>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}