'use client';

import Link from 'next/link';
import { useState } from 'react';

const tabs = [
  {
    id: 'download',
    label: 'Download',
    title: 'Website downloader',
    text: 'Visitors can paste a video URL and download video/audio directly. No API key is required on this website.',
    href: '/#download',
    cta: 'Open downloader'
  },
  {
    id: 'apikey',
    label: 'API Key',
    title: 'Developer API keys',
    text: 'API keys are only for developers who want to use the downloader API inside their own website, app, bot, or automation.',
    href: '/dashboard',
    cta: 'Generate API key'
  },
  {
    id: 'docs',
    label: 'Docs',
    title: 'API documentation',
    text: 'Use /api/v1 endpoints with X-API-Key for developer integrations. Public website endpoints are kept separate.',
    href: '/docs',
    cta: 'Read API docs'
  },
  {
    id: 'usage',
    label: 'Usage',
    title: 'Usage dashboard',
    text: 'Track today, monthly, and total developer API usage from your dashboard. Keys are free for 24 hours.',
    href: '/dashboard#usage',
    cta: 'View usage'
  }
];

export function MenuButton() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((tab) => tab.id === active) || tabs[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
        aria-label="Open menu"
      >
        <span className="grid gap-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-slate-950" />
          <span className="block h-0.5 w-5 rounded-full bg-slate-950" />
          <span className="block h-0.5 w-5 rounded-full bg-slate-950" />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close menu overlay" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 h-full w-full max-w-md overflow-y-auto border-r border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">Menu</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">VideoDL Control</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-xl font-black text-slate-700 transition hover:bg-slate-200" aria-label="Close menu">
                ×
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-[1.5rem] bg-slate-100 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={`rounded-2xl px-3 py-3 text-sm font-black transition ${active === tab.id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-soft">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-violet-600">{current.label}</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">{current.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{current.text}</p>
              <Link onClick={() => setOpen(false)} href={current.href} className="pulse-button mt-6 inline-flex rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-black text-white">
                {current.cta}
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              <Link onClick={() => setOpen(false)} href="/#download" className="rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-700 transition hover:bg-slate-50">Free website downloader</Link>
              <Link onClick={() => setOpen(false)} href="/dashboard" className="rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-700 transition hover:bg-slate-50">Developer API key dashboard</Link>
              <Link onClick={() => setOpen(false)} href="/docs" className="rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-700 transition hover:bg-slate-50">API documentation</Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
