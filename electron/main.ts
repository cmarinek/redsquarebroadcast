import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable logging for debugging
console.log('Electron main process starting...');

const createWindow = () => {
  console.log('Creating main window...');
  
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false, // Don't show until ready
    backgroundColor: '#0a0a0a', // Set a default background color
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  // Debug web contents events
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Web contents finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Handle renderer process events
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone:', details.reason);
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.error('Renderer process became unresponsive');
  });

  mainWindow.webContents.on('responsive', () => {
    console.log('Renderer process became responsive again');
  });

  // Vite dev server URL is passed via environment variable in dev mode.
  // In production, we load the built HTML file.
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('Loading from dev server:', process.env.VITE_DEV_SERVER_URL);
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // The path is relative to the location of the main.js file in the build output.
    const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('Loading HTML file from:', htmlPath);
    
    // Check if file exists
    const fs = require('fs');
    if (fs.existsSync(htmlPath)) {
      console.log('HTML file exists, loading...');
      
      // Inject fallback CSS into HTML before loading
      const fallbackCSSPath = path.join(__dirname, '..', 'dist', 'electron-fallback.css');
      if (fs.existsSync(fallbackCSSPath)) {
        console.log('Fallback CSS found, will inject into page');
        
        mainWindow.webContents.once('dom-ready', () => {
          console.log('DOM ready, injecting fallback CSS...');
          const fallbackCSS = fs.readFileSync(fallbackCSSPath, 'utf-8');
          mainWindow.webContents.insertCSS(fallbackCSS);
        });
      }
      
      mainWindow.loadFile(htmlPath);
    } else {
      console.error('HTML file not found at:', htmlPath);
      console.log('Current directory:', __dirname);
      try {
        console.log('Available files:', fs.readdirSync(path.dirname(htmlPath)));
      } catch (e) {
        console.error('Could not read directory:', e);
      }
    }
    
    // Enable DevTools in production for debugging (temporary)
    mainWindow.webContents.openDevTools();
  }
};

app.on('ready', () => {
  console.log('Electron app ready');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('Electron app activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
