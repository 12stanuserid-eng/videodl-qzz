'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { LoadingSpinner } from './loading-spinner';

type VideoInfo = {
  title?: string;
  durationString?: string;
  uploader?: string;
  extractor?: string;
  formats?: Array<{ formatId?: string; ext?: string; resolution?: string; note?: string }>;
};

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();
    return data?.error?.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

export function DownloadWidget() {
  const { url, setUrl, mode, setMode } = useAppStore();
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'downloading'>('idle');
  const [message, setMessage] = useState('');

  async function fetchInfo() {
    setMessage('');
    setInfo(null);
    if (!url) return setMessage('Please paste a video URL first.');

    setStatus('loading');
    try {
      const response = await fetch(`/api/public/info?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const payload = await response.json();
      setInfo(payload.data);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setStatus('idle');
    }
  }

  async function download() {
    setMessage('');
    if (!url) return setMessage('Please paste a video URL first.');

    setStatus('downloading');
    try {
      const endpoint = mode === 'audio' ? '/api/public/download/audio' : '/api/public/download';
      const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = mode === 'audio' ? 'audio.m4a' : 'video.mp4';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div className="glass-card overflow-hidden rounded-[2.25rem] p-4 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-blue-600">Free website downloader</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Paste URL. Download instantly.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Website visitors do <strong>not</strong> need an API key. API keys are only for developers who want to use this system on their own websites/apps.
          </p>
        </div>
        <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-center text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm transition hover:bg-slate-50">
          Developer API key
        </Link>
      </div>

      <div className="grid gap-3">
        <label className="text-sm font-semibold text-slate-700" htmlFor="video-url">Video URL</label>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            id="video-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste YouTube, Instagram, TikTok, Vimeo... URL"
            className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
          <button type="button" onClick={fetchInfo} disabled={status !== 'idle'} className="h-14 rounded-2xl border border-slate-200 bg-white px-6 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-70">
            Get Info
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode('video')}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${mode === 'video' ? 'bg-slate-950 text-white shadow-soft' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Video MP4
          </button>
          <button
            type="button"
            onClick={() => setMode('audio')}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${mode === 'audio' ? 'bg-slate-950 text-white shadow-soft' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Audio M4A
          </button>
        </div>

        <button type="button" onClick={download} disabled={status !== 'idle'} className="pulse-button mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 text-lg font-black text-white disabled:cursor-not-allowed disabled:opacity-70">
          {status === 'downloading' ? 'Preparing download...' : `Free Download ${mode === 'audio' ? 'Audio' : 'Video'}`}
        </button>
      </div>

      {status === 'loading' ? <div className="mt-5"><LoadingSpinner label="Fetching metadata" /></div> : null}
      {message ? <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{message}</p> : null}
      {info ? (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">Metadata</p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">{info.title || 'Untitled video'}</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <span>{info.uploader || 'Unknown uploader'}</span>
            <span>{info.durationString || 'Duration n/a'}</span>
            <span>{info.extractor || 'Extractor n/a'}</span>
          </div>
        </div>
      ) : null}

      <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
        Use only for videos you own or have permission to download. For your own website/app integration, create a developer key from the menu or dashboard.
      </p>
    </div>
  );
}
