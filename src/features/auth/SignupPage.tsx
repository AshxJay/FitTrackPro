import { useState } from 'react';

interface Props {
  onSwitchToLogin: () => void;
  onSignedUp: (info: { name: string; email: string }) => void;
}

const S = {
  input: {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none', transition: 'border 0.2s',
  } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 500, color: 'var(--txt2)', marginBottom: 6, display: 'block' } as React.CSSProperties,
};

export default function SignupPage({ onSwitchToLogin, onSignedUp }: Props) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onSignedUp({ name: form.name, email: form.email });
  };

  const inputStyle = (key: string) => ({ ...S.input, borderColor: focused === key ? 'var(--violet)' : 'rgba(255,255,255,0.1)' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left branding */}
      <div style={{ flex: '0 0 48%', background: 'linear-gradient(145deg,#070710 0%,#0f0e24 40%,#0a1a12 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', right: '-10%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,229,160,0.14) 0%,transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,92,252,0.15) 0%,transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        <div style={{ zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 48 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,var(--violet),var(--mint))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(124,92,252,0.4)' }}>
              <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
                <path d="M6 12h4m4 0h4M10 12V8m4 4v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <rect x="2" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.8" />
                <rect x="18" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.8" />
              </svg>
            </div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--txt)' }}>
              Fit<span style={{ color: 'var(--violet2)' }}>Track</span>Pro
            </span>
          </div>

          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--txt)', lineHeight: 1.2, marginBottom: 20 }}>
            Your fitness journey<br />
            <span style={{ background: 'linear-gradient(90deg,var(--mint),var(--violet2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>starts here.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--txt2)', maxWidth: 320, lineHeight: 1.75, margin: '0 auto 48px' }}>
            Join 50,000+ athletes who are crushing their goals with data-driven training and AI-powered coaching.
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', maxWidth: 300, margin: '0 auto' }}>
            {[
              { icon: '🤖', text: 'AI Coach that adapts to your progress' },
              { icon: '📊', text: 'Advanced analytics & strength standards' },
              { icon: '🥗', text: 'Full nutrition tracking with macro targets' },
              { icon: '🔥', text: 'Streak tracking & personal records' },
            ].map(f => (
              <div key={f.icon} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                <span style={{ fontSize: 13, color: 'var(--txt2)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 80px', background: 'var(--bg)', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--txt)', margin: '0 0 8px' }}>Create your account</h2>
            <p style={{ fontSize: 14, color: 'var(--txt3)', margin: 0 }}>Free forever. No credit card required.</p>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,59,92,0.12)', border: '1px solid rgba(255,59,92,0.25)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={S.label}>Full name</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Rivera" onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} style={inputStyle('name')} />
            </div>
            <div>
              <label style={S.label}>Email address</label>
              <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="alex@example.com" onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} style={inputStyle('email')} />
            </div>
            <div>
              <label style={S.label}>Password</label>
              <input type="password" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)} style={inputStyle('pass')} />
            </div>
            <div>
              <label style={S.label}>Confirm password</label>
              <input type="password" required value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat your password" onFocus={() => setFocused('conf')} onBlur={() => setFocused(null)} style={inputStyle('conf')} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: 4, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, background: loading ? 'rgba(0,229,160,0.3)' : 'linear-gradient(135deg,var(--mint),#00b87a)', color: '#020f09', transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 24px rgba(0,229,160,0.3)' }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--txt3)', lineHeight: 1.6 }}>
            By signing up you agree to our{' '}
            <span style={{ color: 'var(--violet2)', cursor: 'pointer' }}>Terms of Service</span> and{' '}
            <span style={{ color: 'var(--violet2)', cursor: 'pointer' }}>Privacy Policy</span>
          </p>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--txt3)' }}>
            Already have an account?{' '}
            <span onClick={onSwitchToLogin} style={{ color: 'var(--violet2)', cursor: 'pointer', fontWeight: 600 }}>Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
}
