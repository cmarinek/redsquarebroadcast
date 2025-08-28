import { app, BrowserWindow } from 'electron';
import path from 'path';

// This is a boilerplate file. For a real app, you'd add more logic here.
// For example, IPC handlers for communication between main and renderer processes.

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      // No preload script for now, but it's good practice for security.
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Vite dev server URL is passed via environment variable in dev mode.
  // In production, we load the built HTML file.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // The path is relative to the location of the main.js file in the build output.
    // This will need to be configured correctly with electron-builder.
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
