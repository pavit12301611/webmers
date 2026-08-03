'use client';

import { useEffect, useRef, useState } from 'react';

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

/**
 * Scroll-scrubbed hero video background.
 *
 * HOW IT WORKS
 * ─────────────
 * • The hero section is 200 vh tall — the top half is the "scrub zone".
 * • The visual hero panel (video + content) is sticky: it stays fixed in
 *   view while the user scrolls through the extra 100 vh.
 * • A scroll listener maps [0 → sectionHeight] → [0 → video.duration]
 *   and writes that value to video.currentTime every rAF tick.
 * • The video is paused at all times — only currentTime moves (no
 *   autoplay, no loop).  This gives silky frame-by-frame control.
 * • On video load error the animated gradient + poster image show instead.
 */
export default function HeroScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1, for overlay opacity effect

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    // ── 1. Pre-load the video but keep it paused ────────────────────────
    video.pause();
    video.currentTime = 0;

    const onMetadata = () => setReady(true);
    video.addEventListener('loadedmetadata', onMetadata);

    // ── 2. Scroll handler ────────────────────────────────────────────────
    const syncFrame = () => {
      const rect = section.getBoundingClientRect();
      const sectionH = section.offsetHeight;
      // How far has the user scrolled past the section top (px)?
      const scrolled = -rect.top;
      // Clamp to [0, sectionH]
      const clamped = Math.max(0, Math.min(scrolled, sectionH));
      const p = clamped / sectionH; // 0 → 1
      setProgress(p);

      if (video.duration && isFinite(video.duration)) {
        video.currentTime = p * video.duration;
      }
    };

    const onScroll = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(syncFrame);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on mount so the first frame is correct
    syncFrame();

    return () => {
      window.removeEventListener('scroll', onScroll);
      video.removeEventListener('loadedmetadata', onMetadata);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      // ── 200 vh: gives the user scroll space to scrub through the video ──
      className="relative w-full"
      style={{ height: '200vh' }}
    >
      {/* ── Sticky panel — stays in viewport during the scrub zone ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Layer 0 — animated gradient base (always present) */}
        <div
          className="absolute inset-0 z-0 hero-gradient-animated"
          aria-hidden="true"
        />

        {/* Layer 1 — scroll-scrubbed video */}
        {!failed && (
          <video
            ref={videoRef}
            className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            playsInline
            preload="auto"
            poster="/hero-bg.jpg"
            onLoadedMetadata={() => setReady(true)}
            onError={() => setFailed(true)}
            aria-hidden="true"
            // NO autoPlay, NO loop — scroll drives currentTime
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
        )}

        {/* Poster shown before video is ready or on error */}
        <div
          className={`absolute inset-0 z-[1] bg-cover bg-center transition-opacity duration-700 ${
            !ready || failed ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          aria-hidden="true"
        />

        {/* Layer 2 — colour tint overlay (gets slightly lighter as user scrolls) */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: `linear-gradient(135deg,
              rgba(139,92,246,${0.35 - progress * 0.1}) 0%,
              rgba(236,72,153,${0.20 - progress * 0.05}) 30%,
              rgba(6,182,212,${0.20 - progress * 0.05}) 60%,
              rgba(16,185,129,${0.25 - progress * 0.08}) 100%)`,
          }}
          aria-hidden="true"
        />

        {/* Layer 3 — subtle vignette at bottom so content blends */}
        <div
          className="absolute inset-x-0 bottom-0 z-[3] h-40 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, hsl(240,15%,6%) 0%, transparent 100%)',
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
