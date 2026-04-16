'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

interface Listing {
  id: string;
  seller_id: string;
  photo_url: string;
  racket_name: string;
  condition: string;
  weight: string;
  grip_size: string;
  price: string;
  whatsapp: string;
  users: { username: string } | null;
}

export default function MarketplaceBrowse() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchStartX = useRef(0);

  const handleLogout = useCallback(async () => {
    await getSupabase().auth.signOut();
    router.push('/');
  }, [router]);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const cx = 16, cy = 16, r = 14;
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e8e4d8'; ctx.lineWidth = 2;
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

  useEffect(() => {
    const client = getSupabase();
    client
      .from('listings')
      .select('*, users!seller_id(username)')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setListings(data as Listing[]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setImageLoaded(false);
  }, [current]);

  const goNext = useCallback(() => {
    setCurrent(i => (i + 1) % listings.length);
  }, [listings.length]);

  const goPrev = useCallback(() => {
    setCurrent(i => (i - 1 + listings.length) % listings.length);
  }, [listings.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (listings.length < 2) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [listings.length, goNext, goPrev]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (listings.length < 2) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? goNext() : goPrev();
  }, [listings.length, goNext, goPrev]);

  const l = listings[current];
  const sellerUsername = l?.users?.username ?? '???';
  const waUrl = l
    ? `https://wa.me/${l.whatsapp.replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your ${l.racket_name} listed on NUQTA`)}`
    : '#';

  return (
    <div className="crt-outer">
      <div
        className="crt-screen"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="scanlines" />
        <div className="vhs-noise" />
        <div className="vhs-glitch" />
        <div className="vhs-chroma" />
        <div className="vhs-bars" />
        <div className="vhs-tint" />
        <div className="vhs-scanroll" />

        <div className="market-top-actions">
          <button className="market-top-btn" onClick={() => router.push('/profile')}>
            PROFILE
          </button>
          <span className="market-top-divider">|</span>
          <button className="market-top-btn" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>

        <button className="market-back-btn" onClick={() => router.push('/')}>
          ← BACK
        </button>

        {loading && (
          <div className="screen-content" style={{ textAlign: 'center' }}>
            <p className="market-name loading-blink">LOADING...</p>
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="screen-content" style={{ textAlign: 'center' }}>
            <p className="market-name">NO LISTINGS YET</p>
          </div>
        )}

        {!loading && l && (
          <div className="market-screen">
            <button className="market-seller market-seller-link" onClick={() => router.push('/profile')}>
              @{sellerUsername}
            </button>

            <div className="market-name">{l.racket_name}</div>

            <div className="market-photo-wrap">
              <div className="market-photo-box">
                {!imageLoaded && <div className="market-photo-placeholder" />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="market-photo"
                  src={l.photo_url}
                  alt={l.racket_name}
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            </div>

            <div className="market-stats">
              <div className="market-stat">
                <span className="market-stat-label">CONDITION</span>
                {l.condition}
              </div>
              <div className="market-stat">
                <span className="market-stat-label">WEIGHT</span>
                {l.weight}G
              </div>
              <div className="market-stat">
                <span className="market-stat-label">GRIP</span>
                {l.grip_size}
              </div>
            </div>

            <div className="market-price">
              KD {parseFloat(l.price).toFixed(3)}
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              💬 CONTACT ON WHATSAPP
            </a>

            {listings.length > 1 && (
              <div className="market-nav">
                <button className="nav-btn" onClick={goPrev} aria-label="Previous">◄</button>
                <button className="nav-btn" onClick={goNext} aria-label="Next">►</button>
              </div>
            )}

            <div className="market-counter">
              {String(current + 1).padStart(2, '0')} / {String(listings.length).padStart(2, '0')}
            </div>
          </div>
        )}

        <button className="sell-corner-btn" onClick={() => router.push('/sell')}>
          SELL A RACKET
        </button>
      </div>

      <div className="crt-label" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
        NUQTA
      </div>
    </div>
  );
}
