import { Footer } from '@/components/footer';
import { PricingCards } from '@/components/pricing-cards';
import { SiteHeader } from '@/components/site-header';

export const metadata = {
  title: 'Free Access'
};

export default function PricingPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.26em] text-violet-600">Free access</p>
          <h1 className="mt-3 text-5xl font-black text-slate-950">No payment. Unlimited for 1 day.</h1>
          <p className="mt-5 text-lg text-slate-600">The platform is fully free and ad-supported. Generate a free API key that works for 24 hours with unlimited requests.</p>
        </div>
        <div className="mt-12">
          <PricingCards />
        </div>
      </section>
      <Footer />
    </main>
  );
}
