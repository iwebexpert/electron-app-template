import type { AppInfo } from './schemas';

/**
 * API, которое preload открывает интерфейсу как window.api. Каждый метод — отдельный IPC-канал:
 * main регистрирует обработчик (src/main/ipc.ts), preload создаёт вызов по списку каналов (src/preload/preload.ts).
 * Новый метод: добавьте его сюда и в IPC_CHANNELS, затем — обработчик в src/main/ipc.ts.
 */
export interface AppApi {
  /** Название, версия и платформа приложения. */
  getAppInfo(): Promise<AppInfo>;
}

/** Каналы методов AppApi: TypeScript не даст пропустить метод или добавить лишний. */
export const IPC_CHANNELS = {
  getAppInfo: 'app:get-info',
} as const satisfies Record<keyof AppApi, string>;
