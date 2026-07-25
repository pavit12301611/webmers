'use client';

import { useEffect, useRef } from 'react';

/**
 * Optimized Measured hero
 * - No React state in RAF loop (refs only) → zero rerenders
 * - No canvas.toDataURL() → uses CSS radial-gradient mask (GPU accelerated)
 * - Grid parallax via direct DOM transform
 * - Passive listeners + single rAF
 */

const BG_IMAGE =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85';
const FRONT_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_162101_0d7498c5-29bb-47bf-a99f-2773c0a880a9.mp4';
const OVERLAY_IMAGE =
  'https://soft-zoom-63098134.figma.site/_assets/v11/3f10f1876e118f72a396e05a6c2d099569478272.png';

export default function MeasuredHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const gridEl = gridRef.current;
    const spotEl = spotlightRef.current;
    if (!section || !gridEl || !spotEl) return;

    // Cursor state in refs to avoid renders
    const target = { x: section.clientWidth / 2, y: section.clientHeight / 2 };
    const smooth = { x: target.x, y: target.y };
    const gridTarget = { x: 0, y: 0 };
    const gridSmooth = { x: 0, y: 0 };

    let raf = 0;
    let isTicking = false;

    const update = () => {
      isTicking = false;

      // lerp 0.1 for spotlight, 0.06 for grid
      smooth.x += (target.x - smooth.x) * 0.1;
      smooth.y += (target.y - smooth.y) * 0.1;

      gridSmooth.x += (gridTarget.x - gridSmooth.x) * 0.06;
      gridSmooth.y += (gridTarget.y - gridSmooth.y) * 0.06;

      // Update grid via direct transform (no React state)
      gridEl.style.transform = `translate3d(${gridSmooth.x}px, ${gridSmooth.y}px, 0)`;

      // CSS mask gradient — identical visual to canvas spec but GPU only
      // Stops: 0-40% white, 60% 0.75 alpha, 75% 0.4, 88% 0.12, 100% transparent
      const mask = `radial-gradient(260px circle at ${smooth.x}px ${smooth.y}px, white 0%, white 40%, rgba(255,255,255,0.75) 60%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.12) 88%, transparent 100%)`;

      spotEl.style.webkitMaskImage = mask;
      spotEl.style.maskImage = mask;

      raf = requestAnimationFrame(update);
    };

    const schedule = () => {
      if (!isTicking) {
        isTicking = true;
        // already looping via update, but keep for safety
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = section.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;

      const cx = r.width / 2;
      const cy = r.height / 2;
      gridTarget.x = ((target.x - cx) / cx) * 16;
      gridTarget.y = ((target.y - cy) / cy) * 16;
      schedule();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const r = section.getBoundingClientRect();
      target.x = e.touches[0].clientX - r.left;
      target.y = e.touches[0].clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      gridTarget.x = ((target.x - cx) / cx) * 16;
      gridTarget.y = ((target.y - cy) / cy) * 16;
      schedule();
    };

    // Initialize centered mask
    const initMask = `radial-gradient(260px circle at ${smooth.x}px ${smooth.y}px, white 0%, white 40%, rgba(255,255,255,0.75) 60%, rgba(255,255,255,0.4) 75%, rgba(255,255,255,0.12) 88%, transparent 100%)`;
    spotEl.style.webkitMaskImage = initMask;
    spotEl.style.maskImage = initMask;

    raf = requestAnimationFrame(update);
    section.addEventListener('mousemove', onMouseMove, { passive: true });
    section.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="font-helvetica-neue relative flex h-[100vh] w-full overflow-hidden bg-[#050505]"
      aria-label="Webmers hero - measured aesthetic"
    >
      {/* Layer 1 — Grid Background */}
      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08] will-change-transform"
        aria-hidden="true"
      >
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="measured-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#measured-grid)" />
        </svg>
      </div>

      {/* Layer 2 — Background Image */}
      <div className="absolute inset-0 z-10">
        <img
          src={BG_IMAGE}
          alt=""
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Layer 3 — Hero Text */}
      <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex justify-center sm:top-28 md:top-32">
        <h1
          className="select-none text-center text-[4.5rem] leading-[0.9] tracking-[-0.02em] text-white xs:text-[5.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          WEBMERS
        </h1>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[46%] z-20 flex flex-col items-center gap-3 px-6 sm:top-[52%]">
        <p className="max-w-[44ch] text-center text-[12px] font-medium uppercase tracking-[0.22em] text-white/60 md:text-[13px]">
          Buy · Edit · Own — Websites that feel measured
        </p>
      </div>

      {/* Layer 4 — Overlay Image */}
      <img
        src={OVERLAY_IMAGE}
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 z-[25] h-full w-full object-cover opacity-70 mix-blend-soft-light"
        aria-hidden="true"
      />

      {/* Layer 5 — Spotlight Reveal (GPU mask, clipped to bottom 60%) */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 z-30 will-change-[mask-image]"
        style={{
          clipPath: 'inset(40% 0 0 0)',
          WebkitClipPath: 'inset(40% 0 0 0)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
        }}
      >
        <video
          src={FRONT_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={BG_IMAGE}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 h-40 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute bottom-6 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-8">
        <div className="hidden items-center gap-2 md:flex">
          <span className="h-px w-12 bg-white/20" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Scroll to explore grove</span>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full liquid-glass px-3 py-1">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/60">Move cursor to reveal</span>
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
        </div>
      </div>
    </section>
  );
}
