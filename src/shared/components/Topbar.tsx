import { useAppStore } from '../stores/appStore';

export default function Topbar() {
  const { setCommandPaletteOpen } = useAppStore();
  const now = new Date();
  const dayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 11, color: 'var(--txt3)', fontWeight: 400, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{dayStr}</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>{greeting}, Alex 👋</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Command palette trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12, color: 'var(--txt2)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--violet2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--txt2)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          Search anything
          <span style={{ padding: '2px 6px', background: 'var(--bg5)', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--txt3)' }}>⌘K</span>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative', width: 36, height: 36, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--txt2)" strokeWidth="1.8" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: 'var(--orange)', borderRadius: '50%', border: '2px solid var(--bg)' }} />
        </div>

        {/* User avatar */}
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--violet),var(--mint))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          AR
        </div>
      </div>
    </div>
  );
}
