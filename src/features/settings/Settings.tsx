import { useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import { saveBodyMetric } from '../../shared/lib/db';

type SettingsTab = 'account' | 'units' | 'notifications' | 'integrations' | 'subscription' | 'danger';

const NAV: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'units', label: 'Units & Preferences', icon: '⚖️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'integrations', label: 'Integrations', icon: '🔗' },
  { id: 'subscription', label: 'Subscription', icon: '⭐' },
  { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
];

interface ToggleProps { on: boolean; onChange: (v: boolean) => void; }
function Toggle({ on, onChange }: ToggleProps) {
  return (
    <div onClick={() => onChange(!on)} style={{ width: 44, height: 24, borderRadius: 99, background: on ? 'var(--violet)' : 'var(--bg4)', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 800, color: 'var(--txt)', marginBottom: 4 }}>{children}</div>;
}
function SectionSub({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, color: 'var(--txt3)', marginBottom: 24 }}>{children}</div>;
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none', boxSizing: 'border-box' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: 6, display: 'block' };

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function StatusBadge({ state, errorMsg }: { state: SaveState; errorMsg?: string }) {
  if (state === 'idle') return null;
  const configs = {
    saving: { bg: 'rgba(124,92,252,0.15)', color: 'var(--violet2)', text: 'Saving…' },
    saved:  { bg: 'rgba(0,229,160,0.12)', color: 'var(--mint)',    text: '✓ Saved successfully' },
    error:  { bg: 'rgba(255,59,92,0.12)',  color: 'var(--red)',     text: `⚠️ ${errorMsg ?? 'Error'}` },
  };
  const cfg = configs[state];
  return (
    <div style={{ padding: '10px 16px', borderRadius: 10, background: cfg.bg, color: cfg.color, fontSize: 13, fontWeight: 600, marginTop: 14 }}>
      {cfg.text}
    </div>
  );
}

function AccountTab() {
  const { user, firebaseUser, updateUserProfile, changePassword, bodyMetrics } = useAppStore();

  // Profile state — pre-filled from real user data
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [profileState, setProfileState] = useState<SaveState>('idle');
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwState, setPwState] = useState<SaveState>('idle');
  const [pwError, setPwError] = useState('');

  // Body metrics state
  const [weight, setWeight] = useState(user?.stats.weight?.toString() ?? '');
  const [height, setHeight] = useState(user?.stats.height?.toString() ?? '');
  const [age, setAge] = useState(user?.stats.age?.toString() ?? '');
  const [bodyFat, setBodyFat] = useState('');
  const [metricsState, setMetricsState] = useState<SaveState>('idle');
  const [metricsError, setMetricsError] = useState('');

  const isGoogleUser = firebaseUser?.providerData?.[0]?.providerId === 'google.com';

  const saveProfile = async () => {
    if (!displayName.trim()) return;
    setProfileState('saving');
    setProfileError('');
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        username: username.trim() || displayName.toLowerCase().replace(/\s+/g, ''),
      });
      setProfileState('saved');
      setTimeout(() => setProfileState('idle'), 3000);
    } catch (err: any) {
      setProfileError(err.message ?? 'Failed to save');
      setProfileState('error');
      setTimeout(() => setProfileState('idle'), 4000);
    }
  };

  const savePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { setPwError('All fields are required'); setPwState('error'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); setPwState('error'); return; }
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); setPwState('error'); return; }
    setPwState('saving');
    setPwError('');
    try {
      await changePassword(currentPw, newPw);
      setPwState('saved');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwState('idle'), 3000);
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Current password is incorrect'
        : err.message ?? 'Failed to update password';
      setPwError(msg);
      setPwState('error');
      setTimeout(() => setPwState('idle'), 4000);
    }
  };

  const saveBodyMetrics = async () => {
    if (!weight || !firebaseUser) return;
    setMetricsState('saving');
    setMetricsError('');
    try {
      const today = new Date().toISOString().split('T')[0];
      await saveBodyMetric(firebaseUser.uid, {
        date: today,
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      });
      // Also update stats in user profile
      await updateUserProfile({
        stats: {
          ...(user?.stats ?? { height: 175, weight: 75, age: 25, gender: 'unknown' }),
          weight: parseFloat(weight),
          height: height ? parseFloat(height) : (user?.stats.height ?? 175),
          age: age ? parseInt(age) : (user?.stats.age ?? 25),
        },
      });
      setMetricsState('saved');
      setTimeout(() => setMetricsState('idle'), 3000);
    } catch (err: any) {
      setMetricsError(err.message ?? 'Failed to save');
      setMetricsState('error');
      setTimeout(() => setMetricsState('idle'), 4000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Profile Info */}
      <div>
        <SectionTitle>Account Details</SectionTitle>
        <SectionSub>Update your profile information</SectionSub>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 540 }}>
          <div>
            <label style={labelStyle}>Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Email Address</label>
            <input value={user?.email ?? ''} readOnly style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
        </div>
        <button
          onClick={saveProfile}
          disabled={profileState === 'saving'}
          style={{ marginTop: 20, padding: '11px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, background: 'var(--violet)', color: '#fff', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(124,92,252,0.35)', opacity: profileState === 'saving' ? 0.7 : 1 }}
        >
          {profileState === 'saving' ? 'Saving…' : 'Save Profile'}
        </button>
        <StatusBadge state={profileState} errorMsg={profileError} />
      </div>

      {/* Body & Measurements */}
      <div style={{ paddingTop: 28, borderTop: '1px solid var(--border)' }}>
        <SectionTitle>Body & Measurements</SectionTitle>
        <SectionSub>Log your body metrics to track progress over time</SectionSub>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 540 }}>
          {[
            { label: 'Weight (kg)', value: weight, setter: setWeight, placeholder: '82.0', type: 'number' },
            { label: 'Height (cm)', value: height, setter: setHeight, placeholder: '180', type: 'number' },
            { label: 'Age', value: age, setter: setAge, placeholder: '28', type: 'number' },
            { label: 'Body Fat %', value: bodyFat, setter: setBodyFat, placeholder: '14.2', type: 'number' },
          ].map(f => (
            <div key={f.label}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.setter(e.target.value)}
                placeholder={f.placeholder}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveBodyMetrics}
          disabled={!weight || metricsState === 'saving'}
          style={{ marginTop: 20, padding: '11px 28px', borderRadius: 10, border: 'none', cursor: weight && metricsState !== 'saving' ? 'pointer' : 'default', fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, background: weight ? 'linear-gradient(135deg,var(--violet),#a855f7)' : 'rgba(255,255,255,0.06)', color: '#fff', transition: 'all 0.2s', opacity: metricsState === 'saving' ? 0.7 : 1 }}
        >
          {metricsState === 'saving' ? 'Logging…' : '+ Log Today\'s Metrics'}
        </button>
        <StatusBadge state={metricsState} errorMsg={metricsError} />

        {/* Recent logs */}
        {bodyMetrics.length > 0 && (
          <div style={{ marginTop: 20, maxWidth: 540 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Recent Entries</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bodyMetrics.slice(0, 5).map((m, i) => (
                <div key={m.id ?? i} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10, gap: 16 }}>
                  <span style={{ fontSize: 12, color: 'var(--txt3)', minWidth: 90 }}>{m.date}</span>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>{m.weight} kg</span>
                  {m.bodyFat && <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{m.bodyFat}% BF</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      {!isGoogleUser && (
        <div style={{ paddingTop: 28, borderTop: '1px solid var(--border)' }}>
          <SectionTitle>Change Password</SectionTitle>
          <SectionSub>Use a strong password with a mix of characters</SectionSub>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 340 }}>
            {[
              { label: 'Current Password', value: currentPw, setter: setCurrentPw },
              { label: 'New Password', value: newPw, setter: setNewPw },
              { label: 'Confirm New Password', value: confirmPw, setter: setConfirmPw },
            ].map(f => (
              <div key={f.label}>
                <label style={labelStyle}>{f.label}</label>
                <input type="password" value={f.value} onChange={e => f.setter(e.target.value)} placeholder="••••••••" style={inputStyle} />
              </div>
            ))}
            <button
              onClick={savePassword}
              disabled={pwState === 'saving'}
              style={{ padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--txt)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', marginTop: 4, opacity: pwState === 'saving' ? 0.7 : 1 }}
            >
              {pwState === 'saving' ? 'Updating…' : 'Update Password'}
            </button>
            <StatusBadge state={pwState} errorMsg={pwError} />
          </div>
        </div>
      )}
      {isGoogleUser && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.2)', fontSize: 13, color: 'var(--txt2)', maxWidth: 400 }}>
          🔑 You signed in with Google. Password management is handled by your Google account.
        </div>
      )}
    </div>
  );
}

function UnitsTab() {
  const { user, updateUserProfile } = useAppStore();
  const [units, setUnits] = useState(user?.units ?? 'metric');
  const [saved, setSaved] = useState(false);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [startDay, setStartDay] = useState('Monday');
  const [toggles, setToggles] = useState({ darkMode: true, compactView: false, animations: true });

  const save = async () => {
    await updateUserProfile({ units });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <SectionTitle>Units & Measurements</SectionTitle>
        <SectionSub>Choose your preferred unit system</SectionSub>
        <div style={{ display: 'flex', gap: 12, maxWidth: 400 }}>
          {[{ id: 'metric', label: 'Metric', sub: 'kg, cm, km' }, { id: 'imperial', label: 'Imperial', sub: 'lbs, in, mi' }].map(u => (
            <div key={u.id} onClick={() => setUnits(u.id as 'metric' | 'imperial')} style={{ flex: 1, padding: '16px', borderRadius: 12, border: `2px solid ${units === u.id ? 'var(--violet)' : 'var(--border)'}`, background: units === u.id ? 'rgba(124,92,252,0.1)' : 'var(--bg3)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: units === u.id ? 'var(--violet2)' : 'var(--txt)', marginBottom: 4 }}>{u.label}</div>
              <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{u.sub}</div>
            </div>
          ))}
        </div>
        <button onClick={save} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, background: saved ? 'rgba(0,229,160,0.15)' : 'var(--violet)', color: saved ? 'var(--mint)' : '#fff', transition: 'all 0.2s' }}>
          {saved ? '✓ Saved' : 'Save Units'}
        </button>
      </div>
      <div>
        <SectionTitle>Date & Time</SectionTitle>
        <SectionSub>Format preferences for dates and calendar</SectionSub>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 400 }}>
          <div>
            <label style={labelStyle}>Date Format</label>
            <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Week Starts On</label>
            <select value={startDay} onChange={e => setStartDay(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {['Monday', 'Sunday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div>
        <SectionTitle>Display Preferences</SectionTitle>
        <SectionSub>Customize the visual experience</SectionSub>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 420 }}>
          {[
            { key: 'darkMode' as const, label: 'Dark Mode', desc: 'Use dark theme (recommended for athletes)' },
            { key: 'compactView' as const, label: 'Compact View', desc: 'Reduce spacing for information density' },
            { key: 'animations' as const, label: 'UI Animations', desc: 'Enable smooth transitions and animations' },
          ].map(pref => (
            <div key={pref.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg3)', borderRadius: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', marginBottom: 2 }}>{pref.label}</div>
                <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{pref.desc}</div>
              </div>
              <Toggle on={toggles[pref.key]} onChange={v => setToggles(t => ({ ...t, [pref.key]: v }))} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({ workoutReminder: true, prAlerts: true, communityMentions: true, weeklyDigest: true, streakWarning: true, coachInsights: false, newsUpdates: false });
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  const groups = [
    { title: 'Training', items: [{ key: 'workoutReminder' as const, label: 'Workout Reminders', desc: 'Daily reminder when your next session is due' }, { key: 'prAlerts' as const, label: 'PR Alerts', desc: 'Notify me when I set a new personal record' }, { key: 'streakWarning' as const, label: 'Streak Warning', desc: "Alert me if I'm about to break my streak" }] },
    { title: 'AI & Insights', items: [{ key: 'coachInsights' as const, label: 'AI Coach Insights', desc: 'Weekly analysis and suggestions from your AI coach' }] },
    { title: 'Community', items: [{ key: 'communityMentions' as const, label: 'Mentions & Comments', desc: 'When someone replies to or likes your posts' }] },
    { title: 'General', items: [{ key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Summary of your weekly performance every Sunday' }, { key: 'newsUpdates' as const, label: 'Product Updates', desc: 'New features and improvements to FitTrackPro' }] },
  ];

  return (
    <div>
      <SectionTitle>Notification Preferences</SectionTitle>
      <SectionSub>Choose which notifications you'd like to receive</SectionSub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {groups.map(g => (
          <div key={g.title}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{g.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {g.items.map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg3)', borderRadius: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{item.desc}</div>
                  </div>
                  <Toggle on={prefs[item.key]} onChange={() => toggle(item.key)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const [connected, setConnected] = useState<string[]>([]);
  const toggle = (name: string) => setConnected(p => p.includes(name) ? p.filter(x => x !== name) : [...p, name]);

  const integrations = [
    { name: 'Apple Health', icon: '❤️', desc: 'Sync workouts, steps, and heart rate data', category: 'Wearables' },
    { name: 'Google Fit', icon: '💚', desc: 'Import Android health and activity tracking data', category: 'Wearables' },
    { name: 'Garmin Connect', icon: '🟠', desc: 'GPS runs, VO₂max, sleep, and HRV metrics', category: 'Wearables' },
    { name: 'Whoop', icon: '💪', desc: 'Recovery score, strain, and sleep coach data', category: 'Wearables' },
    { name: 'MyFitnessPal', icon: '🥗', desc: 'Import your existing food diary and recipes', category: 'Nutrition' },
    { name: 'Cronometer', icon: '🔬', desc: 'Detailed micronutrient tracking integration', category: 'Nutrition' },
  ];

  return (
    <div>
      <SectionTitle>Third-Party Integrations</SectionTitle>
      <SectionSub>Connect your devices and apps to automatically sync data</SectionSub>
      {['Wearables', 'Nutrition'].map(group => (
        <div key={group} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{group}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {integrations.filter(i => i.category === group).map(item => {
              const isConnected = connected.includes(item.name);
              return (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', padding: '16px 18px', background: 'var(--bg3)', borderRadius: 12, border: `1px solid ${isConnected ? 'var(--mint)' : 'var(--border)'}`, transition: 'all 0.2s', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isConnected ? 'rgba(0,229,160,0.12)' : 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--txt)', marginBottom: 3 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{item.desc}</div>
                  </div>
                  <button onClick={() => toggle(item.name)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 12, fontWeight: 700, background: isConnected ? 'rgba(0,229,160,0.12)' : 'var(--violet)', color: isConnected ? 'var(--mint)' : '#fff', transition: 'all 0.2s', flexShrink: 0 }}>
                    {isConnected ? '✓ Connected' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SubscriptionTab() {
  const { user } = useAppStore();
  const plan = user?.subscription ?? 'free';
  return (
    <div>
      <SectionTitle>Subscription</SectionTitle>
      <SectionSub>Manage your plan and billing</SectionSub>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(124,92,252,0.15),rgba(0,229,160,0.08))', border: '1px solid rgba(124,92,252,0.3)', marginBottom: 28 }}>
        <div style={{ fontSize: 22 }}>{plan === 'elite' ? '💎' : plan === 'pro' ? '🚀' : '⚡'}</div>
        <div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--violet2)' }}>{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — Active</div>
          <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2 }}>{plan === 'free' ? 'Free forever' : '$12.99/month · Renews May 6, 2026'}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, maxWidth: 660, marginBottom: 28 }}>
        {[
          { name: 'free', label: 'Free', price: '$0', features: ['3 workouts/week', 'Basic nutrition log', 'Community access'] },
          { name: 'pro', label: 'Pro', price: '$12.99', features: ['Unlimited workouts', 'Full nutrition tracker', 'AI Coach access', 'Advanced analytics', 'Priority support'] },
          { name: 'elite', label: 'Elite', price: '$24.99', features: ['Everything in Pro', 'Custom programming', 'Monthly coach call', 'Team management', 'API access'] },
        ].map(p => {
          const isCurrent = plan === p.name;
          return (
            <div key={p.name} style={{ padding: '20px', borderRadius: 14, border: `2px solid ${isCurrent ? 'var(--violet)' : 'var(--border)'}`, background: isCurrent ? 'rgba(124,92,252,0.08)' : 'var(--bg3)', position: 'relative' }}>
              {isCurrent && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--violet)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 99 }}>CURRENT</div>}
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: isCurrent ? 'var(--violet2)' : 'var(--txt)', marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--txt)', marginBottom: 14 }}>{p.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--txt3)' }}>/mo</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.features.map(f => <div key={f} style={{ fontSize: 12, color: 'var(--txt2)', display: 'flex', gap: 6 }}><span style={{ color: 'var(--mint)' }}>✓</span>{f}</div>)}
              </div>
              {!isCurrent && <button style={{ width: '100%', marginTop: 14, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--violet)', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'Syne,sans-serif' }}>{p.name === 'free' ? 'Downgrade' : 'Upgrade'}</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DangerTab() {
  const { logout } = useAppStore();
  const [confirm, setConfirm] = useState('');
  const [resetDone, setResetDone] = useState(false);

  return (
    <div>
      <SectionTitle>Danger Zone</SectionTitle>
      <SectionSub>Irreversible actions — proceed with caution</SectionSub>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 540 }}>
        <div style={{ padding: '20px', borderRadius: 14, border: '1px solid rgba(255,107,53,0.25)', background: 'rgba(255,107,53,0.06)' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--orange)', marginBottom: 4 }}>Reset All Data</div>
          <div style={{ fontSize: 13, color: 'var(--txt3)', marginBottom: 14, lineHeight: 1.6 }}>Clear all workouts, nutrition logs, measurements, and progress data. Your account will remain active.</div>
          <button onClick={() => { setResetDone(true); setTimeout(() => setResetDone(false), 3000); }} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,107,53,0.4)', background: 'transparent', color: 'var(--orange)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            {resetDone ? '✓ Data reset (demo)' : 'Reset My Data'}
          </button>
        </div>
        <div style={{ padding: '20px', borderRadius: 14, border: '1px solid rgba(255,59,92,0.25)', background: 'rgba(255,59,92,0.06)' }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--red)', marginBottom: 4 }}>Delete Account</div>
          <div style={{ fontSize: 13, color: 'var(--txt3)', marginBottom: 14, lineHeight: 1.6 }}>Permanently delete your account and all associated data. This action cannot be undone.</div>
          <label style={{ ...labelStyle, marginBottom: 8 }}>Type <strong>DELETE</strong> to confirm</label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE" style={{ ...inputStyle, maxWidth: 200, marginBottom: 12 }} />
          <br />
          <button disabled={confirm !== 'DELETE'} onClick={logout} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', cursor: confirm === 'DELETE' ? 'pointer' : 'default', background: confirm === 'DELETE' ? 'var(--red)' : 'rgba(255,59,92,0.15)', color: confirm === 'DELETE' ? '#fff' : 'rgba(255,59,92,0.4)', fontSize: 13, fontWeight: 700, transition: 'all 0.2s' }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState<SettingsTab>('account');
  const { logout } = useAppStore();

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '28px 32px 0', gap: 28 }}>
      {/* Left sidebar */}
      <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 32 }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--txt)', marginBottom: 20 }}>Settings</div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: tab === n.id ? 700 : 500, background: tab === n.id ? 'rgba(124,92,252,0.15)' : 'transparent', color: tab === n.id ? 'var(--violet2)' : 'var(--txt3)', transition: 'all 0.2s' }}>
            <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,59,92,0.08)', color: 'var(--red)', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', marginBottom: 24 }}>
          🚪 Sign Out
        </button>
      </div>

      {/* Right content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 48 }}>
        {tab === 'account'       && <AccountTab />}
        {tab === 'units'         && <UnitsTab />}
        {tab === 'notifications' && <NotificationsTab />}
        {tab === 'integrations'  && <IntegrationsTab />}
        {tab === 'subscription'  && <SubscriptionTab />}
        {tab === 'danger'        && <DangerTab />}
      </div>
    </div>
  );
}
