import { AppWindow, CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import { useEffect, useState, version as reactVersion, type ReactNode } from 'react';
import { appInfoSchema, type AppInfo } from '../shared/schemas';
import { api } from './api';

type AppInfoState = { status: 'loading' } | { status: 'ready'; info: AppInfo } | { status: 'error'; message: string };
type CheckStatus = 'ok' | 'pending' | 'error';

// Стартовая страница шаблона: подтверждает, что стек работает. Замените её интерфейсом своего приложения.
export function App() {
  const [state, setState] = useState<AppInfoState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    // Typed IPC: renderer → preload → main. Ответ main-процесса проверяется схемой zod.
    api
      .getAppInfo()
      .then((info) => appInfoSchema.parse(info))
      .then(
        (info) => {
          if (active) setState({ status: 'ready', info });
        },
        (error: unknown) => {
          if (active) setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
        },
      );
    return () => {
      active = false;
    };
  }, []);

  const info = state.status === 'ready' ? state.info : null;
  const ipc: CheckStatus = state.status === 'ready' ? 'ok' : state.status === 'loading' ? 'pending' : 'error';
  // С contextIsolation и sandbox в окне интерфейса нет ни process, ни require.
  const isolated = !('process' in globalThis) && !('require' in globalThis);

  return (
    <main className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-8 px-8 py-12">
      <header className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <AppWindow size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Electron App Template</h1>
          <p className="text-sm text-stone-500">Electron Forge · Vite · React · TypeScript · Tailwind CSS</p>
        </div>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        <Check name="Electron" detail={info ? `v${info.versions.electron}` : 'main process'} status={ipc} />
        <Check name="React" detail={`v${reactVersion}`} status="ok" />
        <Check name="TypeScript" detail="strict mode" status="ok" />
        <Check name="Tailwind CSS" detail="utility classes" status="ok" />
        <Check name="IPC" detail="window.api.getAppInfo()" status={ipc} />
        <Check name="Zod" detail="IPC response validated" status={ipc} />
        <Check name="Lucide" detail="lucide-react icons" status="ok" />
        <Check name="Isolation" detail="no Node.js in renderer" status={isolated ? 'ok' : 'error'} />
      </ul>

      {info && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm">
          <dt className="text-stone-500">Name</dt>
          <dd>{info.name}</dd>
          <dt className="text-stone-500">Version</dt>
          <dd>{info.version}</dd>
          <dt className="text-stone-500">Platform</dt>
          <dd>{info.platform}</dd>
          <dt className="text-stone-500">Chrome · Node.js</dt>
          <dd>
            {info.versions.chrome} · {info.versions.node}
          </dd>
        </dl>
      )}
      {state.status === 'error' && <p className="text-sm text-red-600">{state.message}</p>}

      <p className="text-xs text-stone-400">
        Start editing <code className="font-mono">src/renderer/App.tsx</code>
      </p>
    </main>
  );
}

const STATUS_ICONS = {
  ok: <CircleCheck size={18} className="shrink-0 text-emerald-600" />,
  pending: <LoaderCircle size={18} className="shrink-0 animate-spin text-stone-400" />,
  error: <CircleAlert size={18} className="shrink-0 text-red-600" />,
} satisfies Record<CheckStatus, ReactNode>;

function Check({ name, detail, status }: { name: string; detail: string; status: CheckStatus }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
      {STATUS_ICONS[status]}
      <div className="min-w-0">
        <div className="text-sm font-medium">{name}</div>
        <div className="truncate text-xs text-stone-500">{detail}</div>
      </div>
    </li>
  );
}
