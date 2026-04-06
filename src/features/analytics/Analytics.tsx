import { useState } from 'react';
import BodyMetricsTab from './BodyMetricsTab';
import StrengthTab from './StrengthTab';
import TrainingLoadTab from './TrainingLoadTab';
import CardioTab from './CardioTab';

const TABS = [
  { id: 'body', label: 'Body Metrics', emoji: '⚖️' },
  { id: 'strength', label: 'Strength', emoji: '🏋️' },
  { id: 'load', label: 'Training Load', emoji: '📈' },
  { id: 'cardio', label: 'Cardio', emoji: '🏃' },
];

export default function Analytics() {
  const [tab, setTab] = useState('body');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '28px 32px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--txt)', margin: '0 0 4px' }}>Analytics & Progress</h1>
        <p style={{ fontSize: 13, color: 'var(--txt3)', margin: 0 }}>Comprehensive data analysis across all fitness dimensions</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexShrink: 0, background: 'var(--bg3)', padding: 4, borderRadius: 12, alignSelf: 'flex-start' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s',
              background: tab === t.id ? 'var(--violet)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--txt3)',
              boxShadow: tab === t.id ? '0 2px 12px rgba(124,92,252,0.3)' : 'none',
            }}
          >
            <span style={{ fontSize: 14 }}>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        {tab === 'body' && <BodyMetricsTab />}
        {tab === 'strength' && <StrengthTab />}
        {tab === 'load' && <TrainingLoadTab />}
        {tab === 'cardio' && <CardioTab />}
      </div>
    </div>
  );
}
