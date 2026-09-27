// Preload открывает интерфейсу только методы AppApi (window.api): каждый вызывает свой IPC-канал.
// Сам ipcRenderer и другие API Electron наружу не передаются.
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc';

const api = Object.fromEntries(
  Object.entries(IPC_CHANNELS).map(([method, channel]) => [
    method,
    (...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
  ]),
);

contextBridge.exposeInMainWorld('api', api);
