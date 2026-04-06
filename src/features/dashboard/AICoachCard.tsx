import { mockAIInsights } from '../../shared/lib/mockData';

const typeStyles: Record<string, { borderColor: string; tagColor: string; tagLabel: string }> = {
  performance: { borderColor: 'var(--violet)', tagColor: 'var(--violet2)', tagLabel: 'Performance' },
  warning:     { borderColor: 'var(--orange)', tagColor: 'var(--orange)',   tagLabel: 'Recovery Alert' },
  nutrition:   { borderColor: 'var(--mint)',   tagColor: 'var(--mint)',     tagLabel: 'Nutrition Win' },
};

export default function AICoachCard() {
  return (
    <div
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,var(--violet),var(--mint))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="white" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>AI Coach</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)' }}>Powered by FitTrackPro Intelligence</div>
        </div>
      </div>

      {/* Insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mockAIInsights.map(insight => {
          const style = typeStyles[insight.type] ?? typeStyles.performance;
          return (
            <div
              key={insight.id}
              style={{ padding: 12, background: 'var(--bg3)', borderRadius: 10, borderLeft: `3px solid ${style.borderColor}`, fontSize: 12, color: 'var(--txt2)', lineHeight: 1.5, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg4)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--txt)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--txt2)'; }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: style.tagColor, marginBottom: 4 }}>{style.tagLabel}</div>
              {insight.message}
            </div>
          );
        })}
      </div>

      {/* Chat CTA */}
      <button
        style={{ width: '100%', padding: 10, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--txt2)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,92,252,0.1)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--violet2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg3)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--txt2)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Chat with AI Coach
      </button>
    </div>
  );
}
