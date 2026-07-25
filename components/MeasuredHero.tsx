'use client';

import { useEffect, useRef, useState } from 'react';

const BG_IMAGE =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260713_140344_79e1296a-86d7-43fd-9b5f-63ffe560f291.png&w=1280&q=85';
const FRONT_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260713_162101_0d7498c5-29bb-47bf-a99f-2773c0a880a9.mp4';
const OVERLAY_IMAGE =
  'https://soft-zoom-63098134.figma.site/_assets/v11/3f10f1876e118f72a396e05a6c2d099569478272.png';

export default function MeasuredHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maskImage, setMaskImage] = useState<string | null>(null);

  // Cursor tracking
  const targetRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const gridTargetRef = useRef({ x: 0, y: 0 });
  const gridSmoothRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Initialize positions to center
    const rect = section.getBoundingClientRect();
    targetRef.current = { x: rect.width / 2, y: rect.height / 2 };
    smoothRef.current = { x: rect.width / 2, y: rect.height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      if (!section) return;
      const r = section.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      targetRef.current = { x, y };

      // Grid parallax offset calculated as cursor pos relative to center * 16
      const cx = r.width / 2;
      const cy = r.height / 2;
      gridTargetRef.current = {
        x: ((x - cx) / cx) * 16,
        y: ((y - cy) / cy) * 16,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!section || e.touches.length === 0) return;
      const r = section.getBoundingClientRect();
      const x = e.touches[0].clientX - r.left;
      const y = e.touches[0].clientY - r.top;
      targetRef.current = { x, y };
      const cx = r.width / 2;
      const cy = r.height / 2;
      gridTargetRef.current = {
        x: ((x - cx) / cx) * 16,
        y: ((y - cy) / cy) * 16,
      };
    };

    section.addEventListener('mousemove', handleMouseMove);
    section.addEventListener('touchmove', handleTouchMove, { passive: true });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const updateMask = () => {
      if (!section || !canvas || !ctx) return;

      const bounds = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      // Canvas matches section size scaled by dpr for crisp mask, but we keep low res for perf
      const w = bounds.width;
      const h = bounds.height;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // lerp smooth += (target - smooth) * 0.1
      smoothRef.current.x += (targetRef.current.x - smoothRef.current.x) * 0.1;
      smoothRef.current.y += (targetRef.current.y - smoothRef.current.y) * 0.1;

      // grid lerp eased at 0.06
      gridSmoothRef.current.x += (gridTargetRef.current.x - gridSmoothRef.current.x) * 0.06;
      gridSmoothRef.current.y += (gridTargetRef.current.y - gridSmoothRef.current.y) * 0.06;
      setGridOffset({ x: gridSmoothRef.current.x, y: gridSmoothRef.current.y });

      ctx.clearRect(0, 0, w, h);

      const radius = 260;
      const gradient = ctx.createRadialGradient(
        smoothRef.current.x,
        smoothRef.current.y,
        0,
        smoothRef.current.x,
        smoothRef.current.y,
        radius
      );
      // Mask gradient stops: center full white (0-40%), then feathers
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)');
      gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)');
      gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      const dataUrl = canvas.toDataURL();
      setMaskImage(`url(${dataUrl})`);

      rafRef.current = requestAnimationFrame(updateMask);
    };

    rafRef.current = requestAnimationFrame(updateMask);

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
      section.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="font-helvetica-neue relative flex h-[100vh] w-full overflow-hidden bg-white"
      aria-label="Webmers hero - Measured aesthetic"
    >
      {/* Layer 1 — Grid Background z-0 opacity 0.1 with parallax */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.1]"
        style={{
          transform: `translate3d(${gridOffset.x}px, ${gridOffset.y}px, 0)`,
          willChange: 'transform',
        }}
      >
        <svg width="100%" height="100%" className="absolute inset-0" aria-hidden="true">
          <defs>
            <pattern id="measured-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#measured-grid)" />
        </svg>
      </div>

      {/* Layer 2 — Background Image z-10 */}
      <div
        className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Layer 3 — Hero Text z-20 */}
      <div className="pointer-events-none absolute inset-x-0 top-20 z-20 flex justify-center sm:top-28 md:top-32">
        <h1
          className="select-none text-center font-instrument text-[4.5rem] leading-[0.9] tracking-[-0.02em] text-white xs:text-[5.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          WEBMERS
        </h1>
      </div>

      {/* Sub-tag overlay on hero text for context - keep Webmers identity */}
      <div className="pointer-events-none absolute inset-x-0 top-[46%] z-20 flex flex-col items-center gap-3 px-6 sm:top-[52%]">
        <p className="max-w-[44ch] text-center text-[12px] font-medium uppercase tracking-[0.22em] text-white/60 md:text-[13px]">
          Buy · Edit · Own — Websites that feel measured
        </p>
      </div>

      {/* Layer 4 — Overlay Image z-25 */}
      <img
        src={OVERLAY_IMAGE}
        alt=""
        className="pointer-events-none absolute inset-0 z-[25] h-full w-full object-cover mix-blend-soft-light opacity-70"
        aria-hidden="true"
      />

      {/* Layer 5 — Spotlight Reveal z-30 - video clipped to bottom 60% */}
      <div
        className="absolute inset-0 z-30"
        style={{
          clipPath: 'inset(40% 0 0 0)',
          WebkitClipPath: 'inset(40% 0 0 0)',
          ...(maskImage
            ? {
                WebkitMaskImage: maskImage,
                maskImage: maskImage,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
              }
            : {}),
        }}
      >
        <video
          src={FRONT_VIDEO}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Hidden canvas for mask generation */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full opacity-0"
        aria-hidden="true"
      />

      {/* Bottom fade + micro copy */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-40 h-40 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute bottom-6 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-8">
        <div className="hidden items-center gap-2 md:flex">
          <span className="h-px w-12 bg-white/20" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
            Scroll to explore grove
          </span>
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
