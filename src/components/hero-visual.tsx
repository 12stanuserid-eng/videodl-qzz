'use client';

import dynamic from 'next/dynamic';

const ThreeDownloadIcon = dynamic(() => import('./three-download-icon'), {
  ssr: false,
  loading: () => <div className="h-[280px] w-full animate-pulse rounded-[2rem] bg-gradient-to-br from-blue-50 to-violet-50 sm:h-[360px]" />
});

export function HeroVisual() {
  return (
    <div className="relative animate-float rounded-[2.5rem] border border-slate-200 bg-white p-4 shadow-soft">
      <div className="absolute -inset-5 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-200/60 via-violet-200/60 to-pink-100 blur-3xl" />
      <ThreeDownloadIcon />
      <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-white/80 p-4 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          <span>yt-dlp core</span>
          <span>FFmpeg ready</span>
        </div>
      </div>
    </div>
  );
}
