import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initWebVitals } from '@/utils/telemetry'

createRoot(document.getElementById("root")!).render(<App />);

// Initialize frontend performance telemetry
initWebVitals(0.25);
