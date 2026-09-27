import type { AppApi } from '../shared/ipc';

declare global {
  interface Window {
    /** API из preload (src/preload/preload.ts) — другого доступа к Electron и Node.js у интерфейса нет. */
    readonly api: AppApi;
  }
}

export const api: AppApi = window.api;
