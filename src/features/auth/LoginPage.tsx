import { useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore';

interface Props { onSwitchToSignup: () => void }

const S = {
  input: {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
  } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 500, color: 'var(--txt2)', marginBottom: 6, display: 'block' } as React.CSSProperties,
};

export default function LoginPage({ onSwitchToSignup }: Props) {
  const { login, loginWithGoogle, authError, clearAuthError, authLoading } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const loading = localLoading || googleLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalLoading(true);
    try {
      await login(email, password);
    } catch {
      // error shown via authError in store
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearAuthError();
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // error shown via authError in store
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Left: Branding Panel ── */}
      <div style={{
        flex: '0 0 48%', background: 'linear-gradient(145deg,#070710 0%,#0f0e24 40%,#0a1a12 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 64px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '15%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,92,252,0.18) 0%,transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,229,160,0.12) 0%,transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56, zIndex: 1 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,var(--violet),var(--mint))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(124,92,252,0.4)' }}>
            <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
              <path d="M6 12h4m4 0h4M10 12V8m4 4v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <rect x="2" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.8" />
              <rect x="18" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.8" />
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--txt)', letterSpacing: '-0.5px' }}>
            Fit<span style={{ color: 'var(--violet2)' }}>Track</span>Pro
          </span>
        </div>

        <div style={{ zIndex: 1, textAlign: 'center', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--txt)', lineHeight: 1.15, margin: 0 }}>
            Train smarter.<br />
            <span style={{ background: 'linear-gradient(90deg,var(--violet2),var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Perform better.
            </span>
          </h1>
        </div>
        <p style={{ fontSize: 15, color: 'var(--txt2)', textAlign: 'center', maxWidth: 340, lineHeight: 1.75, marginBottom: 48, zIndex: 1 }}>
          The AI-powered fitness OS for serious athletes. Track every lift, optimize every meal, and unlock your peak performance.
        </p>

        <div style={{ display: 'flex', gap: 12, zIndex: 1 }}>
          {[{ label: 'Active Athletes', val: '50K+' }, { label: 'PRs Logged', val: '2.1M' }, { label: 'Avg Rating', val: '4.9 ★' }].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--txt)' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 3, whiteSpace: 'nowrap' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
      </div>

      {/* ── Right: Form Panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 80px', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--txt)', margin: '0 0 8px' }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: 'var(--txt3)', margin: 0 }}>Enter your credentials to access your dashboard</p>
          </div>

          {/* Error banner */}
          {authError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,59,92,0.12)', border: '1px solid rgba(255,59,92,0.25)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={S.label}>Email address</label>
              <input
                id="login-email"
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com" disabled={loading}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                style={{ ...S.input, borderColor: focused === 'email' ? 'var(--violet)' : 'rgba(255,255,255,0.1)' }}
              />
            </div>
            <div>
              <label style={S.label}>Password</label>
              <input
                id="login-password"
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" disabled={loading}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)}
                style={{ ...S.input, borderColor: focused === 'pass' ? 'var(--violet)' : 'rgba(255,255,255,0.1)' }}
              />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--violet2)', cursor: 'pointer' }}>Forgot password?</span>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit" disabled={loading || authLoading}
              style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '0.3px', background: loading ? 'rgba(124,92,252,0.4)' : 'linear-gradient(135deg,var(--violet),#5a3fd4)', color: '#fff', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 24px rgba(124,92,252,0.35)' }}
            >
              {localLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--txt3)' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            id="login-google"
            onClick={handleGoogle} disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', cursor: loading ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,0.04)', color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
            {googleLoading ? 'Signing in with Google…' : 'Continue with Google'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--txt3)' }}>
            New to FitTrackPro?{' '}
            <span onClick={onSwitchToSignup} style={{ color: 'var(--violet2)', cursor: 'pointer', fontWeight: 600 }}>Create an account</span>
          </p>
        </div>
      </div>
    </div>
  );
}
