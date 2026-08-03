'use client';

import { useEffect, useRef, useState } from 'react';

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

/**
 * Hero background video with graceful fallbacks.
 * - Nudges muted autoplay (some browsers defer it until a play() call).
 * - On load error, swaps to the static poster image so the hero never goes blank.
 * - The section behind this also carries a branded gradient as the final fallback.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    tryPlay();
    const onCanPlay = () => tryPlay();
    v.addEventListener('canplay', onCanPlay);
    return () => v.removeEventListener('canplay', onCanPlay);
  }, []);

  return (
    <>
      <video
        ref={ref}
        className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700 ${
          failed ? 'opacity-0' : 'opacity-100'
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
      <div
        className={`absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-700 ${
          failed ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        aria-hidden="true"
      />
    </>
  );
}
