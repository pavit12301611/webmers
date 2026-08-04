'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import { useEffect, useRef } from 'react';

export default function MeasuredHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.25;
    }
  }, []);

  return (
    <section className="relative h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] rounded-[32px] md:rounded-[40px] overflow-hidden ring-1 ring-black/5 shadow-sm w-full bg-[#7bb5cc]">
      {/* Navigation Bar inside Hero */}
      <div className="absolute top-0 left-0 right-0 z-50 px-8 py-8 lg:px-16">
        <Header hero />
      </div>

      {/* Background Video */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-auto pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full md:w-auto h-auto max-w-none"
          style={{
            maskImage: 'radial-gradient(55% 100% at bottom, black 5%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(55% 100% at bottom, black 5%, transparent 90%)',
          }}
        >
          <source
            src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/travel_hike_bg_video_1.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Hero Content — centered, with negative top margin for optical lift */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center h-full max-w-3xl mx-auto px-6 -mt-22 pointer-events-auto">
        {/* Eyebrow Text */}
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1f3d47] mb-5 bg-[#f3efe8]/40 backdrop-blur-sm border border-[#1f3d47]/10 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1f3d47]/70" />
          Gear for every journey
        </span>

        {/* Main Headline */}
        <h1 className="font-heading font-medium text-4xl sm:text-5xl md:text-6xl lg:text-6xl leading-[1.05] tracking-tight text-[#1f3d47]">
          Explore Uncharted <br />
          <span className="text-[#1f3d47]/85">Territories</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base sm:text-lg md:max-w-md max-w-lg text-[#1f3d47]/90 leading-relaxed font-body">
          Launch-ready websites and premium digital gear precision-built for your next venture.
        </p>

        {/* CTA Button */}
        <Link
          href="/marketplace"
          className="mt-8 inline-block rounded-full bg-transparent border-2 border-[#1f3d47] text-[#1f3d47] uppercase tracking-[0.15em] px-10 py-4 text-sm font-bold transition-all hover:bg-[#1f3d47] hover:text-white"
        >
          Explore Category
        </Link>
      </div>

      {/* Bottom-right Shop Now Cutout */}
      <div className="absolute bottom-0 right-0 z-30 rounded-tl-[40px] bg-[#f3efe8] pt-8 pl-10 pr-10 pb-8">
        {/* Corner blend 1 - top junction */}
        <div
          className="absolute bottom-full right-0 w-10 h-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0 0, transparent 40px, #f3efe8 40px)',
          }}
        />
        {/* Corner blend 2 - left junction */}
        <div
          className="absolute bottom-0 right-full w-10 h-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 0 0, transparent 40px, #f3efe8 40px)',
          }}
        />

        <div className="flex items-center gap-6">
          <div className="text-left">
            <div className="text-lg font-medium text-[#1f3d47] leading-[1.1]">
              Shop Now
            </div>
            <div className="mt-1 text-sm text-[#1f3d47]/60 font-body">
              Explore category &gt;
            </div>
          </div>

          <Link
            href="/marketplace"
            aria-label="Shop now"
            className="w-12 h-12 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors shrink-0"
          >
            <ArrowUpRight size={20} className="text-[#1f3d47]" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
