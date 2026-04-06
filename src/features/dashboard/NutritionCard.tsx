import { useEffect, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import { pct } from '../../shared/lib/utils';

export default function NutritionCard() {
  const { todayNutrition, incrementWater } = useAppStore();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(t);
  }, []);

  const macros = [
    { label: 'Protein', consumed: todayNutrition.protein.consumed, target: todayNutrition.protein.target, color: 'linear-gradient(90deg,#ff6b35,#ff9f7a)', valColor: '#ff9f7a' },
    { label: 'Carbs',   consumed: todayNutrition.carbs.consumed,   target: todayNutrition.carbs.target,   color: 'linear-gradient(90deg,#4a90e2,#7ab8ff)', valColor: '#7ab8ff' },
    { label: 'Fat',     consumed: todayNutrition.fat.consumed,      target: todayNutrition.fat.target,      color: 'linear-gradient(90deg,#f5c842,#ffd97a)', valColor: '#ffd97a' },
  ];

  const remaining = todayNutrition.calories.target - todayNutrition.calories.consumed;

  return (
    <div
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700 }}>Today's Nutrition</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>Macro tracking</div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--violet2)', cursor: 'pointer' }}>+ Log Meal</span>
      </div>

      {/* Macro top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {macros.map(m => (
          <div key={m.label} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 17, fontWeight: 500, color: m.valColor }}>{m.consumed}g</div>
            <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Macro bars */}
      <div>
        {macros.map(m => (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11, color: 'var(--txt3)' }}>
              <span>{m.label}</span>
              <span>{m.consumed} / {m.target}g</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg5)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', borderRadius: 99, background: m.color, width: animated ? `${pct(m.consumed, m.target)}%` : '0%', transition: 'width 1.5s cubic-bezier(.4,0,.2,1)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Calorie summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 500, color: 'var(--orange)' }}>{todayNutrition.calories.consumed.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 1 }}>kcal consumed</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'var(--mint)' }}>{remaining}</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)' }}>kcal remaining</div>
        </div>
      </div>

      {/* Water tracker */}
      <div>
        <div style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Water Intake</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: 8 }, (_, i) => {
            const filled = i < todayNutrition.water;
            return (
              <div
                key={i}
                onClick={incrementWater}
                title={`${i + 1} of 8 cups`}
                style={{
                  width: 28, height: 32, borderRadius: 4,
                  border: `1.5px solid ${filled ? 'var(--violet)' : 'var(--bg5)'}`,
                  background: filled ? 'rgba(124,92,252,0.25)' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'flex-end', padding: 2,
                }}
                onMouseEnter={e => !filled && ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)')}
                onMouseLeave={e => !filled && ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--bg5)')}
              >
                {filled && <div style={{ width: '100%', height: '70%', background: 'var(--violet)', borderRadius: 2, opacity: 0.7 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 6 }}>{todayNutrition.water} of 8 cups · {(todayNutrition.water * 250)}ml</div>
      </div>
    </div>
  );
}
