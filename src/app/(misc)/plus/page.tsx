'use client';
import React from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';

type Plan = {

  name: string;
  price: string;
  priceNote?: string;
  bullets: { text: string; included: boolean }[];
  ctaText: string;
  featured?: boolean;
  onClick?: () => void;

};

export default function GeckoAIPlusPage() {

  const startBasic = () => alert('Basic is your current free plan.');
  const startPlus = () => alert('Replace with Stripe checkout call.');

  const plans: Plan[] = [
    {
      name: 'Basic',
      price: 'Free',
      bullets: [
        { text: '100 MB total cloud storage', included: true },
        { text: 'Priority support', included: false },
      ],
      ctaText: 'Your Plan',
      onClick: startBasic,
    },
    {
      name: 'GeckoAI Plus',
      price: 'CA$0.99',
      priceNote: 'one-time • 80% off CA$4.99',
      bullets: [
        { text: 'Unlimited Cloud Storage', included: true },
        { text: 'Faster uploads & parsing', included: true },
        { text: 'Priority support', included: true },
      ],
      ctaText: 'Upgrade for CA$0.99',
      featured: true,
      onClick: startPlus,
    },
  ];

  return (

    <div className="overflow-hidden bg-[#131112] text-ghost relative">

      <header className="relative z-10">

        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3">

            <img
              src="/logoAnimated.svg"
              alt="GeckoAI"
              draggable={false}
              className="h-17 w-17 drop-shadow"
            />

            <span className="text-6xl font-extrabold tracking-tighter text-asparagus">GeckoAI</span>

          </Link>

          <nav className="flex items-center gap-4">

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-broccoli text-night hover:bg-night hover:text-broccoli px-10 py-3 text-xl font-bold tracking-tighter transition"
            >

              Log In

            </Link>

          </nav>

        </div>

      </header>

      <main className="relative z-10 h-[calc(100vh-64px)]">

        <div className="mx-auto h-full max-w-7xl px-4">

          <div className="h-full grid grid-rows-[auto,1fr] md:grid-cols-2 md:grid-rows-1 gap-8 items-center">

            <div className="max-w-xl">

              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">

                Unlock more with{' '}

                <span className="bg-[linear-gradient(135deg,#698f3f_0%,#384f1f_100%)] bg-clip-text text-transparent">

                  GeckoAI Plus

                </span>

              </h1>

              <p className="mt-4 text-base md:text-lg text-white/80">

                One small upgrade. Big freedom —{' '}
                <span className="font-semibold text-ghost">Unlimited Cloud Storage</span> for all
                your outlines, PDFs, and study files. <br />No subscriptions. One time.

              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs md:text-sm text-white/70">

                <Chip>One-time purchase</Chip>
                <Chip>80% launch discount</Chip>
                <Chip>Unreal Experience</Chip>

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {plans.map((p) => (

                <PlanCard key={p.name} plan={p} />

              ))}

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}

function PlanCard({ plan }: { plan: Plan }) {

  const green = '#698f3f';
  const deep = '#384f1f';

  return (
    <div
      className={[
        'relative rounded-2xl p-6 border shadow-xl',
        plan.featured
          ? 'border-neutral-800 bg-[rgba(105,143,63,0.08)]'
          : 'border-neutral-800 bg-[rgba(56,79,31,0.08)]',
      ].join(' ')}
      style={
        plan.featured
          ? {
              boxShadow:
                '0 10px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(247,247,255,0.06)',
            }
          : undefined
      }
    >
      {plan.featured && (
        <div
          className="absolute -top-3 left-5 rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ background: 'rgba(105,143,63,0.18)', color: '#d7f5b8', border: '1px solid #2b3a17' }}
        >
          Best Value
        </div>
      )}

      <div className="flex items-baseline justify-between">
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">{plan.name}</h3>
        <div className="text-right">
          <div className="text-xl md:text-2xl font-black">{plan.price}</div>
          {plan.priceNote && <div className="text-[11px] text-white/70">{plan.priceNote}</div>}
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {plan.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            {b.included ? (
              <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: green }} />
            ) : (
              <X className="mt-0.5 h-5 w-5 shrink-0 text-white/30" />
            )}
            <span className={b.included ? 'text-white/90' : 'text-white/50'}>{b.text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={plan.onClick}
        className="mt-6 w-full rounded-xl px-5 py-3 text-sm font-semibold transition"
        style={
          plan.featured
            ? { backgroundColor: green, color: '#0e0f0e' }
            : { backgroundColor: 'rgba(255,255,255,0.06)' }
        }
        onMouseEnter={(e) => {
          if (plan.featured) (e.currentTarget.style.backgroundColor = '#7cab4a');
          else (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)');
        }}
        onMouseLeave={(e) => {
          if (plan.featured) (e.currentTarget.style.backgroundColor = green);
          else (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)');
        }}
      >
        {plan.ctaText}
      </button>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-neutral-800 bg-[#1a1819] px-3 py-1">
      {children}
    </span>
  );
}

