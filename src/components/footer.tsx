import Link from 'next/link';
import { AdSlot } from './ad-slot';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot label="Footer Ad Slot" size="728x90" />
        <div className="mt-10 flex flex-col justify-between gap-6 text-sm text-slate-500 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME || 'VidSaaS'}. Use only for content you own or have rights to download.</p>
          <div className="flex gap-5">
            <Link href="/docs" className="hover:text-slate-950">Docs</Link>
            <Link href="/pricing" className="hover:text-slate-950">Free Access</Link>
            <a href="https://github.com/DigitalPlatDev/FreeDomain" className="hover:text-slate-950" target="_blank" rel="noreferrer">FreeDomain</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
