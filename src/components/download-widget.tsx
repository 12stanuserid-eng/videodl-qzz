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
  formats?: Array<{ formatId?: string; ext?: string; resolution?: string; note?: string; filesize?: number }>;
};

async function getErrorMessage(response: Response) {
  try {
    const data = await response.json();
    return data?.error?.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

function conciseError(message: string) {
  if (/terabox/i.test(message)) {
    return 'TeraBox link could not be resolved. Use a valid public file share link. Some TeraBox links require verification/login cookies and cannot be downloaded anonymously.';
  }
  if (/unsupported url/i.test(message)) {
    return 'This URL is not supported yet or the platform is blocking server-side downloads. Try a public video link from a supported platform.';
  }
  if (/restricted|private|unavailable|blocked|login|sign in/i.test(message)) {
    return 'This video is restricted, private, unavailable, or blocked by the source platform.';
  }
  return message.replace(/Details:.*/i, '').slice(0, 220);
}

export function DownloadWidget() {
  const { url, setUrl, mode, setMode } = useAppStore();
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'downloading'>('idle');
  const [message, setMessage] = useState('');

  async function fetchInfo() {
    setMessage('');
    setInfo(null);
    if (!url) return setMessage('Paste a public video URL first.');

    setStatus('loading');
    try {
      const response = await fetch(`/api/public/info?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const payload = await response.json();
      setInfo(payload.data);
    } catch (error) {
      setMessage(conciseError((error as Error).message));
    } finally {
      setStatus('idle');
    }
  }

  async function download() {
    setMessage('');
    if (!url) return setMessage('Paste a public video URL first.');

    setStatus('downloading');
    try {
      const endpoint = mode === 'audio' ? '/api/public/download/audio' : '/api/public/download';
      const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('The source platform returned no downloadable data. Try another public video URL.');
      }
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = mode === 'audio' ? 'audio.m4a' : 'video.mp4';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setMessage(conciseError((error as Error).message));
    } finally {
      setStatus('idle');
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_100px_rgba(15,23,42,0.10)] sm:p-6 lg:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Free downloader</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">Paste link to download</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">No API key required for this website.</p>
        </div>
        <Link href="/dashboard" className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-600 transition hover:bg-white sm:inline-flex">
          API for developers
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-black text-slate-800" htmlFor="video-url">Video or file URL</label>
          <input
            id="video-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste YouTube, Instagram, TikTok, TeraBox, Vimeo..."
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-[1.35rem] bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setMode('video')}
            className={`rounded-2xl px-4 py-3 text-sm font-black transition ${mode === 'video' ? 'bg-slate-950 text-white shadow-soft' : 'text-slate-500 hover:text-slate-950'}`}
          >
            Video
          </button>
          <button
            type="button"
            onClick={() => setMode('audio')}
            className={`rounded-2xl px-4 py-3 text-sm font-black transition ${mode === 'audio' ? 'bg-slate-950 text-white shadow-soft' : 'text-slate-500 hover:text-slate-950'}`}
          >
            Audio
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <button type="button" onClick={download} disabled={status !== 'idle'} className="pulse-button rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-70">
            {status === 'downloading' ? 'Preparing...' : `Download ${mode === 'audio' ? 'Audio' : 'Video'}`}
          </button>
          <button type="button" onClick={fetchInfo} disabled={status !== 'idle'} className="rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-70">
            Preview
          </button>
        </div>
      </div>

      {status === 'loading' ? <div className="mt-5"><LoadingSpinner label="Checking link" /></div> : null}
      {message ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
          {message}
        </div>
      ) : null}
      {info ? (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Link preview</p>
          <h3 className="mt-2 line-clamp-2 text-lg font-black text-slate-950">{info.title || 'Untitled video'}</h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
            <span>{info.uploader || 'Source detected'}</span>
            <span>{info.durationString || 'Duration n/a'}</span>
            <span>{info.extractor || 'Extractor n/a'}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500 sm:grid-cols-3">
        <span>✓ Public links only</span>
        <span>✓ No visitor API key</span>
        <span>✓ Developer API separate</span>
      </div>
    </div>
  );
}
