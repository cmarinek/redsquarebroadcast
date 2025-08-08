import { Navigation } from '@/components/Navigation';
import { DeviceSetup as DeviceSetupComponent } from '@/components/DeviceSetup';

export default function DeviceSetup() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto py-8 px-4">
        <DeviceSetupComponent />
      </main>
    </div>
  );
}