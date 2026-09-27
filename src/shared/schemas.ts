import { z } from 'zod';

// Схемы данных, которые переходят между процессами. Типы TypeScript выводятся из них же (z.infer),
// поэтому проверка во время выполнения и типы не расходятся.

/** Сведения о приложении — ответ main-процесса на window.api.getAppInfo(). */
export const appInfoSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  platform: z.string(),
  versions: z.object({
    electron: z.string(),
    chrome: z.string(),
    node: z.string(),
  }),
});

export type AppInfo = z.infer<typeof appInfoSchema>;
