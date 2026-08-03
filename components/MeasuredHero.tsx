import Link from 'next/link';
import Header from '@/components/Header';
import HeroVideo from '@/components/HeroVideo';

export default function MeasuredHero() {
  return (
    <section
      className="relative isolate flex h-screen min-h-screen w-full flex-col overflow-hidden"
      aria-label="Webmers hero"
    >
      <HeroVideo />

      <Header hero />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-40 pt-32 text-center">
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Buy. Edit. Own.{' '}
          <em className="not-italic text-gradient-aurora">Measured to perfection.</em>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Webmers is the premium marketplace for fully-built websites — browse launch-ready sites, tune them in a visual editor, and take full ownership.
        </p>

        <Link
          href="/marketplace"
          className="animate-fade-rise-delay-2 mt-12 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 px-14 py-5 text-base font-medium text-white shadow-[0_0_30px_rgba(139,92,246,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]"
        >
          Begin Journey
        </Link>
      </div>
    </section>
  );
}
