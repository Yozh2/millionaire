const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const devDistPath = path.join(__dirname, '..', 'dist', 'desktop');
const packagedDistPath = path.join(process.resourcesPath, 'app-dist');

function getGameDistPath() {
  return app.isPackaged ? packagedDistPath : devDistPath;
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#050812',
    title: app.name,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const indexUrl = pathToFileURL(path.join(getGameDistPath(), 'index.html'));
  window.loadURL(indexUrl.toString());
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
