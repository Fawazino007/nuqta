'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function CRTScreen() {
  const router = useRouter();
  const screenRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);

  // Tennis ball custom cursor on desktop
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const cx = 16, cy = 16, r = 14;
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8e4d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.72, cy - r * 0.75);
    ctx.bezierCurveTo(cx - r * 0.45, cy - r * 0.2, cx - r * 0.45, cy + r * 0.2, cx - r * 0.72, cy + r * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.72, cy - r * 0.75);
    ctx.bezierCurveTo(cx + r * 0.45, cy - r * 0.2, cx + r * 0.45, cy + r * 0.2, cx + r * 0.72, cy + r * 0.75);
    ctx.stroke();
    document.documentElement.style.cursor = `url(${canvas.toDataURL()}) 16 16, auto`;
  }, []);

  const tvTransition = useCallback(async (callback: () => void) => {
    if (transitioning.current) return;
    const screen = screenRef.current;
    if (!screen) return;
    transitioning.current = true;

    screen.style.transition = 'transform 0.28s ease-in, filter 0.15s ease-in';
    screen.style.transform = 'perspective(1200px) rotateX(1deg) scaleY(0.004)';
    screen.style.filter = 'brightness(5)';
    await new Promise(r => setTimeout(r, 160));
    screen.style.filter = 'brightness(0)';
    await new Promise(r => setTimeout(r, 160));
    callback();
    await new Promise(r => setTimeout(r, 60));
    screen.style.transition = 'transform 0.45s ease-out, filter 0.2s ease-out';
    screen.style.transform = 'perspective(1200px) rotateX(1deg) scaleY(1)';
    screen.style.filter = 'brightness(1.4)';
    await new Promise(r => setTimeout(r, 220));
    screen.style.filter = '';
    await new Promise(r => setTimeout(r, 230));
    screen.style.transition = '';
    transitioning.current = false;
  }, []);

  const showMarket = useCallback(() => {
    tvTransition(() => router.push('/marketplace'));
  }, [tvTransition, router]);

  return (
    <div className="crt-outer">
      <div ref={screenRef} className="crt-screen">
        <div className="scanlines" />
        <div className="vhs-noise" />
        <div className="vhs-glitch" />
        <div className="vhs-chroma" />
        <div className="vhs-bars" />
        <div className="vhs-tint" />
        <div className="vhs-scanroll" />

        <div className="screen-content start-screen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nuqta-logo-v3.png" alt="NUQTA" className="nuqta-logo" />
          <button
            className="press-start-btn"
            onClick={showMarket}
            onTouchEnd={e => { e.preventDefault(); showMarket(); }}
          >
            <span className="breathe-text">PRESS START</span>
          </button>
          <div className="copyright">© 2026 NUQTA</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/racket-2.png" alt="" className="racket-img" />
        </div>
      </div>

      <div className="crt-label" style={{ cursor: 'default' }}>NUQTA</div>
    </div>
  );
}
