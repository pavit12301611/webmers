'use client';
import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
      position: fixed;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      pointer-events: none;
      background: rgba(255,255,255,0.2);
      box-shadow: 0 0 20px rgba(255,255,255,0.35);
      z-index: 99999;
      transition: transform 0.15s ease, width 0.2s ease, height 0.2s ease;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(cursor);

    const onMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    const onDown = () => { cursor.style.width = '10px'; cursor.style.height = '10px'; };
    const onUp = () => { cursor.style.width = '16px'; cursor.style.height = '16px'; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.body.removeChild(cursor);
    };
  }, []);

  return null;
}
