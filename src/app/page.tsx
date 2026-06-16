import Link from 'next/link';
import { AdSlot } from '@/components/ad-slot';
import { DownloadWidget } from '@/components/download-widget';
import { Footer } from '@/components/footer';
import { PricingCards } from '@/components/pricing-cards';
import { SiteHeader } from '@/components/site-header';
import { TiltCard } from '@/components/tilt-card';

const platforms = ['YouTube', 'Instagram', 'TikTok', 'Facebook', 'Twitter/X', 'Vimeo', 'TeraBox*', 'Dailymotion'];

const features = [
  ['No key for visitors', 'People who use this website can download directly. API keys are only for developers integrating the API elsewhere.'],
  ['Developer API', 'Free 24-hour API keys for websites, apps, bots, and automation tools that call /api/v1 endpoints.'],
  ['Clean mobile UX', 'Download form appears immediately, with large touch targets, readable errors, and no confusing steps.'],
  ['yt-dlp + FFmpeg', 'Uses battle-tested extractors with FFmpeg support for video/audio handling on supported public URLs.'],
  ['TeraBox handling', 'Adds custom TeraBox share-link handling where public file metadata/direct links are available.'],
  ['Responsible downloads', 'Built for content you own or have permission to download; restricted/login-only links may fail.']
];

export default function HomePage() {
  return (
    <main className="bg-white">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_28rem),radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_26rem),#fff]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live free downloader
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              Download videos in seconds. <span className="gradient-text">No key needed.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Paste a public video URL and download video or audio. Developer API keys are separate for people using VideoDL inside their own website or app.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <span key={platform} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
                  {platform}
                </span>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/#download" className="rounded-2xl bg-slate-950 px-6 py-4 text-center text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5">
                Open downloader
              </Link>
              <Link href="/dashboard" className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50">
                Developer API key
              </Link>
            </div>
          </div>

          <div id="download" className="scroll-mt-28">
            <DownloadWidget />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdSlot label="Sponsored placement" size="728x90" />
      </div>

      <section id="features" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.26em] text-violet-600">Professional toolkit</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-slate-950 sm:text-5xl">Simple for users. Powerful for developers.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text]) => (
            <TiltCard key={title}>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-lg text-white shadow-soft">✓</div>
              <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.26em] text-blue-600">Free access</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.03em] text-slate-950">Website downloads are free. API keys are for integrations.</h2>
          </div>
          <Link href="/pricing" className="font-bold text-blue-700">View details →</Link>
        </div>
        <PricingCards />
      </section>

      <Footer />
    </main>
  );
}
