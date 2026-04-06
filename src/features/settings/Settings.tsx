import { useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore';

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

const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none' };
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--txt2)', marginBottom: 6, display: 'block' };

function AccountTab() {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <SectionTitle>Account Details</SectionTitle>
      <SectionSub>Update your profile information</SectionSub>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 540 }}>
        {[{ label: 'Full Name', val: 'Alex Rivera' }, { label: 'Username', val: 'alexrivera' }, { label: 'Email address', val: 'alex.rivera@email.com' }, { label: 'Phone (optional)', val: '' }].map(f => (
          <div key={f.label}>
            <label style={labelStyle}>{f.label}</label>
            <input defaultValue={f.val} placeholder={f.val || 'Optional'} style={inputStyle} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, maxWidth: 540 }}>
        <label style={labelStyle}>Bio</label>
        <textarea defaultValue="Intermediate lifter focused on hypertrophy. PPL 5x/week. Always chasing PRs." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
      </div>
      <button onClick={save} style={{ marginTop: 20, padding: '11px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, background: 'var(--violet)', color: '#fff', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(124,92,252,0.35)' }}>
        {saved ? '✓ Changes Saved' : 'Save Changes'}
      </button>

      <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
        <SectionTitle>Change Password</SectionTitle>
        <SectionSub>Use a strong password with a mix of characters</SectionSub>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 340 }}>
          {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
            <div key={l}><label style={labelStyle}>{l}</label><input type="password" placeholder="••••••••" style={inputStyle} /></div>
          ))}
          <button style={{ padding: '11px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--txt)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', marginTop: 4 }}>Update Password</button>
        </div>
      </div>
    </div>
  );
}

function UnitsTab() {
  const [units, setUnits] = useState('metric');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [startDay, setStartDay] = useState('Monday');
  const [toggles, setToggles] = useState({ darkMode: true, compactView: false, animations: true });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <SectionTitle>Units & Measurements</SectionTitle>
        <SectionSub>Choose your preferred unit system</SectionSub>
        <div style={{ display: 'flex', gap: 12, maxWidth: 400 }}>
          {[{ id: 'metric', label: 'Metric', sub: 'kg, cm, km' }, { id: 'imperial', label: 'Imperial', sub: 'lbs, in, mi' }].map(u => (
            <div key={u.id} onClick={() => setUnits(u.id)} style={{ flex: 1, padding: '16px', borderRadius: 12, border: `2px solid ${units === u.id ? 'var(--violet)' : 'var(--border)'}`, background: units === u.id ? 'rgba(124,92,252,0.1)' : 'var(--bg3)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: units === u.id ? 'var(--violet2)' : 'var(--txt)', marginBottom: 4 }}>{u.label}</div>
              <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{u.sub}</div>
            </div>
          ))}
        </div>
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
    { title: 'Training', items: [{ key: 'workoutReminder' as const, label: 'Workout Reminders', desc: 'Daily reminder when your next session is due' }, { key: 'prAlerts' as const, label: 'PR Alerts', desc: 'Notify me when I set a new personal record' }, { key: 'streakWarning' as const, label: 'Streak Warning', desc: 'Alert me if I\'m about to break my streak' }] },
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

  const groups = ['Wearables', 'Nutrition'];

  return (
    <div>
      <SectionTitle>Third-Party Integrations</SectionTitle>
      <SectionSub>Connect your devices and apps to automatically sync data</SectionSub>
      {groups.map(group => (
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
  return (
    <div>
      <SectionTitle>Subscription</SectionTitle>
      <SectionSub>Manage your plan and billing</SectionSub>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(124,92,252,0.15),rgba(0,229,160,0.08))', border: '1px solid rgba(124,92,252,0.3)', marginBottom: 28 }}>
        <div style={{ fontSize: 22 }}>🚀</div>
        <div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--violet2)' }}>Pro Plan — Active</div>
          <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2 }}>$12.99/month · Renews May 6, 2026</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, maxWidth: 660, marginBottom: 28 }}>
        {[
          { name: 'Free', price: '$0', features: ['3 workouts/week', 'Basic nutrition log', 'Community access'], current: false },
          { name: 'Pro', price: '$12.99', features: ['Unlimited workouts', 'Full nutrition tracker', 'AI Coach access', 'Advanced analytics', 'Priority support'], current: true },
          { name: 'Elite', price: '$24.99', features: ['Everything in Pro', 'Custom programming', 'Monthly coach call', 'Team management', 'API access'], current: false },
        ].map(plan => (
          <div key={plan.name} style={{ padding: '20px', borderRadius: 14, border: `2px solid ${plan.current ? 'var(--violet)' : 'var(--border)'}`, background: plan.current ? 'rgba(124,92,252,0.08)' : 'var(--bg3)', position: 'relative' }}>
            {plan.current && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--violet)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 99 }}>CURRENT</div>}
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: plan.current ? 'var(--violet2)' : 'var(--txt)', marginBottom: 4 }}>{plan.name}</div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--txt)', marginBottom: 14 }}>{plan.price}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--txt3)' }}>/mo</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plan.features.map(f => <div key={f} style={{ fontSize: 12, color: 'var(--txt2)', display: 'flex', gap: 6 }}><span style={{ color: 'var(--mint)' }}>✓</span>{f}</div>)}
            </div>
            {!plan.current && <button style={{ width: '100%', marginTop: 14, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--violet)', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'Syne,sans-serif' }}>{plan.name === 'Free' ? 'Downgrade' : 'Upgrade'}</button>}
          </div>
        ))}
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
        {tab === 'account' && <AccountTab />}
        {tab === 'units' && <UnitsTab />}
        {tab === 'notifications' && <NotificationsTab />}
        {tab === 'integrations' && <IntegrationsTab />}
        {tab === 'subscription' && <SubscriptionTab />}
        {tab === 'danger' && <DangerTab />}
      </div>
    </div>
  );
}
