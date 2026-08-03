'use client';

import React, { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black font-geist">
      {/* Background Video */}
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        style={{ objectPosition: '70% center' }}
      />

      {/* Navbar (z-30) */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-5 md:px-12 lg:px-16">
        <div className="flex items-center gap-8 lg:gap-12">
          <a href="#" className="text-lg font-semibold tracking-tight text-white sm:text-xl">
            Foldcraft
          </a>
          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {['Home', 'Projects', 'Studio', 'Reach Us'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-white/80 transition-colors hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-transform hover:scale-105 md:inline-block">
            Let&apos;s Talk
          </button>

          {/* Right side (mobile): hamburger toggle button (40x40, z-50) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative z-50 flex h-[40px] w-[40px] items-center justify-center text-white active:scale-90 md:hidden"
            aria-label="Toggle Menu"
          >
            <Menu
              size={24}
              className={`absolute transition-all duration-300 ${
                mobileMenuOpen
                  ? 'rotate-90 scale-0 opacity-0'
                  : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <X
              size={24}
              className={`absolute transition-all duration-300 ${
                mobileMenuOpen
                  ? 'rotate-0 scale-100 opacity-100'
                  : '-rotate-90 scale-0 opacity-0'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu (z-20) */}
      <div
        className={`absolute inset-x-0 top-0 z-20 overflow-hidden bg-black/98 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen
            ? 'h-screen opacity-100'
            : 'h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`flex h-full flex-col justify-center px-8 transition-all duration-500 delay-100 ${
            mobileMenuOpen
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-6">
            {['Home', 'Projects', 'Studio', 'Reach Us'].map((item) => (
              <a
                key={item}
                href="#"
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl font-medium text-white/90 hover:text-white"
              >
                {item}
              </a>
            ))}
            <div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mt-6 rounded-full bg-white px-8 py-3.5 text-base font-medium text-black transition-transform hover:scale-105"
              >
                Let&apos;s Talk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Content (z-10) */}
      <div className="relative z-10 flex h-[calc(100vh-80px)] flex-col justify-between px-6 pb-10 pt-12 sm:pb-12 sm:pt-16 md:px-12 md:pb-16 md:pt-20 lg:px-16">
        {/* Top Section (max-w-3xl) */}
        <div className="max-w-3xl">
          <p className="mb-4 text-xs text-white/90 animate-[fadeSlideUp_0.8s_ease_0.2s_both] sm:mb-6 sm:text-sm">
            Brand &amp; Visual Storytelling
          </p>
          <h1 className="text-3xl font-medium leading-[1.1] tracking-tight text-white animate-[fadeSlideUp_0.8s_ease_0.4s_both] sm:text-5xl md:text-6xl lg:text-7xl">
            Shaping visual <br />
            narratives, <br />
            one pixel at a time.
          </h1>
        </div>

        {/* Bottom Section */}
        <div>
          <p className="mb-5 max-w-sm text-sm leading-relaxed text-white/60 animate-[fadeSlideUp_0.8s_ease_0.7s_both] sm:mb-6 sm:max-w-lg sm:text-base md:text-lg">
            Turning vision into reality through craft, motion, and an endless pursuit of beauty.
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-105 sm:px-6 sm:py-3 animate-[fadeSlideUp_0.8s_ease_0.9s_both]">
            <span>Explore Work</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
