// @ts-check
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // Сборка Vite и готовые приложения Electron Forge.
  globalIgnores(['.vite/', 'out/']),
  {
    files: ['**/*.{ts,tsx,mts,mjs}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  // Main, preload и файлы настроек выполняются в Node.js.
  {
    files: ['src/main/**', 'src/preload/**', '*.{ts,mts,mjs}'],
    languageOptions: { globals: globals.node },
  },
  // Интерфейс — окружение браузера; правила хуков React и Fast Refresh (HMR Vite).
  {
    files: ['src/renderer/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
  },
  // Последним: отступление от стиля Prettier (prettier.config.mjs) — ошибка prettier/prettier, её исправляет
  // `pnpm lint:fix`; правила ESLint, которые спорят с Prettier, выключены.
  prettierRecommended,
]);
