'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

interface AuthUser {
  id: string;
  full_name: string;
}

export default function SellScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [racketName, setRacketName] = useState('');
  const [condition, setCondition] = useState('NEW');
  const [weight, setWeight] = useState('');
  const [gripSize, setGripSize] = useState('G2');
  const [price, setPrice] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

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
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? user.email ?? 'UNKNOWN',
      });
      setAuthChecked(true);
    });
  }, [router]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!photo) {
      setError('PLEASE ATTACH A PHOTO');
      return;
    }

    setSubmitting(true);
    setError(null);
    const supabase = getSupabase();

    const ext = photo.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('listing-photos')
      .upload(path, photo);

    if (uploadError) {
      setError(uploadError.message.toUpperCase());
      setSubmitting(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('listing-photos')
      .getPublicUrl(path);

    const { error: insertError } = await supabase.from('listings').insert({
      seller_id: user.id,
      seller_name: user.full_name,
      racket_name: racketName,
      condition,
      weight,
      grip_size: gripSize,
      price,
      whatsapp,
      photo_url: publicUrl,
      status: 'ACTIVE',
    });

    if (insertError) {
      setError(insertError.message.toUpperCase());
      setSubmitting(false);
      return;
    }

    setPosted(true);
    setSubmitting(false);
    setTimeout(() => router.push('/marketplace'), 2000);
  }, [user, photo, racketName, condition, weight, gripSize, price, whatsapp, router]);

  return (
    <div className="crt-outer">
      <div className="crt-screen">
        <div className="scanlines" />
        <div className="vhs-noise" />
        <div className="vhs-glitch" />
        <div className="vhs-chroma" />
        <div className="vhs-bars" />
        <div className="vhs-tint" />
        <div className="vhs-scanroll" />

        <div className="sell-screen">
          <button className="auth-back" onClick={() => router.push('/')}>
            ◄ BACK
          </button>

          {!authChecked && (
            <p className="market-name loading-blink" style={{ marginTop: '80px' }}>
              LOADING...
            </p>
          )}

          {authChecked && posted && (
            <div style={{ marginTop: '80px', textAlign: 'center' }}>
              <p className="pixel-message">LISTING POSTED!</p>
            </div>
          )}

          {authChecked && !posted && (
            <>
              <p className="auth-title" style={{ marginTop: '44px' }}>
                SELL YOUR RACKET
              </p>

              <form className="pixel-form" onSubmit={handleSubmit}>
                <div className="pixel-field">
                  <label className="pixel-label">RACKET NAME</label>
                  <input
                    className="pixel-input"
                    type="text"
                    value={racketName}
                    onChange={e => setRacketName(e.target.value)}
                    placeholder="E.G. WILSON PRO STAFF"
                    required
                  />
                </div>

                <div className="pixel-field">
                  <label className="pixel-label">CONDITION</label>
                  <select
                    className="pixel-select"
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                  >
                    <option value="NEW">NEW</option>
                    <option value="LIKE NEW">LIKE NEW</option>
                    <option value="GOOD">GOOD</option>
                    <option value="FAIR">FAIR</option>
                  </select>
                </div>

                <div className="pixel-field">
                  <label className="pixel-label">WEIGHT</label>
                  <input
                    className="pixel-input"
                    type="text"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="E.G. 300G"
                    required
                  />
                </div>

                <div className="pixel-field">
                  <label className="pixel-label">GRIP SIZE</label>
                  <select
                    className="pixel-select"
                    value={gripSize}
                    onChange={e => setGripSize(e.target.value)}
                  >
                    <option value="G1">G1</option>
                    <option value="G2">G2</option>
                    <option value="G3">G3</option>
                    <option value="G4">G4</option>
                    <option value="G5">G5</option>
                  </select>
                </div>

                <div className="pixel-field">
                  <label className="pixel-label">PRICE (KD)</label>
                  <input
                    className="pixel-input"
                    type="text"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="E.G. KD 45.000"
                    required
                  />
                </div>

                <div className="pixel-field">
                  <label className="pixel-label">WHATSAPP NUMBER</label>
                  <input
                    className="pixel-input"
                    type="tel"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="E.G. 99001234"
                    required
                  />
                </div>

                <div className="pixel-field">
                  <label className="pixel-label">PHOTO</label>
                  <label className="pixel-file-label">
                    {photo ? '✓ FILE SELECTED' : 'CHOOSE PHOTO'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => setPhoto(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {photo && (
                    <span className="pixel-file-name">{photo.name}</span>
                  )}
                </div>

                {error && <p className="pixel-error">{error}</p>}

                <button className="pixel-submit" type="submit" disabled={submitting}>
                  {submitting ? 'UPLOADING...' : 'POST LISTING'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="crt-label" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
        NUQTA
      </div>
    </div>
  );
}
