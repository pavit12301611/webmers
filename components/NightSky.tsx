'use client';

import { useMemo } from 'react';

/**
 * The cinematic night sky used on the landing hero: a glowing moon, twinkling
 * stars and drifting fireflies. Purely decorative and self-contained (no
 * external assets). Respects `prefers-reduced-motion` via CSS.
 */
export default function NightSky() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        top: Math.random() * 65,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
        opacity: 0.2 + Math.random() * 0.8,
      })),
    [],
  );

  const fireflies = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        top: 10 + Math.random() * 80,
        left: 5 + Math.random() * 90,
        size: 3 + Math.random() * 3,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Glowing moon */}
      <div className="absolute top-[14vh] right-[14vw] w-28 h-28 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[#fdf6e3] via-[#f4e1c1] to-[#e8cfa8] shadow-[0_0_80px_20px_rgba(253,246,227,0.35)]">
        <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-[#e6dcc8] to-[#c4b8a0] opacity-50" />
      </div>

      {/* Stars */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Fireflies */}
      {fireflies.map((f) => (
        <span
          key={f.id}
          className="absolute rounded-full bg-amber-200"
          style={{
            top: `${f.top}%`,
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            boxShadow: '0 0 8px 2px rgba(253, 246, 227, 0.6)',
            animation: `float ${f.duration}s ease-in-out ${f.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
