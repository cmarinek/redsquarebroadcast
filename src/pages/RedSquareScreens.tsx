import { DisplayModeProvider } from '@/contexts/DisplayModeContext';
import { ScreenApplication } from '@/components/screens/ScreenApplication';
import SEO from "@/components/SEO";

export default function RedSquareScreens() {
  // Get screen ID from URL params or generate one
  const urlParams = new URLSearchParams(window.location.search);
  const screenId = urlParams.get('screenId') || 'demo-screen-001';

  return (
    <>
      <SEO 
        title="RedSquare Screens - Digital Display Application"
        description="Access the RedSquare Screens application for smart TVs, digital displays, and media devices. Transform any screen into a digital advertising display."
      />
      
      <DisplayModeProvider>
        <ScreenApplication screenId={screenId} />
      </DisplayModeProvider>
    </>
  );
}