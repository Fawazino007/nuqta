'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;

function validateUsername(u: string): string | null {
  if (u.length < 3) return 'USERNAME TOO SHORT (MIN 3)';
  if (u.length > 20) return 'USERNAME TOO LONG (MAX 20)';
  if (!/^[a-z]/.test(u)) return 'USERNAME MUST START WITH A LETTER';
  if (!USERNAME_RE.test(u)) return 'ONLY LETTERS, NUMBERS, UNDERSCORES';
  return null;
}

export default function ProfileScreen() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [ccCode, setCcCode] = useState('965');
  const [whatsappNum, setWhatsappNum] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      setAuthUser({ id: user.id, email: user.email ?? '' });
      const { data } = await supabase
        .from('users')
        .select('username, whatsapp')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setUsername(data.username ?? '');
        if (data.whatsapp) {
          const wa = (data.whatsapp as string).replace(/^\+/, '');
          // Split: try known 3-digit prefix (965), else first 3 chars
          setCcCode(wa.slice(0, 3));
          setWhatsappNum(wa.slice(3));
        }
      }
      setLoading(false);
    });
  }, [router]);

  const handleUsernameChange = useCallback((val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleaned);
    setUsernameError(cleaned.length > 0 ? validateUsername(cleaned) : null);
  }, []);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setError(null);

    const uErr = validateUsername(username);
    if (uErr) { setUsernameError(uErr); return; }

    setSaving(true);
    const supabase = getSupabase();

    // Check username uniqueness (exclude self)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', authUser.id)
      .maybeSingle();
    if (existing) {
      setError('USERNAME TAKEN');
      setSaving(false);
      return;
    }

    // Update profile row (trigger guarantees row exists)
    const whatsapp = whatsappNum ? `+${ccCode}${whatsappNum}` : null;
    const { error: updateErr } = await supabase
      .from('users')
      .update({ username, whatsapp })
      .eq('id', authUser.id);
    if (updateErr) {
      setError(updateErr.message.toUpperCase());
      setSaving(false);
      return;
    }

    setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 3000);
  }, [authUser, username, ccCode, whatsappNum]);

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
          <button className="auth-back" onClick={() => router.push('/marketplace')}>
            ◄ BACK
          </button>

          {loading && (
            <p className="market-name loading-blink" style={{ marginTop: '80px' }}>
              LOADING...
            </p>
          )}

          {!loading && (
            <>
              <p className="auth-title" style={{ marginTop: '44px' }}>
                EDIT PROFILE
              </p>

              {success && (
                <p className="pixel-message" style={{ fontSize: 'clamp(9px, 1.4vw, 12px)', marginBottom: '12px' }}>
                  PROFILE UPDATED
                </p>
              )}

              <form className="pixel-form" onSubmit={handleSave}>

                {/* ── USERNAME ── */}
                <div className="pixel-field">
                  <label className="pixel-label">USERNAME</label>
                  <input
                    className="pixel-input"
                    type="text"
                    value={username}
                    onChange={e => handleUsernameChange(e.target.value)}
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                  />
                  {usernameError && (
                    <p className="pixel-error" style={{ marginTop: '4px' }}>{usernameError}</p>
                  )}
                </div>

                {/* ── WHATSAPP ── */}
                <div className="pixel-field">
                  <label className="pixel-label">WHATSAPP NUMBER</label>
                  <div className="pixel-tel-row">
                    <input
                      className="pixel-input pixel-tel-cc"
                      type="text"
                      value={ccCode}
                      onChange={e => setCcCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="965"
                    />
                    <input
                      className="pixel-input pixel-tel-num"
                      type="tel"
                      value={whatsappNum}
                      onChange={e => setWhatsappNum(e.target.value.replace(/\D/g, ''))}
                      placeholder="99001234"
                    />
                  </div>
                </div>

                {error && <p className="pixel-error">{error}</p>}

                <button className="pixel-submit" type="submit" disabled={saving}>
                  {saving ? 'SAVING...' : 'SAVE PROFILE'}
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
