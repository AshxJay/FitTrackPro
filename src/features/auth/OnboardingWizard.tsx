import { useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import { updateUserProfile } from '../../shared/lib/db';

// name passed via props removed, we fetch from store user if available

type Goal = 'build_muscle' | 'lose_fat' | 'endurance' | 'athletic' | 'general';
type Level = 'beginner' | 'intermediate' | 'advanced' | 'elite';
type Equipment = 'bodyweight' | 'minimal' | 'full_gym' | 'commercial';

const GOALS: { id: Goal; label: string; desc: string; emoji: string }[] = [
  { id: 'build_muscle', label: 'Build Muscle', desc: 'Hypertrophy-focused training & surplus', emoji: '💪' },
  { id: 'lose_fat', label: 'Lose Fat', desc: 'Caloric deficit with strength preservation', emoji: '🔥' },
  { id: 'endurance', label: 'Build Endurance', desc: 'VO₂max & aerobic capacity training', emoji: '🚴' },
  { id: 'athletic', label: 'Athletic Performance', desc: 'Power, speed & sport-specific training', emoji: '⚡' },
  { id: 'general', label: 'General Fitness', desc: 'Balanced health & wellness approach', emoji: '✨' },
];

const LEVELS: { id: Level; label: string; desc: string; years: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'New to structured training', years: '0–1 year' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Consistent training with good form', years: '1–3 years' },
  { id: 'advanced', label: 'Advanced', desc: 'Deep understanding of programming', years: '3–5 years' },
  { id: 'elite', label: 'Elite', desc: 'Competitive or professional athlete', years: '5+ years' },
];

const EQUIPMENT: { id: Equipment; label: string; desc: string; emoji: string }[] = [
  { id: 'bodyweight', label: 'Bodyweight Only', desc: 'No equipment needed', emoji: '🤸' },
  { id: 'minimal', label: 'Minimal Equipment', desc: 'Dumbbells & resistance bands', emoji: '🏋️' },
  { id: 'full_gym', label: 'Full Home Gym', desc: 'Rack, barbell, cables', emoji: '🏠' },
  { id: 'commercial', label: 'Commercial Gym', desc: 'Full facility access', emoji: '🏟️' },
];

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const { user, firebaseUser } = useAppStore();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [stats, setStats] = useState({ height: 175, weight: 75, age: 25, unit: 'metric' as 'metric' | 'imperial', gender: 'unknown' });
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [completing, setCompleting] = useState(false);

  const toggleEquipment = (e: Equipment) =>
    setEquipment(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const canNext = [goal !== null, level !== null, true, equipment.length > 0][step];

  const next = async () => {
    if (step < 3) { setStep(s => s + 1); return; }
    setCompleting(true);
    try {
      if (firebaseUser) {
        await updateUserProfile(firebaseUser.uid, {
          goals: goal ? [goal] : ['general'],
          experienceLevel: level ?? 'beginner',
          stats,
          equipment: equipment.length > 0 ? equipment : ['bodyweight'],
        });
      }
      onComplete?.();
    } catch (e) {
      console.error('Failed to save onboarding profile', e);
      setCompleting(false);
    }
  };

  const STEPS = ['Your Goal', 'Experience', 'Body Stats', 'Equipment'];
  const pct = ((step) / 4) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      {/* Progress Header */}
      <div style={{ width: '100%', maxWidth: 680, marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--violet),var(--mint))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M6 12h4m4 0h4M10 12V8m4 4v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <rect x="2" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.8" />
                <rect x="18" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.8" />
              </svg>
            </div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--txt)' }}>FitTrackPro</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--txt3)' }}>Step {step + 1} of 4 — {STEPS[step]}</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--violet),var(--mint))', borderRadius: 99, transition: 'width 0.4s ease' }} />
        </div>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 0, marginTop: 12 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: i === 0 ? 'flex-start' : i === STEPS.length - 1 ? 'flex-end' : 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: i <= step ? 'var(--violet)' : 'var(--bg5)', transition: 'background 0.3s', marginBottom: 4 }} />
              <span style={{ fontSize: 10, color: i === step ? 'var(--violet2)' : 'var(--txt3)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 680, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '40px', minHeight: 420 }}>
        {/* Step 0: Goal */}
        {step === 0 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--txt)', marginBottom: 8 }}>
              Hey {user?.displayName ? user.displayName.split(' ')[0] : 'Athlete'}! What's your primary goal?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--txt3)', marginBottom: 28 }}>We'll build your entire training plan around this.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {GOALS.map(g => (
                <div key={g.id} onClick={() => setGoal(g.id)} style={{ padding: '18px 20px', borderRadius: 14, border: `2px solid ${goal === g.id ? 'var(--violet)' : 'var(--border)'}`, background: goal === g.id ? 'rgba(124,92,252,0.12)' : 'var(--bg3)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: goal === g.id ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{g.emoji}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: goal === g.id ? 'var(--violet2)' : 'var(--txt)', marginBottom: 3 }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Level */}
        {step === 1 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--txt)', marginBottom: 8 }}>What's your training experience?</h2>
            <p style={{ fontSize: 14, color: 'var(--txt3)', marginBottom: 28 }}>This sets your starting weights and progression model.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LEVELS.map(l => (
                <div key={l.id} onClick={() => setLevel(l.id)} style={{ padding: '18px 24px', borderRadius: 14, border: `2px solid ${level === l.id ? 'var(--violet)' : 'var(--border)'}`, background: level === l.id ? 'rgba(124,92,252,0.1)' : 'var(--bg3)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: level === l.id ? 'var(--violet2)' : 'var(--txt)', marginBottom: 4 }}>{l.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--txt3)' }}>{l.desc}</div>
                  </div>
                  <div style={{ padding: '4px 12px', borderRadius: 99, background: level === l.id ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.04)', fontSize: 12, color: level === l.id ? 'var(--violet2)' : 'var(--txt3)', fontWeight: 600 }}>{l.years}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Body Stats */}
        {step === 2 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--txt)', marginBottom: 8 }}>Tell us about yourself</h2>
            <p style={{ fontSize: 14, color: 'var(--txt3)', marginBottom: 28 }}>Used for accurate calorie and macro calculations.</p>

            {/* Unit toggle */}
            <div style={{ display: 'inline-flex', background: 'var(--bg4)', borderRadius: 10, padding: 4, marginBottom: 28, gap: 4 }}>
              {(['metric', 'imperial'] as const).map(u => (
                <button key={u} onClick={() => setStats(s => ({ ...s, unit: u }))} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', background: stats.unit === u ? 'var(--violet)' : 'transparent', color: stats.unit === u ? '#fff' : 'var(--txt3)', transition: 'all 0.2s' }}>{u.charAt(0).toUpperCase() + u.slice(1)}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { key: 'height', label: 'Height', unit: stats.unit === 'metric' ? 'cm' : 'ft', min: stats.unit === 'metric' ? 140 : 50, max: stats.unit === 'metric' ? 220 : 80, val: stats.height, display: stats.unit === 'metric' ? `${stats.height} cm` : `${Math.floor(stats.height / 12)}′${stats.height % 12}″` },
                { key: 'weight', label: 'Weight', unit: stats.unit === 'metric' ? 'kg' : 'lbs', min: stats.unit === 'metric' ? 40 : 88, max: stats.unit === 'metric' ? 150 : 330, val: stats.weight, display: stats.unit === 'metric' ? `${stats.weight} kg` : `${stats.weight} lbs` },
                { key: 'age', label: 'Age', unit: 'years', min: 13, max: 80, val: stats.age, display: `${stats.age} years` },
              ].map(s => (
                <div key={s.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt2)' }}>{s.label}</span>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--violet2)' }}>{s.display}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} value={s.val}
                    onChange={e => setStats(prev => ({ ...prev, [s.key]: Number(e.target.value) }))}
                    style={{ width: '100%', accentColor: 'var(--violet)', height: 4, cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.min} {s.unit}</span>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{s.max} {s.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Equipment */}
        {step === 3 && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--txt)', marginBottom: 8 }}>What equipment do you have access to?</h2>
            <p style={{ fontSize: 14, color: 'var(--txt3)', marginBottom: 28 }}>Select all that apply. We'll tailor exercises accordingly.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {EQUIPMENT.map(eq => {
                const active = equipment.includes(eq.id);
                return (
                  <div key={eq.id} onClick={() => toggleEquipment(eq.id)} style={{ padding: '20px', borderRadius: 14, border: `2px solid ${active ? 'var(--mint)' : 'var(--border)'}`, background: active ? 'rgba(0,229,160,0.08)' : 'var(--bg3)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                    {active && (
                      <div style={{ position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 12 12" width="10" height="10"><path d="M2 6l3 3 5-5" stroke="#020f09" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
                      </div>
                    )}
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{eq.emoji}</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: active ? 'var(--mint)' : 'var(--txt)', marginBottom: 4 }}>{eq.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt3)' }}>{eq.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Nav Buttons */}
      <div style={{ width: '100%', maxWidth: 680, display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ padding: '12px 28px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: step === 0 ? 'var(--txt3)' : 'var(--txt)', cursor: step === 0 ? 'default' : 'pointer', fontSize: 14, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' }}>
          ← Back
        </button>
        <button onClick={next} disabled={!canNext || completing} style={{ padding: '12px 36px', borderRadius: 10, border: 'none', cursor: canNext ? 'pointer' : 'default', fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, background: canNext ? (step === 3 ? 'linear-gradient(135deg,var(--mint),#00b87a)' : 'linear-gradient(135deg,var(--violet),#5a3fd4)') : 'rgba(255,255,255,0.06)', color: canNext ? (step === 3 ? '#020f09' : '#fff') : 'var(--txt3)', transition: 'all 0.2s', boxShadow: canNext ? (step === 3 ? '0 4px 20px rgba(0,229,160,0.3)' : '0 4px 20px rgba(124,92,252,0.35)') : 'none' }}>
          {completing ? '🚀 Setting up your dashboard…' : step === 3 ? '🚀 Launch My Dashboard' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
