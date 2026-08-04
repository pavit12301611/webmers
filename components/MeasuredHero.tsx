'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';

export default function MeasuredHero() {
  return (
    <section className="relative h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] rounded-[3.5rem] overflow-hidden ring-1 ring-white/30 shadow-[0_20px_60px_rgba(143,113,80,0.18),0_8px_24px_rgba(143,113,80,0.1),inset_0_1px_0_rgba(255,255,255,0.5)] w-full">
      {/* 60% White / Light Cream Base — dominant background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffdf9] via-[#faf8f6] to-[#f6f2ec] z-0" />

      {/* 30% Cream / Clay Tan Layer — soft curved clay blob behind content */}
      <div
        className="absolute top-8 left-6 right-6 h-[68%] rounded-[3.5rem] z-[1]"
        style={{
          background: 'linear-gradient(160deg, rgba(240,235,228,0.85) 0%, rgba(245,240,232,0.6) 50%, rgba(235,229,220,0.35) 100%)',
          boxShadow: 'inset 0 2px 20px rgba(143,113,80,0.06), 0 12px 40px rgba(143,113,80,0.08), 0 4px 14px rgba(143,113,80,0.05)',
        }}
      />

      {/* 10% Dark / Deep Accent — thin clay shadow stripe + accent dots */}
      <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-t from-[#2a3b45]/[0.07] via-[#2a3b45]/[0.04] to-transparent z-[2]" />
      <div className="absolute top-10 right-16 w-3 h-3 rounded-full bg-[#2a3b45]/20 z-[2] shadow-[0_2px_8px_rgba(43,59,69,0.15)]" />
      <div className="absolute bottom-32 left-12 w-2 h-2 rounded-full bg-[#2a3b45]/15 z-[2] shadow-[0_2px_6px_rgba(43,59,69,0.12)]" />
      <div className="absolute top-32 left-20 w-2.5 h-2.5 rounded-full bg-[#2a3b45]/18 z-[2] shadow-[0_2px_8px_rgba(43,59,69,0.14)]" />

      {/* Navigation Bar inside Hero */}
      <div className="absolute top-0 left-0 right-0 z-40 px-6 py-5 md:px-12 md:py-6">
        <Header hero />
      </div>

      {/* Hero Content — sits inside the 30% cream layer area */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center h-full max-w-3xl mx-auto px-6 pt-20 pointer-events-auto">
        {/* 10% Dark accent tag pill */}
        <span
          className="inline-flex items-center gap-2 rounded-full border border-[#2a3b45]/15 bg-[#2a3b45]/[0.06] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#2a3b45] mb-5 shadow-[0_2px_6px_rgba(43,59,69,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#2a3b45]/60" />
          Gear for every journey
        </span>

        <h1 className="font-heading font-medium text-5xl sm:text-6xl lg:text-[5.5rem] leading-[0.95] tracking-tight text-[#1f3d47] drop-shadow-[0_2px_14px_rgba(143,113,80,0.08)]">
          EXPLORE UNCHARTED <br />
          <span className="text-[#2a3b45]/80">TERRITORIES</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl max-w-lg text-[#2a3b45]/70 leading-[1.7] font-body">
          Launch-ready websites and premium digital gear precision-built for your next venture.
        </p>

        {/* Primary CTA — dark accent button with clay shadow */}
        <Link
          href="/marketplace"
          className="mt-8 inline-block rounded-full bg-gradient-to-b from-[#2a3b45] to-[#1f3d47] text-[#fffdf9] uppercase tracking-[0.15em] px-10 py-4 text-sm font-extrabold shadow-[0_10px_32px_rgba(43,59,69,0.22),0_4px_12px_rgba(43,59,69,0.14),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(43,59,69,0.28),0_6px_16px_rgba(43,59,69,0.18),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-350"
        >
          Explore category
        </Link>
      </div>

      {/* 30% Cream / Clay Tan — bottom-right cutout card */}
      <div
        className="absolute bottom-0 right-0 z-30 w-[320px] md:w-[380px] rounded-tl-[3.5rem] backdrop-blur-xl overflow-hidden shadow-[-10px_-10px_40px_rgba(143,113,80,0.12),0_6px_20px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]"
        style={{
          background: 'linear-gradient(160deg, rgba(245,240,232,0.92) 0%, rgba(240,235,228,0.88) 50%, rgba(235,229,220,0.82) 100%)',
          borderTopLeftRadius: '3.5rem',
        }}
      >
        {/* Corner 1 (top junction) — cream blend */}
        <div
          className="absolute bottom-full right-0 w-12 h-12 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0 0, transparent 48px, rgba(245,240,232,0.92) 48px)',
          }}
        />
        {/* Corner 2 (left junction) */}
        <div
          className="absolute bottom-0 right-full w-12 h-12 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0 0, transparent 48px, rgba(245,240,232,0.92) 48px)',
          }}
        />

        <div className="pt-8 pl-10 pb-8 pr-10">
          <div className="flex items-center gap-5">
            <div className="text-left">
              <div className="text-[1.35rem] font-heading font-semibold text-[#1f3d47] leading-[1.15] tracking-tight">
                Shop Now
              </div>
              <div className="mt-1 text-sm text-[#2a3b45]/60 font-body">
                Explore category &gt;
              </div>
            </div>

            {/* Dark 10% accent circle button */}
            <Link
              href="/marketplace"
              aria-label="Shop now"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-b from-[#2a3b45] to-[#1f3d47] text-[#fffdf9] shadow-[0_6px_18px_rgba(43,59,69,0.22),0_3px_8px_rgba(43,59,69,0.14),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(43,59,69,0.28),0_4px_12px_rgba(43,59,69,0.18)] transition-all duration-300 shrink-0"
            >
              <ArrowUpRight size={22} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
