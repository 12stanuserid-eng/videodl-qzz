'use client';

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
  const { url, setUrl, apiKey, setApiKey, mode, setMode } = useAppStore();
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'downloading'>('idle');
  const [message, setMessage] = useState('');

  async function fetchInfo() {
    setMessage('');
    setInfo(null);
    if (!apiKey) return setMessage('Please paste or generate an API key first.');
    if (!url) return setMessage('Please paste a video URL.');

    setStatus('loading');
    try {
      const response = await fetch(`/api/v1/info?url=${encodeURIComponent(url)}`, {
        headers: { 'X-API-Key': apiKey }
      });
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
    if (!apiKey) return setMessage('Please paste or generate an API key first.');
    if (!url) return setMessage('Please paste a video URL.');

    setStatus('downloading');
    try {
      const endpoint = mode === 'audio' ? '/api/v1/download/audio' : '/api/v1/download';
      const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`, {
        headers: { 'X-API-Key': apiKey }
      });
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
    <div className="glass-card rounded-[2rem] p-4 sm:p-6">
      <div className="grid gap-3">
        <label className="text-sm font-semibold text-slate-700" htmlFor="video-url">Video URL</label>
        <input
          id="video-url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste YouTube, Instagram, TikTok, Vimeo... URL"
          className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
        <label className="mt-2 text-sm font-semibold text-slate-700" htmlFor="api-key">API Key</label>
        <input
          id="api-key"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="vdl_live_..."
          className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setMode('video')}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${mode === 'video' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Video
          </button>
          <button
            type="button"
            onClick={() => setMode('audio')}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${mode === 'audio' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Audio
          </button>
        </div>
        <div className="grid gap-3 pt-3 sm:grid-cols-[1fr_auto]">
          <button type="button" onClick={download} disabled={status !== 'idle'} className="pulse-button rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
            {status === 'downloading' ? 'Downloading...' : `Download ${mode}`}
          </button>
          <button type="button" onClick={fetchInfo} disabled={status !== 'idle'} className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-70">
            Get Info
          </button>
        </div>
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
    </div>
  );
}
