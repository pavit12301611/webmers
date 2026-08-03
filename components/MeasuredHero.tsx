import Link from 'next/link';
import Header from '@/components/Header';
import HeroScrollVideo from '@/components/HeroScrollVideo';

/**
 * MeasuredHero
 * ─────────────
 * Wraps the scroll-scrubbed video section with a sticky content overlay.
 *
 * Layout:
 *  ┌─────────────────────────────────────────┐  ← position: relative
 *  │  HeroScrollVideo (200 vh, sticky inside)│
 *  │                                         │
 *  │  ┌ sticky content overlay (top: 0) ──┐  │
 *  │  │  Header                           │  │
 *  │  │  h1 / p / CTA (centred)           │  │
 *  │  └───────────────────────────────────┘  │
 *  └─────────────────────────────────────────┘
 *
 * The overlay uses pointer-events: none on its background so scroll
 * events fall through to the window and drive the video scrub.
 */
export default function MeasuredHero() {
  return (
    <section
      className="relative w-full"
      aria-label="Webmers hero"
      style={{ height: '200vh' }}          /* match HeroScrollVideo height */
    >
      {/* ── Scroll-scrubbed video lives at the bottom of the stack ── */}
      <div className="absolute inset-0 z-0">
        <HeroScrollVideo />
      </div>

      {/* ── Sticky content overlay — scrolls with the page but stays in view ── */}
      <div className="sticky top-0 z-10 flex h-screen w-full flex-col overflow-hidden pointer-events-none">

        {/* Header needs pointer events re-enabled */}
        <div className="pointer-events-auto">
          <Header hero />
        </div>

        {/* Hero text + CTA */}
        <div className="pointer-events-auto flex flex-1 flex-col items-center justify-center px-6 pb-40 pt-32 text-center">
          <h1
            className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Buy. Edit. Own.{' '}
            <em className="not-italic text-gradient-aurora">Measured to perfection.</em>
          </h1>

          <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Webmers is the premium marketplace for fully-built websites — browse
            launch-ready sites, tune them in a visual editor, and take full
            ownership.
          </p>

          <Link
            href="/marketplace"
            className="animate-fade-rise-delay-2 mt-12 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 px-14 py-5 text-base font-medium text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
          >
            Begin Journey
          </Link>

          {/* Scroll hint */}
          <div className="animate-fade-rise-delay-2 mt-10 flex flex-col items-center gap-2 text-white/30">
            <span className="text-[11px] uppercase tracking-[0.2em]">Scroll to explore</span>
            <div className="scroll-hint-arrow" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4v12M5 11l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
