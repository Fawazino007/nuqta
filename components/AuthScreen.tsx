'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'forgot';

const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;

function validateUsername(u: string): string | null {
  if (u.length < 3) return 'USERNAME TOO SHORT (MIN 3)';
  if (u.length > 20) return 'USERNAME TOO LONG (MAX 20)';
  if (!/^[a-z]/.test(u)) return 'USERNAME MUST START WITH A LETTER';
  if (!USERNAME_RE.test(u)) return 'ONLY LETTERS, NUMBERS, UNDERSCORES';
  return null;
}

export default function AuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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

  const handleUsernameChange = useCallback((val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    if (cleaned.length > 0) {
      setUsernameError(validateUsername(cleaned));
    } else {
      setUsernameError(null);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = getSupabase();

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://getnuqta.com/reset-password',
      });
      if (error) {
        setError(error.message.toUpperCase());
        setLoading(false);
      } else {
        setResetSent(true);
        setLoading(false);
      }
      return;
    }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message.toUpperCase());
        setLoading(false);
      } else {
        router.push('/marketplace');
      }
    } else {
      const validationErr = validateUsername(username);
      if (validationErr) {
        setUsernameError(validationErr);
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('PASSWORDS DO NOT MATCH');
        setLoading(false);
        return;
      }

      // Check username uniqueness
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      if (existing) {
        setError('USERNAME TAKEN');
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (signUpError) {
        setError(signUpError.message.toUpperCase());
        setLoading(false);
        return;
      }

      // users row is created automatically by a Postgres trigger on auth.users
      setSignedUp(true);
      setLoading(false);
    }
  }, [mode, email, password, confirmPassword, username, router]);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    setError(null);
    setResetSent(false);
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
          ) : resetSent ? (
            <p className="pixel-message">
              CHECK YOUR EMAIL<br />FOR RESET LINK
            </p>
          ) : mode === 'forgot' ? (
            <>
              <p className="auth-title" style={{ marginTop: '44px' }}>
                RESET PASSWORD
              </p>
              <form className="pixel-form" onSubmit={handleSubmit}>
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

                {error && <p className="pixel-error">{error}</p>}

                <button className="pixel-submit" type="submit" disabled={loading}>
                  {loading ? 'SENDING...' : 'SEND RESET LINK'}
                </button>

                <button
                  type="button"
                  className="pixel-forgot"
                  onClick={() => switchMode('login')}
                >
                  ◄ BACK TO LOGIN
                </button>
              </form>
            </>
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
                    <label className="pixel-label">USERNAME</label>
                    <input
                      className="pixel-input"
                      type="text"
                      value={username}
                      onChange={e => handleUsernameChange(e.target.value)}
                      placeholder="E.G. PLAYER_1"
                      required
                      autoComplete="username"
                      autoCapitalize="none"
                    />
                    {usernameError && <p className="pixel-error" style={{ marginTop: '4px' }}>{usernameError}</p>}
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

                {mode === 'signup' && (
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
                )}

                {error && <p className="pixel-error">{error}</p>}

                <button className="pixel-submit" type="submit" disabled={loading}>
                  {loading ? 'LOADING...' : mode === 'login' ? 'LOGIN' : 'SIGN UP'}
                </button>

                {mode === 'login' && (
                  <button
                    type="button"
                    className="pixel-forgot"
                    onClick={() => switchMode('forgot')}
                  >
                    FORGOT PASSWORD?
                  </button>
                )}
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
