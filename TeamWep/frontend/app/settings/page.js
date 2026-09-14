'use client';

import { useTheme } from '@/context/ThemeContext';

const presets = [
  { name: 'Midnight Signal', accent: '#4f8cff', sidebar: '#111827', panel: '#111827', theme: 'dark' },
  { name: 'Cobalt Studio', accent: '#2563eb', sidebar: '#172554', panel: '#ffffff', theme: 'light' },
  { name: 'Emerald Office', accent: '#0f9f78', sidebar: '#12302c', panel: '#ffffff', theme: 'light' },
  { name: 'Coral Focus', accent: '#ef6f61', sidebar: '#2b1d2b', panel: '#fffaf8', theme: 'light' },
];

function ColorControl({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <span>
        <span className="block text-sm font-bold">{label}</span>
        <span className="mt-1 block text-xs text-slate-500">Choose a color for this surface.</span>
      </span>
      <span className="flex items-center gap-2">
        <input className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <span className="font-mono text-xs uppercase text-slate-500">{value}</span>
      </span>
    </label>
  );
}

export default function SettingsPage() {
  const { appearance, updateAppearance, resetAppearance } = useTheme();

  return (
    <main className="page-shell">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">Workspace settings</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Make TeamWep yours.</h1>
        <p className="mt-3 text-base text-slate-500">Tune the visual language of the dashboard. Changes apply instantly and are saved in this browser.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="card rounded-3xl p-6">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold">Signature presets</h2>
              <p className="mt-1 text-sm text-slate-500">Start with a considered palette, then refine every detail below.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {presets.map((preset) => (
                <button
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] dark:border-slate-700"
                  key={preset.name}
                  onClick={() => updateAppearance(preset)}
                  type="button"
                >
                  <span className="flex gap-1">
                    <span className="h-10 w-3 rounded-full" style={{ backgroundColor: preset.sidebar }} />
                    <span className="h-10 w-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                    <span className="h-10 w-3 rounded-full border border-slate-200" style={{ backgroundColor: preset.panel }} />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{preset.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">{preset.theme === 'dark' ? 'Dark workspace' : 'Light workspace'}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="card rounded-3xl p-6">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold">Color system</h2>
              <p className="mt-1 text-sm text-slate-500">Set the visual anchors for navigation, content, and actions.</p>
            </div>
            <div className="space-y-3">
              <ColorControl label="Accent color" value={appearance.accent} onChange={(accent) => updateAppearance({ accent })} />
              <ColorControl label="Left panel color" value={appearance.sidebar} onChange={(sidebar) => updateAppearance({ sidebar })} />
              <ColorControl label="Right panel color" value={appearance.panel} onChange={(panel) => updateAppearance({ panel })} />
            </div>
          </section>

          <section className="card rounded-3xl p-6">
            <div className="mb-5">
              <h2 className="text-xl font-extrabold">Type and spacing</h2>
              <p className="mt-1 text-sm text-slate-500">Choose the rhythm that feels best for your daily work.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold">
                Interface font
                <select className="input mt-2" value={appearance.font} onChange={(event) => updateAppearance({ font: event.target.value })}>
                  <option>Manrope</option>
                  <option>Outfit</option>
                  <option>IBM Plex Sans</option>
                </select>
              </label>
              <label className="block text-sm font-bold">
                Layout density
                <select className="input mt-2" value={appearance.density} onChange={(event) => updateAppearance({ density: event.target.value })}>
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="spacious">Spacious</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => updateAppearance({ theme: 'light' })} type="button">Light mode</button>
              <button className="btn-secondary" onClick={() => updateAppearance({ theme: 'dark' })} type="button">Dark mode</button>
              <button className="text-sm font-bold text-slate-500 underline underline-offset-4" onClick={resetAppearance} type="button">Reset defaults</button>
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl dark:border-slate-700" style={{ backgroundColor: appearance.panel }}>
            <div className="p-5" style={{ backgroundColor: appearance.sidebar, color: '#fff' }}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Live preview</p>
              <h2 className="mt-2 text-2xl font-black">Your workspace</h2>
              <div className="mt-5 space-y-2">
                <div className="rounded-xl px-3 py-2 text-sm font-bold text-white" style={{ backgroundColor: appearance.accent }}>Active navigation</div>
                <div className="rounded-xl px-3 py-2 text-sm opacity-70">Quiet navigation</div>
              </div>
            </div>
            <div className="space-y-4 p-5" style={{ color: appearance.theme === 'dark' ? '#e2e8f0' : '#101828' }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-50">Today</p>
                <p className="mt-2 text-lg font-extrabold">A clear view of the work.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm font-bold"><span>Project health</span><span style={{ color: appearance.accent }}>84%</span></div>
                <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full" style={{ backgroundColor: appearance.accent, width: '84%' }} /></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
