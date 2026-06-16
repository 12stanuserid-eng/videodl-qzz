'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ApiKeyCard } from './api-key-card';
import { LoadingSpinner } from './loading-spinner';

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

export function DashboardClient() {
  const { email, setEmail, apiKey, setApiKey, generatedKeys, addGeneratedKey, removeGeneratedKey } = useAppStore();
  const [name, setName] = useState('Free 24h key');
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
      setMessage('Free 24h unlimited API key generated. Save it securely — raw keys are shown only once by the API.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setStatus('idle');
    }
  }

  async function loadUsage() {
    setMessage('');
    setUsage(null);
    if (!apiKey) return setMessage('Paste or select an API key first.');
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
      <section className="glass-card rounded-[2rem] p-5 sm:p-7">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <label className="text-sm font-bold text-slate-700" htmlFor="email">Account email</label>
            <input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700" htmlFor="key-name">Key name</label>
            <input
              id="key-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Free 24h key"
              className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
          <button
            type="button"
            onClick={generateKey}
            disabled={status !== 'idle'}
            className="pulse-button h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 font-bold text-white disabled:opacity-70"
          >
            Generate Free 24h Key
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-500">Demo mode uses email-only dashboard auth for local development. Disable ALLOW_DEMO_AUTH in production and connect a real auth provider.</p>
      </section>

      {status === 'loading' ? <LoadingSpinner label="Updating dashboard" /> : null}
      {message ? <p className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">{message}</p> : null}

      <section className="grid gap-5 lg:grid-cols-2">
        {generatedKeys.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No local keys yet. Generate your first free 24h unlimited key.</div>
        ) : (
          generatedKeys.map((item) => (
            <div key={item.id} className="grid gap-3">
              <ApiKeyCard label={item.name} apiKey={item.key} />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setApiKey(item.key)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white">Use key</button>
                <button type="button" onClick={() => navigator.clipboard.writeText(item.key)} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700">Copy</button>
                <button type="button" onClick={() => revoke(item.id, item.key)} className="rounded-full bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">Revoke</button>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="glass-card rounded-[2rem] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Usage analytics</h2>
            <p className="mt-1 text-sm text-slate-500">Daily, monthly and total request tracking per API key.</p>
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
        ) : null}
      </section>
    </div>
  );
}
