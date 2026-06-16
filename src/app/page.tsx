import Link from 'next/link';
import { AdSlot } from '@/components/ad-slot';
import { DownloadWidget } from '@/components/download-widget';
import { Footer } from '@/components/footer';
import { HeroVisual } from '@/components/hero-visual';
import { PricingCards } from '@/components/pricing-cards';
import { SiteHeader } from '@/components/site-header';
import { TiltCard } from '@/components/tilt-card';

const features = [
  ['Multi-platform', 'YouTube, Facebook, Instagram, TikTok, Twitter/X, Vimeo, Dailymotion, Twitch and more via yt-dlp.'],
  ['Developer API keys', 'Homepage downloads need no key. API keys are only for developers embedding VideoDL in their own websites/apps.'],
  ['Smooth SPA experience', 'React + Zustand keeps downloader state stable through mobile rotation, tab switch and navigation.'],
  ['Ad-supported free model', 'Only 3 clean ad slots: top banner, in-content rectangle, and footer banner.'],
  ['FFmpeg ready', 'Docker image installs FFmpeg and yt-dlp for production video/audio processing.'],
  ['Compliance-first', 'Built-in URL validation and a rights-first UX foundation for responsible downloads.']
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <AdSlot label="Above Hero Fold Ad Slot" size="728x90" />
      </div>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-8 sm:px-6 md:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-14">
        <div>
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">yt-dlp + FFmpeg powered SaaS</p>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Free video & audio downloader with a <span className="gradient-text">developer API</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Visitors download free without any API key. Developers can generate free 24-hour API keys to use the same system on their own websites/apps.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#download" className="pulse-button rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-4 text-center font-bold text-white">Start free download</Link>
            <Link href="/dashboard" className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">Developer API key</Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {['No key for visitors', 'Free developer API', '3 clean ad slots'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-center text-xs font-black text-slate-600 shadow-sm backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
        <HeroVisual />
      </section>

      <section id="download" className="mx-auto max-w-5xl scroll-mt-28 px-4 pb-12 sm:px-6 lg:px-8">
        <DownloadWidget />
        <div className="mt-6">
          <AdSlot label="Below Download Button Ad Slot" size="300x250" />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.26em] text-violet-600">Features</p>
          <h2 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Clean, clear and built for real users.</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text]) => (
            <TiltCard key={title}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-xl text-white shadow-glow">↓</div>
              <h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.26em] text-blue-600">Free access</p>
            <h2 className="mt-3 text-4xl font-black text-slate-950">Free website downloads. Developer keys for integrations.</h2>
          </div>
          <Link href="/pricing" className="font-bold text-blue-700">See free access →</Link>
        </div>
        <PricingCards />
      </section>

      <Footer />
    </main>
  );
}
