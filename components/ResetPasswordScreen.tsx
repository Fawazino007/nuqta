'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    // Also check existing session (user may already be in recovery state)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      return;
    }
    setLoading(true);
    const { error } = await getSupabase().auth.updateUser({ password });
    if (error) {
      setError(error.message.toUpperCase());
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
      setTimeout(() => router.push('/auth'), 2000);
    }
  }, [password, confirmPassword, router]);

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

        <div className="auth-screen">
          {!ready && (
            <p className="market-name loading-blink" style={{ marginTop: '80px' }}>
              LOADING...
            </p>
          )}

          {ready && done && (
            <div style={{ marginTop: '80px', textAlign: 'center' }}>
              <p className="pixel-message">PASSWORD UPDATED</p>
            </div>
          )}

          {ready && !done && (
            <>
              <p className="auth-title" style={{ marginTop: '44px' }}>
                NEW PASSWORD
              </p>

              <form className="pixel-form" onSubmit={handleSubmit}>
                <div className="pixel-field">
                  <label className="pixel-label">NEW PASSWORD</label>
                  <input
                    className="pixel-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div className="pixel-field">
                  <label className="pixel-label">CONFIRM PASSWORD</label>
                  <input
                    className="pixel-input"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                {error && <p className="pixel-error">{error}</p>}

                <button className="pixel-submit" type="submit" disabled={loading}>
                  {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
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
