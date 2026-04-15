'use client';

import { useEffect, useState } from 'react';
import { listings } from '@/lib/listings';

interface Props {
  currentListing: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function Marketplace({ currentListing, onNext, onPrev }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const l = listings[currentListing];

  useEffect(() => {
    setImageLoaded(false);
    // Preload adjacent images
    const next = listings[(currentListing + 1) % listings.length];
    const prev = listings[(currentListing - 1 + listings.length) % listings.length];
    [next, prev].forEach(item => {
      const img = new window.Image();
      img.src = item.photo;
    });
  }, [currentListing]);

  return (
    <div className="market-screen">
      <div className="market-seller">{l.seller}</div>

      <div className="market-name">{l.name}</div>

      <div className="market-photo-wrap">
        <div className="market-photo-box">
          {!imageLoaded && <div className="market-photo-placeholder" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="market-photo"
            src={l.photo}
            alt={l.name}
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
          {l.weight}
        </div>
        <div className="market-stat">
          <span className="market-stat-label">GRIP</span>
          {l.gripSize}
        </div>
      </div>

      <div className="market-price">{l.price}</div>

      <div className="market-nav">
        <button className="nav-btn" onClick={onPrev} aria-label="Previous listing">◄</button>
        <div className="market-seller-nav">{l.seller}</div>
        <button className="nav-btn" onClick={onNext} aria-label="Next listing">►</button>
      </div>
    </div>
  );
}
