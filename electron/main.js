const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let isKioskMode = false;

// Enable live reload for Electron in development
if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: isDev ? 1200 : width,
    height: isDev ? 800 : height,
    fullscreen: !isDev,
    kiosk: !isDev,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon-512x512.png'),
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:8080' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus the window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent new window creation (security)
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Register global shortcuts for kiosk mode
  registerGlobalShortcuts();

  // Handle external links
  mainWindow.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
}

function registerGlobalShortcuts() {
  // Emergency admin access (Ctrl+Alt+Shift+A)
  globalShortcut.register('CommandOrControl+Alt+Shift+A', () => {
    if (mainWindow) {
      mainWindow.webContents.send('emergency-admin-access');
    }
  });

  // Toggle fullscreen (F11)
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      const isFullScreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullScreen);
    }
  });

  // Force quit (Ctrl+Alt+Shift+Q)
  globalShortcut.register('CommandOrControl+Alt+Shift+Q', () => {
    app.quit();
  });

  // Toggle kiosk mode (Ctrl+Alt+Shift+K)
  globalShortcut.register('CommandOrControl+Alt+Shift+K', () => {
    if (mainWindow) {
      isKioskMode = !isKioskMode;
      mainWindow.setKiosk(isKioskMode);
    }
  });
}

// IPC handlers
ipcMain.handle('get-screen-info', () => {
  const displays = screen.getAllDisplays();
  return {
    displays: displays.map(display => ({
      id: display.id,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
      rotation: display.rotation
    })),
    primary: screen.getPrimaryDisplay().id
  };
});

ipcMain.handle('set-fullscreen', (event, fullscreen) => {
  if (mainWindow) {
    mainWindow.setFullScreen(fullscreen);
    return mainWindow.isFullScreen();
  }
  return false;
});

ipcMain.handle('set-kiosk-mode', (event, kiosk) => {
  if (mainWindow) {
    isKioskMode = kiosk;
    mainWindow.setKiosk(kiosk);
    return mainWindow.isKiosk();
  }
  return false;
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
