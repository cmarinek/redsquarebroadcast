import SEO from "@/components/SEO";
import { ScreensHero } from "@/features/redsquare-screens/components/ScreensHero";
import { ScreensManagement } from "@/features/redsquare-screens/components/ScreensManagement";

export default function RedSquareScreens() {
  return (
    <>
      <SEO 
        title="RedSquare Screens - Turn Your Screen Into Revenue"
        description="Install RedSquare Screens on any device and start earning money by displaying content from our broadcasting platform."
      />
      
      <main className="min-h-screen">
        <ScreensHero />
        <ScreensManagement />
      </main>
    </>
  );
}