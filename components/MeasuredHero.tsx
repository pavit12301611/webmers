import Link from 'next/link';
import Header from '@/components/Header';
import GridPattern from '@/components/GridPattern';

/**
 * MeasuredHero
 * ─────────────
 * Static, full-height hero. The previous version was a 200vh scroll-scrubbed
 * video; once the video was removed there was no reason to keep the extra
 * scroll height (it left a large empty black region below the hero), so this
 * is now a simple 100vh hero that stays within the ink/paper two-color system.
 */
export default function MeasuredHero() {
  return (
    <section
      className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background"
      aria-label="Webmers hero"
    >
      <GridPattern id="hero-grid" opacity={0.05} className="pointer-events-none" />

      {/* Header (hero variant) */}
      <div className="pointer-events-auto relative z-10">
        <Header hero />
      </div>

      {/* Hero content */}
      <div className="pointer-events-auto relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-32 pt-16 text-center">
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Buy. Edit. Own.{' '}
          <em className="italic font-[400]">Measured to perfection.</em>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Webmers is the premium marketplace for fully-built websites — browse
          launch-ready sites, tune them in a visual editor, and take full
          ownership.
        </p>

        <Link
          href="/marketplace"
          className="animate-fade-rise-delay-2 mt-12 inline-flex cursor-pointer items-center gap-2 rounded-full bg-foreground px-14 py-5 text-base font-medium text-background transition-all duration-300 hover:scale-[1.03] hover:opacity-90"
        >
          Begin Journey
        </Link>

        {/* Scroll hint */}
        <div className="animate-fade-rise-delay-2 mt-10 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[11px] uppercase tracking-[0.2em]">Scroll to explore</span>
          <div className="scroll-hint-arrow" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4v12M5 11l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
