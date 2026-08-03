'use client';

import { useEffect, useRef, useState } from 'react';

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

/**
 * Hero background video with graceful fallbacks.
 * - Nudges muted autoplay (some browsers defer it until a play() call).
 * - On load error, swaps to the static poster image so the hero never goes blank.
 * - A colorful animated gradient sits behind everything as the final fallback.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // If video doesn't start playing within 5s, treat as failed
    timeoutRef.current = setTimeout(() => {
      if (v.paused || v.readyState < 2) {
        setFailed(true);
      }
    }, 5000);

    const tryPlay = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    const onCanPlay = () => tryPlay();
    v.addEventListener('canplay', onCanPlay);

    // Also try to play immediately
    tryPlay();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      v.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  return (
    <>
      {/* Animated colorful gradient — always present as the base layer */}
      <div
        className="absolute inset-0 z-0 hero-gradient-animated"
        aria-hidden="true"
      />

      {/* Video layer — hidden if it fails */}
      <video
        ref={ref}
        className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700 ${
          failed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero-bg.jpg"
        onError={() => setFailed(true)}
        aria-hidden="true"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Poster fallback — shown when video fails */}
      <div
        className={`absolute inset-0 z-[1] bg-cover bg-center transition-opacity duration-700 ${
          failed ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        aria-hidden="true"
      />

      {/* Colorful overlay tint on top of video/poster for vibrancy */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.15) 30%, rgba(6,182,212,0.15) 60%, rgba(16,185,129,0.2) 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
