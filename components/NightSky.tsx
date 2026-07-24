'use client';

const LEAVES = [
  { top: 18, left: 8, size: 34, delay: 0.1, duration: 10 },
  { top: 26, left: 78, size: 26, delay: 1.1, duration: 9 },
  { top: 48, left: 14, size: 22, delay: 1.8, duration: 11 },
  { top: 60, left: 86, size: 30, delay: 0.5, duration: 12 },
  { top: 33, left: 53, size: 18, delay: 2.4, duration: 8 },
  { top: 72, left: 42, size: 24, delay: 1.4, duration: 10 },
];

const FIREFLIES = [
  { top: 25, left: 27, delay: 0.2 },
  { top: 36, left: 64, delay: 1.0 },
  { top: 52, left: 74, delay: 1.7 },
  { top: 66, left: 22, delay: 0.8 },
  { top: 46, left: 46, delay: 2.4 },
  { top: 74, left: 62, delay: 1.5 },
  { top: 58, left: 9, delay: 2.0 },
  { top: 30, left: 91, delay: 0.4 },
];

/**
 * Lightweight decorative hero scene: sunrise, soft hills, water and drifting
 * leaves. It uses deterministic CSS-only motion so the page stays smooth.
 */
export default function NightSky() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(244,213,141,0.18),transparent_22rem),linear-gradient(180deg,#163723_0%,#0b2418_44%,#07130e_100%)]" />

      {/* Sun glow */}
      <div className="absolute left-1/2 top-[12vh] h-44 w-44 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#fff6c8] via-[#f4d58d] to-[#d99d54] opacity-95 blur-[0.2px] shadow-[0_0_120px_36px_rgba(244,213,141,0.24)] animate-sun-breathe" />
      <div className="absolute left-1/2 top-[12vh] h-64 w-64 -translate-x-1/2 rounded-full bg-[#f4d58d]/10 blur-3xl" />

      {/* Distant hills */}
      <div className="absolute bottom-[18%] left-[-8%] h-[34%] w-[70%] rounded-t-[100%] bg-gradient-to-t from-[#0b2a1b] to-[#315b35]/80 blur-[0.2px]" />
      <div className="absolute bottom-[16%] right-[-12%] h-[38%] w-[78%] rounded-t-[100%] bg-gradient-to-t from-[#092015] to-[#24492d]/90" />
      <div className="absolute bottom-[12%] left-[16%] h-[26%] w-[70%] rounded-t-[100%] bg-gradient-to-t from-[#07180f] to-[#1a3a25]" />

      {/* River */}
      <div className="absolute bottom-0 left-0 right-0 h-[26%] overflow-hidden bg-gradient-to-b from-[#163524] via-[#0d271c] to-[#07130e]">
        <div className="absolute left-[-10%] top-[18%] h-10 w-[120%] rounded-full bg-gradient-to-r from-transparent via-emerald-100/12 to-transparent blur-sm animate-river-flow" />
        <div className="absolute left-[-12%] top-[46%] h-8 w-[124%] rounded-full bg-gradient-to-r from-transparent via-lime-100/8 to-transparent blur-sm animate-river-flow" style={{ animationDelay: '1.8s' }} />
      </div>

      {/* Foreground reeds */}
      <div className="absolute bottom-0 left-0 right-0 flex h-36 items-end justify-around opacity-75">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="w-1 origin-bottom rounded-t-full bg-gradient-to-t from-emerald-950 to-emerald-400/80 animate-sway"
            style={{ height: `${42 + ((i * 17) % 70)}px`, animationDelay: `${i * 0.13}s` }}
          />
        ))}
      </div>

      {/* Floating leaves */}
      {LEAVES.map((leaf, i) => (
        <span
          key={i}
          className="absolute rounded-[70%_0_70%_0] bg-gradient-to-br from-lime-200/45 to-emerald-500/30 blur-[0.1px] animate-drift-slow"
          style={{
            top: `${leaf.top}%`,
            left: `${leaf.left}%`,
            width: `${leaf.size}px`,
            height: `${leaf.size * 0.62}px`,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
          }}
        />
      ))}

      {/* Small fireflies */}
      {FIREFLIES.map((fly, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-lime-100"
          style={{
            top: `${fly.top}%`,
            left: `${fly.left}%`,
            boxShadow: '0 0 14px 5px rgba(217, 249, 157, 0.28)',
            animation: `twinkle 3.2s ease-in-out ${fly.delay}s infinite`,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-[#07130e] via-transparent to-transparent" />
    </div>
  );
}
