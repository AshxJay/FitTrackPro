import { useState } from 'react';
import { useAppStore } from '../stores/appStore';

const navItems = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'workouts', label: 'Workouts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <path d="M6 12h4m4 0h4M10 12V8m4 4v4" />
        <rect x="2" y="10" width="4" height="4" rx="1" /><rect x="18" y="10" width="4" height="4" rx="1" />
      </svg>
    ),
  },
  {
    id: 'log', label: 'Log Session',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: 'nutrition', label: 'Nutrition',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <path d="M3 6h18M3 12h12M3 18h8" />
      </svg>
    ),
  },
  {
    id: 'analytics', label: 'Analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: 'social', label: 'Community',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'ai-coach', label: 'AI Coach',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeOpacity="0.5" />
      </svg>
    ),
  },
];

const bottomItems = [
  {
    id: 'profile', label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: 'settings', label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93A10 10 0 1 0 4.93 19.07" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, user } = useAppStore();
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? 220 : 72,
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        gap: 4,
        flexShrink: 0,
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0 20px', width: '100%', justifyContent: 'center', borderBottom: '1px solid var(--border)', marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ width: 36, height: 36, flexShrink: 0, background: 'linear-gradient(135deg,var(--violet),var(--mint))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M6 12h4m4 0h4M10 12V8m4 4v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="2" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.7" />
            <rect x="18" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.7" />
          </svg>
        </div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, transition: 'opacity 0.2s', letterSpacing: '-0.3px', color: 'var(--txt)' }}>
          Fit<span style={{ color: 'var(--violet2)' }}>Track</span>Pro
        </span>
      </div>

      {/* Nav items */}
      {navItems.map((item) => (
        <NavItem key={item.id} item={item} active={activeTab === item.id} expanded={expanded} onClick={() => setActiveTab(item.id)} />
      ))}

      <div style={{ flex: 1 }} />

      {bottomItems.map((item) => (
        <NavItem key={item.id} item={item} active={activeTab === item.id} expanded={expanded} onClick={() => setActiveTab(item.id)} />
      ))}

      {/* User avatar */}
      <div style={{ marginTop: 12, width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--violet),var(--mint))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
        {user?.displayName ? user.displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AR'}
      </div>
    </nav>
  );
}

function NavItem({ item, active, expanded, onClick }: { item: typeof navItems[0]; active: boolean; expanded: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 'calc(100% - 12px)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 0 10px 18px',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
        color: active ? 'var(--violet2)' : 'var(--txt3)',
        background: active ? 'rgba(124,92,252,0.15)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      {active && (
        <div style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: 3, background: 'var(--violet)', borderRadius: '0 3px 3px 0' }} />
      )}
      <div style={{ width: 20, height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', opacity: expanded ? 1 : 0, transition: 'opacity 0.15s', fontFamily: 'DM Sans, sans-serif' }}>
        {item.label}
      </span>
    </div>
  );
}
