import { app, BrowserWindow, session } from 'electron';
import { registerIpcHandlers } from './ipc';
import { createMainWindow } from './window';

let mainWindow: BrowserWindow | null = null;

function showMainWindow(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return;
  }
  mainWindow = createMainWindow();
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Один экземпляр приложения: повторный запуск показывает уже открытое окно.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (app.isReady()) showMainWindow();
  });

  void app.whenReady().then(() => {
    // Разрешения, которые запрашивают страницы (камера, микрофон, уведомления…), не выдаются — добавляйте нужные явно.
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
    registerIpcHandlers();
    showMainWindow();
  });

  // macOS: без окон приложение остаётся в Dock, щелчок по значку снова открывает окно.
  app.on('activate', () => {
    if (app.isReady() && BrowserWindow.getAllWindows().length === 0) showMainWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
