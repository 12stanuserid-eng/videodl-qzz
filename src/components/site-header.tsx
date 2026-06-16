import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-bold text-slate-950">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-glow">↓</span>
          <span>{process.env.NEXT_PUBLIC_APP_NAME || 'VidSaaS'}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#features" className="hover:text-slate-950">Features</Link>
          <Link href="/pricing" className="hover:text-slate-950">Free Access</Link>
          <Link href="/docs" className="hover:text-slate-950">API Docs</Link>
          <Link href="/dashboard" className="hover:text-slate-950">Dashboard</Link>
        </nav>
        <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5">
          Get API Key
        </Link>
      </div>
    </header>
  );
}
