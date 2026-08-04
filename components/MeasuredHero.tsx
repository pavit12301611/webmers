'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';

export default function MeasuredHero() {
  return (
    <section className="relative h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] rounded-[3.5rem] overflow-hidden ring-1 ring-[#7bb5cc]/30 shadow-[0_20px_60px_rgba(123,181,204,0.18),0_8px_24px_rgba(123,181,204,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] w-full">
      {/* 50% #7BB5CC — dominant blue layer (half height) */}
      <div
        className="absolute top-0 left-0 right-0 h-[50%] z-0"
        style={{
          background: 'linear-gradient(180deg, #7bb5cc 0%, #6aa3b8 60%, #5d8fa6 100%)',
          boxShadow: 'inset 0 -8px 30px rgba(123,181,204,0.15)',
        }}
      />

      {/* 40% #F3EFE8 — cream layer (middle 40% height, overlapping) */}
      <div
        className="absolute top-[35%] left-0 right-0 h-[55%] rounded-[3.5rem] z-[1] mx-2 md:mx-4"
        style={{
          background: 'linear-gradient(170deg, #f3efe8 0%, #efeadd 40%, #ece5d8 100%)',
          boxShadow: '0 16px 48px rgba(123,181,204,0.1), 0 6px 20px rgba(123,181,204,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      />

      {/* 10% #1F3D47 — dark accent stripe at very bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[10%] z-[2]"
        style={{
          background: 'linear-gradient(0deg, #1f3d47 0%, #1f3d47 40%, rgba(31,61,71,0.08) 100%)',
        }}
      />
      {/* Small dark decorative circles (part of 10%) */}
      <div className="absolute bottom-8 right-10 w-3 h-3 rounded-full bg-[#1f3d47]/30 z-[3] shadow-[0_2px_6px_rgba(31,61,71,0.2)]" />
      <div className="absolute bottom-24 left-8 w-2 h-2 rounded-full bg-[#1f3d47]/25 z-[3] shadow-[0_2px_6px_rgba(31,61,71,0.18)]" />
      <div className="absolute bottom-40 right-28 w-2.5 h-2.5 rounded-full bg-[#1f3d47]/28 z-[3] shadow-[0_2px_6px_rgba(31,61,71,0.2)]" />

      {/* Navigation Bar inside Hero */}
      <div className="absolute top-0 left-0 right-0 z-40 px-6 py-5 md:px-12 md:py-6">
        <Header hero />
      </div>

      {/* Hero Content — centered, sitting on blue + cream overlap */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center h-full max-w-3xl mx-auto px-6 pt-24 pointer-events-auto">
        {/* Dark 10% accent tag pill */}
        <span
          className="inline-flex items-center gap-2 rounded-full border border-[#1f3d47]/20 bg-[#1f3d47]/[0.08] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#1f3d47] mb-5 shadow-[0_2px_8px_rgba(31,61,71,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#1f3d47]/70" />
          Gear for every journey
        </span>

        <h1 className="font-heading font-medium text-5xl sm:text-6xl lg:text-[5.8rem] leading-[0.92] tracking-tight text-[#1f3d47] drop-shadow-[0_3px_18px_rgba(123,181,204,0.18),0_1px_8px_rgba(31,61,71,0.08)]">
          EXPLORE UNCHARTED <br />
          <span className="text-[#7bb5cc]/85">TERRITORIES</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl max-w-lg text-[#1f3d47]/75 leading-[1.7] font-body">
          Launch-ready websites and premium digital gear precision-built for your next venture.
        </p>

        {/* CTA button — dark 10% accent */}
        <Link
          href="/marketplace"
          className="mt-8 inline-block rounded-full bg-[#1f3d47] text-[#f3efe8] uppercase tracking-[0.15em] px-10 py-4 text-sm font-extrabold shadow-[0_10px_32px_rgba(31,61,71,0.28),0_4px_12px_rgba(31,61,71,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(31,61,71,0.35),0_6px_16px_rgba(31,61,71,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-350"
        >
          Explore category
        </Link>
      </div>

      {/* 40% Cream Card — bottom-right cutout with clay depth */}
      <div
        className="absolute bottom-0 right-0 z-30 w-[320px] md:w-[390px] rounded-tl-[3.5rem] backdrop-blur-xl overflow-hidden shadow-[-12px_-12px_50px_rgba(123,181,204,0.18),0_8px_28px_rgba(123,181,204,0.1),inset_0_1px_0_rgba(255,255,255,0.75)]"
        style={{
          background: 'linear-gradient(160deg, #f3efe8 0%, #ece8de 55%, #e3dbce 100%)',
          borderTopLeftRadius: '3.5rem',
        }}
      >
        {/* Corner blend 1 */}
        <div
          className="absolute bottom-full right-0 w-14 h-14 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0 0, transparent 56px, #f3efe8 56px)',
          }}
        />
        {/* Corner blend 2 */}
        <div
          className="absolute bottom-0 right-full w-14 h-14 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0 0, transparent 56px, #f3efe8 56px)',
          }}
        />

        <div className="pt-9 pl-11 pb-9 pr-11">
          <div className="flex items-center gap-6">
            <div className="text-left">
              <div className="text-[1.35rem] font-heading font-bold text-[#1f3d47] leading-[1.1] tracking-tight">
                Shop Now
              </div>
              <div className="mt-1.5 text-sm text-[#7bb5cc]/90 font-body font-medium">
                Explore category &gt;
              </div>
            </div>

            {/* Dark 10% accent circle */}
            <Link
              href="/marketplace"
              aria-label="Shop now"
              className="w-16 h-16 rounded-full flex items-center justify-center bg-[#1f3d47] text-[#f3efe8] shadow-[0_8px_24px_rgba(31,61,71,0.28),0_3px_10px_rgba(31,61,71,0.18),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(31,61,71,0.35),0_5px_14px_rgba(31,61,71,0.22)] transition-all duration-300 shrink-0"
            >
              <ArrowUpRight size={24} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
