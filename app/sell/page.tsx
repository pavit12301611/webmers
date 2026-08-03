import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Upload, BadgeCheck, Wallet, Sparkles, ShieldCheck, Globe2 } from 'lucide-react';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import Eyebrow from '@/components/Eyebrow';
import Reveal from '@/components/Reveal';
import GridPattern from '@/components/GridPattern';

export const metadata: Metadata = {
  title: 'Sell on Webmers',
  description: 'Turn your fully-built websites into income. List, get reviewed, and get paid on Webmers.',
};

const steps = [
  { n: '01', title: 'List your site', desc: 'Upload your website with screenshots, tech stack and a clear description. Our team reviews every submission for quality.' },
  { n: '02', title: 'Get reviewed', desc: 'We verify the build, check the demo, and publish it to the marketplace once it meets our measured standard.' },
  { n: '03', title: 'Get paid', desc: 'Buyers purchase through protected checkout. Funds are released after the satisfaction window — no chasing invoices.' },
];

const perks = [
  { icon: Wallet, title: 'Keep most of it', desc: 'A transparent 20% platform fee. The rest is your proceeds, paid out on completion.' },
  { icon: ShieldCheck, title: 'Protected checkout', desc: 'Escrow-style payments and a satisfaction window keep both sides safe.' },
  { icon: Sparkles, title: 'Visual editor buyers love', desc: 'Every sale includes the in-browser editor, raising the value of what you build.' },
  { icon: Globe2, title: 'Custom domains', desc: 'Buyers launch on their own domain, so your template reaches real audiences.' },
];

export default function SellPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <Header />

      <section className="relative px-6 pb-20 pt-36 md:px-10">
        <GridPattern id="sell-grid" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <Eyebrow icon={<Upload size={12} />}>Sell on Webmers</Eyebrow>
          </div>
          <h1 className="mt-5 text-balance text-5xl leading-[0.95] tracking-tight text-white md:text-7xl" style={{ fontFamily: 'var(--font-instrument)' }}>
            Turn your websites <span className="text-white/40">into income.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-8 text-white/45">
            Webmers is the premium marketplace for fully-built websites. List what you&apos;ve already built, reach buyers who want to launch fast, and get paid — measured and protected.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Become a seller <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard/seller"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-7 py-3.5 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
            >
              Seller dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20 md:px-10">
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <Eyebrow>How selling works</Eyebrow>
              <h2 className="mt-4 text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-5xl" style={{ fontFamily: 'var(--font-instrument)' }}>
                Three steps to your first sale.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((item, i) => (
              <Reveal key={item.n} delay={i * 90}>
                <div className="h-full rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-7 backdrop-blur-xl">
                  <div className="mb-8 font-instrument text-5xl text-white/[0.08]">{item.n}</div>
                  <h3 className="mb-3 text-xl font-medium tracking-tight text-white md:text-2xl">{item.title}</h3>
                  <p className="text-[14px] leading-6 text-white/45">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-20 md:px-10">
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <Eyebrow icon={<BadgeCheck size={12} />}>Why sellers choose us</Eyebrow>
              <h2 className="mt-4 text-balance text-4xl leading-[0.95] tracking-tight text-white md:text-5xl" style={{ fontFamily: 'var(--font-instrument)' }}>
                Built to pay creators fairly.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {perks.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 70}>
                  <div className="h-full rounded-[1.5rem] border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-xl">
                    <Icon className="mb-5 text-white/40" size={22} />
                    <h3 className="mb-2 text-[17px] font-medium text-white">{item.title}</h3>
                    <p className="text-[13px] leading-6 text-white/45">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative px-6 pb-28 md:px-10">
        <Reveal>
          <div className="mx-auto max-w-4xl rounded-[1.8rem] border border-white/[0.08] bg-white/[0.04] p-10 text-center backdrop-blur-xl md:p-14">
            <h2 className="text-3xl tracking-tight text-white md:text-5xl" style={{ fontFamily: 'var(--font-instrument)' }}>
              Ready to list your first site?
            </h2>
            <p className="mx-auto mb-8 mt-4 max-w-xl text-white/40">
              Create a free seller account and publish your website to thousands of buyers looking to launch.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Start selling <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
