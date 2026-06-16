import Link from 'next/link';
import { MenuButton } from './menu-button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <MenuButton />
          <Link href="/" className="flex items-center gap-3 font-bold text-slate-950">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-glow">↓</span>
            <span>{process.env.NEXT_PUBLIC_APP_NAME || 'VideoDL'}</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          <Link href="/#download" className="hover:text-slate-950">Downloader</Link>
          <Link href="/dashboard" className="hover:text-slate-950">API Keys</Link>
          <Link href="/docs" className="hover:text-slate-950">Docs</Link>
          <Link href="/pricing" className="hover:text-slate-950">Free Access</Link>
        </nav>
        <Link href="/#download" className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 sm:px-5">
          Free Download
        </Link>
      </div>
    </header>
  );
}
