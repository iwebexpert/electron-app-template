import { execFile } from 'node:child_process';
import { chmod, mkdtemp, readdir, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { MakerZIP } from '@electron-forge/maker-zip';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { VitePlugin } from '@electron-forge/plugin-vite';
import type { ForgeConfig, ForgeMakeResult } from '@electron-forge/shared-types';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const run = promisify(execFile);

/**
 * Подпись .app без сертификата (ad-hoc). Упаковка меняет Info.plist и файлы Electron, и его исходная подпись
 * становится недействительной: с такой подписью macOS молча отказывает в доступе к защищённым папкам и может счесть
 * приложение повреждённым. Когда появится сертификат Apple Developer, настройте packagerConfig.osxSign
 * и osxNotarize — тогда этот шаг пропускается.
 */
async function signAdHoc(outputPath: string): Promise<void> {
  for (const name of await readdir(outputPath)) {
    if (!name.endsWith('.app')) continue;
    const appPath = path.join(outputPath, name);
    // Расширенные атрибуты Finder мешают подписи («resource fork, Finder information… not allowed»).
    await run('xattr', ['-cr', appPath]);
    await run('codesign', ['--force', '--deep', '--sign', '-', appPath]);
    await run('codesign', ['--verify', '--deep', '--strict', appPath]);
  }
}

/** DMG — приложение и ярлык «Applications» для установки перетаскиванием. Собирается встроенной утилитой hdiutil. */
async function makeDmg(outDir: string, result: ForgeMakeResult): Promise<string> {
  const { productName, version } = result.packageJSON as { productName: string; version: string };
  const appPath = path.resolve(outDir, `${productName}-darwin-${result.arch}`, `${productName}.app`);
  const dmgPath = path.resolve(outDir, 'make', `${productName}-${version}-${result.arch}.dmg`);
  const staging = await mkdtemp(path.join(tmpdir(), 'dmg-'));
  // Корень DMG открыт для чтения всем: временная папка создаётся с правами 700.
  await chmod(staging, 0o755);
  try {
    await run('ditto', [appPath, path.join(staging, `${productName}.app`)]);
    await symlink('/Applications', path.join(staging, 'Applications'));
    await rm(dmgPath, { force: true });
    await run('hdiutil', [
      'create',
      '-volname',
      productName,
      '-srcfolder',
      staging,
      '-fs',
      'HFS+',
      '-format',
      'UDZO',
      dmgPath,
    ]);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  return dmgPath;
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // Идентификатор приложения в macOS: от него зависят подпись, разрешения и Связка ключей.
    appBundleId: 'com.example.electron-app-template',
    // Иконка: положите assets/icon.icns и раскомментируйте строку.
    // icon: 'assets/icon',
  },
  makers: [new MakerZIP({}, ['darwin'])],
  hooks: {
    postPackage: async (forgeConfig, { platform, outputPaths }) => {
      if (platform !== 'darwin' || forgeConfig.packagerConfig.osxSign) return;
      for (const outputPath of outputPaths) await signAdHoc(outputPath);
    },
    // Кроме ZIP — DMG для привычной установки на Mac.
    postMake: async (forgeConfig, makeResults) => {
      const dmgs: ForgeMakeResult[] = [];
      for (const result of makeResults) {
        if (result.platform !== 'darwin') continue;
        dmgs.push({ ...result, artifacts: [await makeDmg(forgeConfig.outDir ?? 'out', result)] });
      }
      return [...makeResults, ...dmgs];
    },
  },
  plugins: [
    new VitePlugin({
      build: [
        { entry: 'src/main/main.ts', config: 'vite.main.config.mts', target: 'main' },
        { entry: 'src/preload/preload.ts', config: 'vite.preload.config.mts', target: 'preload' },
      ],
      renderer: [{ name: 'main_window', config: 'vite.renderer.config.mts' }],
    }),
    // Флаги, которые при упаковке записываются в исполняемый файл Electron: приложение нельзя запустить как Node.js
    // или подменить его код вне app.asar.
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
