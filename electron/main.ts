import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable logging for debugging
console.log('RedSquare Screens starting...');

// Set application menu
const createMenu = () => {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About RedSquare Screens',
          click: async () => {
            await shell.openExternal('https://redsquare.app/screens');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

const createWindow = () => {
  console.log('Creating RedSquare Screens window...');
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    icon: process.platform === 'linux' ? path.join(__dirname, '..', 'public', 'icon-512x512.png') : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false
    }
  });

  // Create application menu
  createMenu();

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== mainWindow.webContents.getURL().split('/').slice(0, 3).join('/')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('RedSquare Screens ready to show');
    mainWindow.show();
    
    // Focus the window
    if (process.platform === 'darwin') {
      app.dock.show();
    }
    mainWindow.focus();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    console.log('Main window closed');
  });

  // Debug web contents events
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('RedSquare Screens loaded successfully');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load RedSquare Screens:', errorCode, errorDescription);
  });

  // Handle renderer process events
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('Renderer process gone:', details.reason);
    
    // Attempt to reload the app
    setTimeout(() => {
      if (!mainWindow.isDestroyed()) {
        mainWindow.reload();
      }
    }, 1000);
  });

  mainWindow.webContents.on('unresponsive', () => {
    console.error('Renderer process became unresponsive');
  });

  mainWindow.webContents.on('responsive', () => {
    console.log('Renderer process became responsive again');
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    console.log('Loading from dev server:', process.env.VITE_DEV_SERVER_URL);
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode
    const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('Loading HTML file from:', htmlPath);
    
    // Check if file exists
    if (fs.existsSync(htmlPath)) {
      console.log('HTML file exists, loading RedSquare Screens...');
      
      // Inject fallback CSS if available
      const fallbackCSSPath = path.join(__dirname, '..', 'dist', 'electron-fallback.css');
      if (fs.existsSync(fallbackCSSPath)) {
        console.log('Fallback CSS found, will inject into page');
        
        mainWindow.webContents.once('dom-ready', () => {
          console.log('DOM ready, injecting fallback CSS...');
          try {
            const fallbackCSS = fs.readFileSync(fallbackCSSPath, 'utf-8');
            mainWindow.webContents.insertCSS(fallbackCSS);
          } catch (error) {
            console.error('Failed to inject fallback CSS:', error);
          }
        });
      }
      
      mainWindow.loadFile(htmlPath);
    } else {
      console.error('HTML file not found at:', htmlPath);
      console.log('Current directory:', __dirname);
      
      // Show error dialog to user
      const { dialog } = require('electron');
      dialog.showErrorBox(
        'RedSquare Screens - Installation Error',
        'The application files are missing or corrupted. Please reinstall RedSquare Screens.'
      );
      
      try {
        console.log('Available files:', fs.readdirSync(path.dirname(htmlPath)));
      } catch (e) {
        console.error('Could not read directory:', e);
      }
      
      app.quit();
    }
  }

  return mainWindow;
};

// App event handlers
app.whenReady().then(() => {
  console.log('RedSquare Screens app ready');
  
  // Set app user model ID for Windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.redsquare.screens');
  }
  
  createWindow();

  // Handle app activation (macOS)
  app.on('activate', () => {
    console.log('RedSquare Screens activated');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running');
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    const windows = BrowserWindow.getAllWindows();
    if (windows.length > 0) {
      const mainWindow = windows[0];
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
