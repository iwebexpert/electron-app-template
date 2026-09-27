# Electron App Template

Шаблон desktop-приложения для macOS: Electron с безопасной архитектурой, React-интерфейс и настроенные проверки кода.
Бизнес-логики нет — только основа для нового приложения.

## Stack

- Electron + Electron Forge
- Vite
- React
- TypeScript
- Tailwind CSS
- Zod
- lucide-react
- ESLint + Prettier
- pnpm

## Development

```bash
pnpm install
pnpm start
```

## Checks

```bash
pnpm typecheck      # TypeScript: интерфейс и main/preload проверяются отдельно
pnpm lint           # ESLint, включая форматирование Prettier
pnpm lint:fix       # исправить и отформатировать код
pnpm format         # отформатировать все файлы
pnpm format:check   # проверить форматирование
```

## Build

```bash
pnpm package        # приложение .app в out/
pnpm make           # ZIP и DMG в out/make
```

Приложение подписывается без сертификата (ad-hoc): на этом Mac открывается сразу, на другом — через «Системные
настройки» → «Конфиденциальность и безопасность» → «Всё равно открыть». Для распространения настройте
`packagerConfig.osxSign` и `osxNotarize` в `forge.config.ts` (нужен Apple Developer ID).

## Structure

```text
src/
├── main/        main-процесс: окно (window.ts), обработчики IPC (ipc.ts)
├── preload/     мост между окном и main: window.api
├── renderer/    интерфейс React — без доступа к Node.js
└── shared/      общее: контракт IPC (ipc.ts), схемы Zod (schemas.ts)
```

Окно работает с `contextIsolation`, `sandbox` и без `nodeIntegration`; интерфейс обращается к main-процессу только через
`window.api`. Новый метод IPC: объявите его в `AppApi` и `IPC_CHANNELS` (`src/shared/ipc.ts`) и добавьте обработчик
в `src/main/ipc.ts` — аргументы из интерфейса проверяйте схемами Zod.

## New app

1. `name`, `productName` и `description` в `package.json`, `<title>` в `index.html`.
2. `appBundleId` в `forge.config.ts` (например, `com.company.app`) и иконка (`assets/icon.icns`, `packagerConfig.icon`).
3. Размеры окна — `src/main/window.ts`, Content Security Policy — `vite.renderer.config.mts`.
4. Интерфейс — `src/renderer/App.tsx`.
