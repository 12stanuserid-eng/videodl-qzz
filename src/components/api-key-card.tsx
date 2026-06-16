'use client';

import { useState } from 'react';

export function ApiKeyCard({ label, apiKey }: { label: string; apiKey: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="perspective-1000 h-36">
      <button
        type="button"
        onClick={() => setRevealed((value) => !value)}
        className={`flip-inner relative h-full w-full rounded-[2rem] text-left shadow-soft ${revealed ? 'is-flipped' : ''}`}
        aria-label="Reveal API key"
      >
        <div className="flip-face absolute inset-0 rounded-[2rem] border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-4 text-lg font-black text-slate-950">••••••••••••••••••••</p>
          <p className="mt-3 text-sm text-slate-500">Click to reveal key</p>
        </div>
        <div className="flip-face flip-back absolute inset-0 rounded-[2rem] border border-violet-200 bg-gradient-to-br from-blue-50 to-violet-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">API key</p>
          <p className="mt-4 break-all font-mono text-sm font-bold text-slate-950">{apiKey}</p>
          <p className="mt-3 text-sm text-slate-500">Click again to hide</p>
        </div>
      </button>
    </div>
  );
}
