import Link from 'next/link';
import Header from '@/components/Header';
import HeroVideo from '@/components/HeroVideo';

export default function MeasuredHero() {
  return (
    <section
      className="relative isolate flex h-screen min-h-screen w-full flex-col overflow-hidden bg-background"
      aria-label="Webmers hero"
    >
      {/* Branded gradient — final fallback if both video and poster fail to load. */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-b from-[#001a2e] via-[#002b42] to-[#001019]"
        aria-hidden="true"
      />
      <HeroVideo />

      <Header hero />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-40 pt-32 text-center">
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Buy. Edit. Own.{' '}
          <em className="not-italic text-muted-foreground">Measured to perfection.</em>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Webmers is the premium marketplace for fully-built websites — browse launch-ready sites, tune them in a visual editor, and take full ownership.
        </p>

        <Link
          href="/marketplace"
          className="liquid-glass animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-foreground transition-transform duration-300 hover:scale-[1.03]"
        >
          Begin Journey
        </Link>
      </div>
    </section>
  );
}
