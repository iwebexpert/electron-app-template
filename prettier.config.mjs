// Единый стиль кода. TypeScript/React форматирует ESLint (правило prettier/prettier): `pnpm lint:fix` или сохранение
// файла в VS Code. Остальные файлы (CSS, HTML, JSON, Markdown, YAML) — сам Prettier: `pnpm format`.

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  // Длина строки: длинные типы и JSX с классами Tailwind не дробятся на много коротких строк, а код удобно читать
  // и сравнивать в две колонки. Строки текста Prettier не переносит.
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  // Точка с запятой: строка, начинающаяся с «(» или «[», не склеится с предыдущей.
  semi: true,
  // Одинарные кавычки в коде, двойные — в атрибутах JSX, как в HTML.
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  // Запятая после последнего элемента многострочных списков: новая строка в конце не меняет предыдущую.
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  // Скобки у единственного параметра стрелочной функции — всегда: (item) => …
  arrowParens: 'always',
  // Объект, записанный в несколько строк, остаётся многострочным.
  objectWrap: 'preserve',
  endOfLine: 'lf',
  proseWrap: 'preserve',

  // Классы Tailwind в className — в рекомендованном порядке. Тема — из CSS, который подключает Tailwind.
  // Плагин должен идти последним в списке.
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/renderer/index.css',
};

export default config;
