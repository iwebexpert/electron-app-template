import { app, ipcMain } from 'electron';
import { IPC_CHANNELS, type AppApi } from '../shared/ipc';
import { isAppUrl } from './window';

/**
 * Обработчики методов window.api. Аргументы из интерфейса приходят как unknown: renderer — недоверенная сторона,
 * поэтому каждый аргумент проверяется схемой zod из src/shared/schemas.ts, например `settingsSchema.parse(input)`.
 */
type Handlers = {
  [Method in keyof AppApi]: (...args: unknown[]) => ReturnType<AppApi[Method]> | Awaited<ReturnType<AppApi[Method]>>;
};

const handlers: Handlers = {
  getAppInfo: () => ({
    name: app.getName(),
    version: app.getVersion(),
    platform: process.platform,
    versions: {
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    },
  }),
};

export function registerIpcHandlers(): void {
  for (const method of Object.keys(IPC_CHANNELS) as (keyof AppApi)[]) {
    ipcMain.handle(IPC_CHANNELS[method], (event, ...args: unknown[]) => {
      // Запросы принимаются только со страниц самого приложения.
      if (!isAppUrl(event.senderFrame?.url ?? '')) throw new Error(`IPC ${method}: запрос не со страницы приложения`);
      return handlers[method](...args);
    });
  }
}
