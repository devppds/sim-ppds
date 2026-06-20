const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'SIM-PPDS',
    icon: path.join(__dirname, 'icon.ico'),
    show: false, // Jangan tampilkan jendela sebelum siap agar tidak berkedip
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Hapus menu bar default agar tampilan bersih dan native
  mainWindow.removeMenu();
  Menu.setApplicationMenu(null);

  // Muat URL utama aplikasi
  mainWindow.loadURL('https://sim-ppds.pages.dev/login');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize(); // Otomatis maksimalkan jendela
  });
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
