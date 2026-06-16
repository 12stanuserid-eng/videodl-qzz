'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ApiKeyCard } from './api-key-card';
import { LoadingSpinner } from './loading-spinner';

type DashboardTab = 'generate' | 'keys' | 'usage' | 'docs';

type UsagePayload = {
  today?: { used?: number; remaining?: number | 'unlimited' };
  month?: { requests?: number };
  total?: { requests?: number };
};

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();
    return data?.error?.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

const tabs: Array<{ id: DashboardTab; label: string; helper: string }> = [
  { id: 'generate', label: 'Generate', helper: 'Create a developer key' },
  { id: 'keys', label: 'API Keys', helper: 'Reveal, copy, revoke' },
  { id: 'usage', label: 'Usage', helper: 'Check request stats' },
  { id: 'docs', label: 'Docs', helper: 'Integration snippets' }
];

export function DashboardClient() {
  const { email, setEmail, apiKey, setApiKey, generatedKeys, addGeneratedKey, removeGeneratedKey } = useAppStore();
  const [activeTab, setActiveTab] = useState<DashboardTab>('generate');
  const [name, setName] = useState('Website integration key');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [message, setMessage] = useState('');
  const [usage, setUsage] = useState<UsagePayload | null>(null);

  async function generateKey() {
    setMessage('');
    setStatus('loading');
    try {
      const response = await fetch('/api/v1/api-keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, plan: 'FREE' })
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const payload = await response.json();
      addGeneratedKey({
        id: payload.data.apiKey.id,
        name: payload.data.apiKey.name,
        key: payload.data.key,
        prefix: payload.data.apiKey.prefix,
        lastFour: payload.data.apiKey.lastFour,
        createdAt: payload.data.apiKey.createdAt,
        expiresAt: payload.data.apiKey.expiresAt
      });
      setActiveTab('keys');
      setMessage('Developer API key generated. Use it only for your own website/app integration.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setStatus('idle');
    }
  }

  async function loadUsage() {
    setMessage('');
    setUsage(null);
    if (!apiKey) return setMessage('Select or paste an API key first.');
    setStatus('loading');
    try {
      const response = await fetch('/api/v1/usage', { headers: { 'X-API-Key': apiKey } });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const payload = await response.json();
      setUsage(payload.data);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setStatus('idle');
    }
  }

  async function revoke(id: string, key: string) {
    setMessage('');
    setStatus('loading');
    try {
      const response = await fetch(`/api/v1/api-keys/${id}/revoke`, {
        method: 'DELETE',
        headers: { 'X-API-Key': key }
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      removeGeneratedKey(id);
      if (apiKey === key) setApiKey('');
      setMessage('API key revoked.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div className="grid gap-6">
      <div className="glass-card rounded-[2rem] p-3">
        <div className="grid gap-2 sm:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-[1.5rem] p-4 text-left transition ${activeTab === tab.id ? 'bg-slate-950 text-white shadow-soft' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <span className="block text-sm font-black">{tab.label}</span>
              <span className={`mt-1 block text-xs ${activeTab === tab.id ? 'text-slate-300' : 'text-slate-500'}`}>{tab.helper}</span>
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' ? <LoadingSpinner label="Updating dashboard" /> : null}
      {message ? <p className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">{message}</p> : null}

      {activeTab === 'generate' ? (
        <section className="glass-card rounded-[2rem] p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-violet-600">Developer access</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Generate API key</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              This is only for people who want to use VideoDL API on their own website/app. Normal visitors can download from the homepage without any key.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <div>
              <label className="text-sm font-bold text-slate-700" htmlFor="email">Developer email</label>
              <input
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700" htmlFor="key-name">Key label</label>
              <input
                id="key-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My website key"
                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>
            <button
              type="button"
              onClick={generateKey}
              disabled={status !== 'idle'}
              className="pulse-button h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 font-bold text-white disabled:opacity-70"
            >
              Generate Key
            </button>
          </div>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">Free developer keys are valid for 24 hours and unlimited during that period.</p>
        </section>
      ) : null}

      {activeTab === 'keys' ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {generatedKeys.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 lg:col-span-2">No API keys saved in this browser yet. Open the Generate tab to create one.</div>
          ) : (
            generatedKeys.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-[2rem] bg-white p-4 shadow-soft ring-1 ring-slate-200">
                <ApiKeyCard label={item.name} apiKey={item.key} />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setApiKey(item.key)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">Select for usage</button>
                  <button type="button" onClick={() => navigator.clipboard.writeText(item.key)} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">Copy</button>
                  <button type="button" onClick={() => revoke(item.id, item.key)} className="rounded-full bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">Revoke</button>
                </div>
                <p className="text-xs text-slate-500">Expires: {item.expiresAt ? new Date(item.expiresAt).toLocaleString() : 'Never'}</p>
              </div>
            ))
          )}
        </section>
      ) : null}

      {activeTab === 'usage' ? (
        <section id="usage" className="glass-card rounded-[2rem] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-600">Analytics</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Developer API usage</h2>
              <p className="mt-1 text-sm text-slate-500">Usage tracking applies to API-key integrations, not normal homepage downloads.</p>
            </div>
            <button type="button" onClick={loadUsage} disabled={status !== 'idle'} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-70">Refresh usage</button>
          </div>
          {usage ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Today</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{usage.today?.used ?? 0}</p>
                <p className="text-sm text-slate-500">Remaining: {String(usage.today?.remaining ?? 'n/a')}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">This month</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{usage.month?.requests ?? 0}</p>
                <p className="text-sm text-slate-500">Requests</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Total</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{usage.total?.requests ?? 0}</p>
                <p className="text-sm text-slate-500">Requests</p>
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Select a key from the API Keys tab, then refresh usage.</p>
          )}
        </section>
      ) : null}

      {activeTab === 'docs' ? (
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-300">Developer fetch</p>
            <pre className="mt-4 overflow-x-auto text-sm leading-7"><code>{`const res = await fetch('https://videodl-qzz.onrender.com/api/v1/info?url=' + encodeURIComponent(videoUrl), {
  headers: { 'X-API-Key': 'vdl_live_xxx' }
});
const { data } = await res.json();`}</code></pre>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-600">Important</p>
            <h3 className="mt-3 text-2xl font-black text-slate-950">Website vs API</h3>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
              <li>✓ Homepage downloads: no key required.</li>
              <li>✓ Your own website/app: use /api/v1 with X-API-Key.</li>
              <li>✓ Keys are free, unlimited, and valid for 24 hours.</li>
              <li>✓ Use only for authorized content.</li>
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
