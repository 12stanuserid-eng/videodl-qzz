import { Footer } from '@/components/footer';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'API Documentation'
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';

const endpoints = [
  ['GET', '/api/v1/download?url=VIDEO_URL', 'Download video stream/file.'],
  ['GET', '/api/v1/download/audio?url=URL', 'Download audio-only stream/file.'],
  ['GET', '/api/v1/info?url=URL', 'Get metadata: title, duration, uploader, extractor and formats.'],
  ['GET', '/api/v1/usage', 'Check API key usage.'],
  ['POST', '/api/v1/api-keys/generate', 'Generate a new API key. Demo mode accepts email in JSON body.'],
  ['DELETE', '/api/v1/api-keys/:id/revoke', 'Revoke an API key in the same account.'],
  ['GET', '/api/v1/supported-sites', 'List supported yt-dlp extractors/platforms.']
];

export default function DocsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.26em] text-blue-600">REST API</p>
        <h1 className="mt-3 text-5xl font-black text-slate-950">Developer documentation</h1>
        <div className="mt-6 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><h2 className="font-black">Clear rule</h2><p className="mt-1 text-sm leading-6">This website downloader works without an API key. API keys are required only when a developer uses VideoDL on another website/app.</p></div>
        <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600">Base URL: <code className="rounded-lg bg-slate-100 px-2 py-1">{baseUrl}/api/v1</code>. Authenticate with <code className="rounded-lg bg-slate-100 px-2 py-1">X-API-Key: your_api_key</code>. No payment is required — generated keys are unlimited for 24 hours.</p>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          {endpoints.map(([method, path, description]) => (
            <div key={path} className="grid gap-3 border-b border-slate-100 p-5 last:border-b-0 md:grid-cols-[90px_1fr_1fr]">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-center text-xs font-black text-white">{method}</span>
              <code className="break-all text-sm font-bold text-slate-900">{path}</code>
              <p className="text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-300">cURL</p>
            <pre className="mt-4 overflow-x-auto text-sm leading-7"><code>{`curl -H "X-API-Key: vdl_live_xxx" \\
  "${baseUrl}/api/v1/info?url=https://example.com/video"`}</code></pre>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-600">JavaScript</p>
            <pre className="mt-4 overflow-x-auto text-sm leading-7 text-slate-800"><code>{`const res = await fetch('/api/v1/info?url=' + encodeURIComponent(url), {
  headers: { 'X-API-Key': apiKey }
});
const { data } = await res.json();`}</code></pre>
          </div>
        </div>

        <div className="mt-10 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h2 className="text-xl font-black">Compliance note</h2>
          <p className="mt-2 leading-7">Operate this service only for content users own, created, licensed, or are otherwise authorized to download. Do not use it to bypass DRM, access controls, paywalls, login-only content, or platform restrictions.</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
