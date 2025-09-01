import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => {
  // LoadingFallback rendered: ${message}
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background text-foreground"
      style={{
        // Fallback inline styles in case CSS variables don't load
        backgroundColor: '#0a0a0a',
        color: '#fafafa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="text-xs opacity-50">
          App Environment: {navigator.userAgent.indexOf('Electron') !== -1 ? 'Electron' : 'Web'}
        </div>
      </div>
    </div>
  );
};