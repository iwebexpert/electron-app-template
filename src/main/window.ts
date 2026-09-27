import { BrowserWindow, shell, type WebContents } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PRELOAD_PATH = path.join(__dirname, 'preload.js');
const RENDERER_INDEX_PATH = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);

/** Страница самого приложения: dev-сервер Vite (pnpm start) или собранный index.html. */
export function isAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) return parsed.origin === new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL).origin;
    return parsed.protocol === 'file:' && path.resolve(fileURLToPath(parsed)) === path.resolve(RENDERER_INDEX_PATH);
  } catch {
    return false;
  }
}

/** Окно не уходит со страниц приложения: ссылки открываются в браузере, новые окна и webview не создаются. */
function restrictNavigation(webContents: WebContents): void {
  webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  webContents.on('will-navigate', (event, url) => {
    if (!isAppUrl(url)) event.preventDefault();
  });
  webContents.on('will-attach-webview', (event) => event.preventDefault());
}

export function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1024,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    show: false,
    // Цвет фона интерфейса — без белой вспышки до загрузки страницы.
    backgroundColor: '#fafaf9',
    webPreferences: {
      preload: PRELOAD_PATH,
      // Интерфейс изолирован: без Node.js, только API из preload (window.api).
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  restrictNavigation(window.webContents);
  window.once('ready-to-show', () => window.show());

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) void window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  else void window.loadFile(RENDERER_INDEX_PATH);
  return window;
}
