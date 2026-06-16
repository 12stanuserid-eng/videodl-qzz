import { PLANS } from '@/lib/plans';
import { TiltCard } from './tilt-card';

export function PricingCards() {
  const plan = PLANS.FREE;
  return (
    <div className="mx-auto max-w-3xl">
      <TiltCard className="border-blue-200 ring-4 ring-blue-100">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-3xl font-black text-slate-950">{plan.name}</h3>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">No payment</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">3 ads supported</span>
            </div>
            <div className="mt-6">
              <span className="text-5xl font-black text-slate-950">{plan.price}</span>
              <span className="text-slate-500"> / {plan.billing}</span>
            </div>
            <p className="mt-3 text-base font-semibold text-slate-600">Unlimited requests for one day. Renew by generating a fresh free key after expiry.</p>
            <ul className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2"><span className="text-blue-600">✓</span>{feature}</li>
              ))}
            </ul>
          </div>
          <a href="/dashboard" className="pulse-button rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-4 text-center font-bold text-white">
            Generate Free 24h Key
          </a>
        </div>
      </TiltCard>
    </div>
  );
}
