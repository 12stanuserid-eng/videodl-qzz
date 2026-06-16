import { DashboardClient } from '@/components/dashboard-client';
import { Footer } from '@/components/footer';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Dashboard'
};

export default function DashboardPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.26em] text-blue-600">Dashboard</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">Free 24h API key & usage</h1>
        <p className="mt-4 max-w-2xl text-slate-600">Generate a free unlimited API key valid for one day, reveal/hide it with a 3D flip card, revoke it, and track usage.</p>
        <div className="mt-8">
          <DashboardClient />
        </div>
      </section>
      <Footer />
    </main>
  );
}
