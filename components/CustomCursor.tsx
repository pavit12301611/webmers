'use client';
import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
      position: fixed;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      pointer-events: none;
      border: 2.5px solid rgba(217, 119, 43, 0.35);
      background: rgba(217, 119, 43, 0.08);
      z-index: 99999;
      transition: transform 0.18s ease, width 0.2s ease, height 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 0 4px rgba(217, 119, 43, 0.08), 0 4px 12px rgba(143, 113, 80, 0.15);
    `;
    document.body.appendChild(cursor);

    const onMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    const onDown = () => {
      cursor.style.width = '16px';
      cursor.style.height = '16px';
      cursor.style.background = 'rgba(217, 119, 43, 0.2)';
      cursor.style.borderColor = 'rgba(217, 119, 43, 0.55)';
    };
    const onUp = () => {
      cursor.style.width = '22px';
      cursor.style.height = '22px';
      cursor.style.background = 'rgba(217, 119, 43, 0.08)';
      cursor.style.borderColor = 'rgba(217, 119, 43, 0.35)';
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor);
      }
    };
  }, []);

  return null;
}
