'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';

export default function MeasuredHero() {
  return (
    <section className="relative h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] rounded-[3rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_16px_48px_rgba(143,113,80,0.15),0_6px_20px_rgba(143,113,80,0.08),inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-white/30 bg-gradient-to-b from-[#7bb5cc]/20 via-[#d0e4ec]/30 to-[#f3efe8] w-full">
      {/* 1. Navigation Bar (Absolute Positioned inside Hero) */}
      <Header hero />

      {/* 2. Hero Section Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center h-full max-w-3xl mx-auto px-4 pointer-events-auto">
        <span className="text-sm font-bold uppercase tracking-[0.25em] text-wander-dark mb-4">
          Gear for every journey
        </span>
        <h1 className="font-heading font-medium text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-wander-dark">
          EXPLORE UNCHARTED TERRITORIES
        </h1>
        <p className="mt-4 text-lg sm:text-xl max-w-md text-wander-text/90 leading-relaxed font-body">
          Launch-ready websites and premium digital gear precision-built for your next venture.
        </p>
        <Link
          href="/marketplace"
          className="mt-8 inline-block rounded-full border-2 border-wander-dark/20 bg-gradient-to-b from-white/90 to-[#faf8f4] text-wander-dark uppercase tracking-wider px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-gradient-to-b hover:from-white hover:to-[#f6f0e8] hover:border-wander-dark/30 hover:-translate-y-0.5 shadow-[0_6px_18px_rgba(143,113,80,0.1),0_2px_6px_rgba(143,113,80,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-300"
        >
          EXPLORE CATEGORY
        </Link>
      </div>

      {/* 3. "Shop Now" Inverted Cutout (Bottom Right) */}
      <div className="absolute bottom-0 right-0 z-30 bg-gradient-to-br from-[#faf6f0] to-[#f6f0e8] rounded-tl-[3rem] pt-8 pl-10 pb-8 pr-10 shadow-[-8px_-8px_30px_rgba(143,113,80,0.1),0_4px_15px_rgba(143,113,80,0.06)] border border-r-0 border-b-0 border-t-white/40 border-l-white/40 backdrop-blur-sm">
        {/* Corner 1 (top junction): absolute bottom-full right-0 */}
        <div
          className="absolute bottom-full right-0 w-10 h-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0 0, transparent 40px, #f3efe8 40px)',
          }}
        />
        {/* Corner 2 (left junction): absolute bottom-0 right-full */}
        <div
          className="absolute bottom-0 right-full w-10 h-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0 0, transparent 40px, #f3efe8 40px)',
          }}
        />

        <div className="flex items-center gap-6">
          <div className="text-left">
            <div className="text-lg font-medium text-wander-dark font-heading leading-snug">
              Shop Now
            </div>
            <div className="text-sm text-wander-dark/60 font-body">
              Explore category &gt;
            </div>
          </div>
          <Link
            href="/marketplace"
            aria-label="Shop now"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors duration-200"
          >
            <ArrowUpRight size={22} className="text-wander-dark" />
          </Link>
        </div>
      </div>
    </section>
  );
}
