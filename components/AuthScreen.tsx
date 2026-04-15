'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

type Mode = 'login' | 'signup';

export default function AuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getSupabase();

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message.toUpperCase());
        setLoading(false);
      } else {
        router.push('/sell');
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message.toUpperCase());
        setLoading(false);
      } else {
        setSignedUp(true);
        setLoading(false);
      }
    }
  }, [mode, email, password, name, router]);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    setError(null);
  }, []);

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
          <button className="auth-back" onClick={() => router.push('/')}>
            ◄ BACK
          </button>

          {signedUp ? (
            <p className="pixel-message">
              CHECK YOUR EMAIL<br />TO CONFIRM<br />YOUR ACCOUNT
            </p>
          ) : (
            <>
              <div className="auth-tabs">
                <button
                  className={`auth-tab${mode === 'login' ? ' active' : ''}`}
                  onClick={() => switchMode('login')}
                >
                  LOGIN
                </button>
                <button
                  className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
                  onClick={() => switchMode('signup')}
                >
                  SIGN UP
                </button>
              </div>

              <form className="pixel-form" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                  <div className="pixel-field">
                    <label className="pixel-label">FULL NAME</label>
                    <input
                      className="pixel-input"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="pixel-field">
                  <label className="pixel-label">EMAIL</label>
                  <input
                    className="pixel-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="pixel-field">
                  <label className="pixel-label">PASSWORD</label>
                  <input
                    className="pixel-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>

                {error && <p className="pixel-error">{error}</p>}

                <button className="pixel-submit" type="submit" disabled={loading}>
                  {loading ? 'LOADING...' : mode === 'login' ? 'LOGIN' : 'SIGN UP'}
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
