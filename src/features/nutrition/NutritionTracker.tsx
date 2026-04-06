import { useState, useMemo } from 'react';

// ── Food Database ──────────────────────────────────────────────
const FOOD_DB = [
  { id: 'f1',  name: 'Chicken Breast',    brand: 'Generic',   cal: 165, p: 31, c: 0,   f: 3.6, unit: '100g' },
  { id: 'f2',  name: 'Brown Rice',        brand: 'Generic',   cal: 215, p: 5,  c: 45,  f: 2,   unit: '100g' },
  { id: 'f3',  name: 'Eggs (large)',      brand: 'Generic',   cal: 70,  p: 6,  c: 0.5, f: 5,   unit: '1 egg' },
  { id: 'f4',  name: 'Greek Yogurt',      brand: 'Chobani',   cal: 90,  p: 15, c: 6,   f: 0.4, unit: '150g' },
  { id: 'f5',  name: 'Oat Porridge',      brand: 'Generic',   cal: 389, p: 17, c: 66,  f: 7,   unit: '100g' },
  { id: 'f6',  name: 'Salmon',            brand: 'Generic',   cal: 208, p: 20, c: 0,   f: 13,  unit: '100g' },
  { id: 'f7',  name: 'Sweet Potato',      brand: 'Generic',   cal: 86,  p: 1.6,c: 20,  f: 0.1, unit: '100g' },
  { id: 'f8',  name: 'Broccoli',          brand: 'Generic',   cal: 34,  p: 2.8,c: 7,   f: 0.4, unit: '100g' },
  { id: 'f9',  name: 'Almonds',           brand: 'Generic',   cal: 173, p: 6,  c: 6,   f: 15,  unit: '30g' },
  { id: 'f10', name: 'Banana',            brand: 'Generic',   cal: 105, p: 1.3,c: 27,  f: 0.4, unit: 'medium' },
  { id: 'f11', name: 'Whey Protein',      brand: 'Optimum',   cal: 120, p: 24, c: 3,   f: 1.5, unit: '30g scoop' },
  { id: 'f12', name: 'Peanut Butter',     brand: 'Generic',   cal: 188, p: 8,  c: 7,   f: 16,  unit: '32g' },
  { id: 'f13', name: 'Whole Milk',        brand: 'Generic',   cal: 149, p: 8,  c: 12,  f: 8,   unit: '250ml' },
  { id: 'f14', name: 'Quinoa',            brand: 'Generic',   cal: 222, p: 8,  c: 39,  f: 4,   unit: '100g' },
  { id: 'f15', name: 'Avocado',           brand: 'Generic',   cal: 160, p: 2,  c: 9,   f: 15,  unit: '100g' },
  { id: 'f16', name: 'Tuna (canned)',     brand: 'Generic',   cal: 116, p: 26, c: 0,   f: 1,   unit: '100g' },
  { id: 'f17', name: 'Cottage Cheese',    brand: 'Generic',   cal: 127, p: 17, c: 4,   f: 5,   unit: '150g' },
  { id: 'f18', name: 'Blueberries',       brand: 'Generic',   cal: 57,  p: 0.7,c: 14,  f: 0.3, unit: '100g' },
];

type MealId = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
interface FoodRow { id: string; name: string; qty: number; cal: number; p: number; c: number; f: number; }
interface MealData { items: FoodRow[]; open: boolean; }

const INITIAL_MEALS: Record<MealId, MealData> = {
  Breakfast: { open: true,  items: [{ id: 'i1', name: 'Oat Porridge', qty: 1, cal: 389, p: 17, c: 66, f: 7 }, { id: 'i2', name: 'Whey Protein', qty: 1, cal: 120, p: 24, c: 3, f: 1.5 }, { id: 'i3', name: 'Banana', qty: 1, cal: 105, p: 1.3, c: 27, f: 0.4 }] },
  Lunch:     { open: true,  items: [{ id: 'i4', name: 'Chicken Breast', qty: 2, cal: 330, p: 62, c: 0, f: 7.2 }, { id: 'i5', name: 'Brown Rice', qty: 1.5, cal: 323, p: 7.5, c: 67.5, f: 3 }, { id: 'i6', name: 'Broccoli', qty: 1, cal: 34, p: 2.8, c: 7, f: 0.4 }] },
  Dinner:    { open: false, items: [{ id: 'i7', name: 'Salmon', qty: 1.5, cal: 312, p: 30, c: 0, f: 19.5 }, { id: 'i8', name: 'Sweet Potato', qty: 2, cal: 172, p: 3.2, c: 40, f: 0.2 }] },
  Snacks:    { open: false, items: [{ id: 'i9', name: 'Greek Yogurt', qty: 1, cal: 90, p: 15, c: 6, f: 0.4 }, { id: 'i10', name: 'Almonds', qty: 1, cal: 173, p: 6, c: 6, f: 15 }] },
};

const TARGETS = { cal: 2800, p: 200, c: 280, f: 78 };
const MEAL_EMOJIS: Record<MealId, string> = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snacks: '🍎' };
const MEAL_COLORS: Record<MealId, string> = { Breakfast: 'var(--violet)', Lunch: 'var(--mint)', Dinner: 'var(--orange)', Snacks: 'var(--gold)' };

function CalDonut({ consumed, target }: { consumed: number; target: number }) {
  const pct = Math.min(consumed / target, 1);
  const r = 76; const cx = 90; const cy = 90;
  const circ = 2 * Math.PI * r;
  const filled = pct * circ;
  return (
    <svg width={180} height={180} viewBox="0 0 180 180">
      <defs><linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--violet)" /><stop offset="100%" stopColor="var(--mint)" />
      </linearGradient></defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg4)" strokeWidth={18} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#calGrad)" strokeWidth={18} strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ * 0.25} transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--txt)" fontSize="26" fontWeight="800" fontFamily="Syne,sans-serif">{consumed}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--txt3)" fontSize="11" fontFamily="DM Sans,sans-serif">of {target} kcal</text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill={pct >= 1 ? 'var(--mint)' : 'var(--txt3)'} fontSize="11" fontFamily="DM Sans,sans-serif">{Math.round(pct * 100)}% of goal</text>
    </svg>
  );
}

function MacroBar({ label, cur, target, color }: { label: string; cur: number; target: number; color: string }) {
  const pct = Math.min((cur / target) * 100, 100);
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt2)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'Syne,sans-serif' }}>{cur}g <span style={{ color: 'var(--txt3)', fontFamily: 'DM Sans,sans-serif', fontWeight: 400 }}>/ {target}g</span></span>
      </div>
      <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

function WaterCups({ cups, onAdd }: { cups: number; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <button key={i} onClick={i < cups ? undefined : onAdd} style={{ width: 36, height: 44, borderRadius: 8, border: `2px solid ${i < cups ? 'var(--violet)' : 'var(--border2)'}`, background: i < cups ? 'rgba(124,92,252,0.2)' : 'var(--bg4)', cursor: i < cups ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'all 0.2s' }}>
            {i < cups ? '💧' : <span style={{ opacity: 0.3 }}>○</span>}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--txt2)' }}>
        <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, color: 'var(--violet2)', fontSize: 16 }}>{cups * 250} ml</span>
        <span style={{ color: 'var(--txt3)' }}> / 2000 ml</span>
      </div>
    </div>
  );
}

export default function NutritionTracker() {
  const today = new Date();
  const [dateOffset, setDateOffset] = useState(0);
  const [meals, setMeals] = useState(INITIAL_MEALS);
  const [water, setWater] = useState(5);
  const [searchModal, setSearchModal] = useState<MealId | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [qty, setQty] = useState(1);

  const currentDate = new Date(today);
  currentDate.setDate(today.getDate() + dateOffset);
  const dateStr = currentDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const totals = useMemo(() => {
    let cal = 0, p = 0, c = 0, f = 0;
    Object.values(meals).forEach(m => m.items.forEach(i => { cal += i.cal * i.qty; p += i.p * i.qty; c += i.c * i.qty; f += i.f * i.qty; }));
    return { cal: Math.round(cal), p: Math.round(p), c: Math.round(c), f: Math.round(f) };
  }, [meals]);

  const removeItem = (meal: MealId, id: string) =>
    setMeals(prev => ({ ...prev, [meal]: { ...prev[meal], items: prev[meal].items.filter(i => i.id !== id) } }));

  const toggleMeal = (meal: MealId) =>
    setMeals(prev => ({ ...prev, [meal]: { ...prev[meal], open: !prev[meal].open } }));

  const addFood = (meal: MealId, food: typeof FOOD_DB[0]) => {
    const newItem: FoodRow = { id: `${Date.now()}`, name: food.name, qty, cal: Math.round(food.cal * qty), p: Math.round(food.p * qty * 10) / 10, c: Math.round(food.c * qty * 10) / 10, f: Math.round(food.f * qty * 10) / 10 };
    setMeals(prev => ({ ...prev, [meal]: { ...prev[meal], items: [...prev[meal].items, newItem] } }));
    setSearchModal(null); setSearchQ(''); setQty(1);
  };

  const filtered = FOOD_DB.filter(f => f.name.toLowerCase().includes(searchQ.toLowerCase()));
  const remaining = TARGETS.cal - totals.cal;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '28px 32px 0' }}>
      {/* Header + Date Navigator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--txt)', margin: '0 0 4px' }}>Nutrition Tracker</h1>
          <p style={{ fontSize: 13, color: 'var(--txt3)', margin: 0 }}>Track your daily intake and hit your macro targets</p>
        </div>
        {/* Date nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 14px' }}>
          <button onClick={() => setDateOffset(d => d - 1)} style={{ background: 'none', border: 'none', color: 'var(--txt2)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center' }}>‹</button>
          <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--txt)', minWidth: 160, textAlign: 'center' }}>
            {dateOffset === 0 ? `Today — ${dateStr}` : dateStr}
          </span>
          <button onClick={() => setDateOffset(d => Math.min(d + 1, 0))} style={{ background: 'none', border: 'none', color: dateOffset < 0 ? 'var(--txt2)' : 'var(--txt3)', cursor: dateOffset < 0 ? 'pointer' : 'default', fontSize: 18, display: 'flex', alignItems: 'center' }}>›</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        {/* Summary Row: Donut + Macros + Water */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 20 }}>
          {/* Calorie donut */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CalDonut consumed={totals.cal} target={TARGETS.cal} />
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 800, color: remaining > 0 ? 'var(--mint)' : 'var(--orange)' }}>{Math.abs(remaining)}</div>
                <div style={{ fontSize: 10, color: 'var(--txt3)' }}>{remaining > 0 ? 'remaining' : 'over'}</div>
              </div>
            </div>
          </div>

          {/* Macros + Water */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', flex: 1 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--txt)', marginBottom: 16 }}>Macronutrients</div>
              <div style={{ display: 'flex', gap: 20 }}>
                <MacroBar label="Protein" cur={totals.p} target={TARGETS.p} color="var(--violet2)" />
                <MacroBar label="Carbs" cur={totals.c} target={TARGETS.c} color="var(--mint)" />
                <MacroBar label="Fat" cur={totals.f} target={TARGETS.f} color="var(--gold)" />
              </div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>💧 Water Intake</span>
                <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{water} of 8 cups</span>
              </div>
              <WaterCups cups={water} onAdd={() => setWater(w => Math.min(w + 1, 8))} />
            </div>
          </div>
        </div>

        {/* Meal Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(Object.keys(meals) as MealId[]).map(mealId => {
            const meal = meals[mealId];
            const mealTotals = meal.items.reduce((acc, i) => ({ cal: acc.cal + i.cal, p: acc.p + i.p, c: acc.c + i.c }), { cal: 0, p: 0, c: 0 });
            return (
              <div key={mealId} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                {/* Meal header */}
                <div onClick={() => toggleMeal(mealId)} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', borderLeft: `4px solid ${MEAL_COLORS[mealId]}` }}>
                  <span style={{ fontSize: 20, marginRight: 10 }}>{MEAL_EMOJIS[mealId]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--txt)' }}>{mealId}</div>
                    <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 2 }}>
                      {mealTotals.cal} kcal · {mealTotals.p}g protein · {mealTotals.c}g carbs
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setSearchModal(mealId); }}
                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: `${MEAL_COLORS[mealId]}22`, color: MEAL_COLORS[mealId], fontSize: 13, fontWeight: 700, marginRight: 12 }}
                  >+ Add</button>
                  <span style={{ fontSize: 20, color: 'var(--txt3)', transition: 'transform 0.2s', transform: meal.open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
                </div>

                {/* Food items */}
                {meal.open && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {meal.items.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>No food logged yet. Click + Add to get started.</div>
                    ) : (
                      meal.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 12 }}>
                          <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--txt)' }}>{item.name}</div>
                          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                            <span style={{ color: 'var(--txt2)' }}><strong style={{ color: 'var(--txt)' }}>{item.cal}</strong> kcal</span>
                            <span style={{ color: 'var(--violet2)' }}>{item.p}g P</span>
                            <span style={{ color: 'var(--mint)' }}>{item.c}g C</span>
                          </div>
                          <button onClick={() => removeItem(mealId, item.id)} style={{ background: 'none', border: 'none', color: 'var(--txt3)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', padding: '4px', borderRadius: 6, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--txt3)')}>×</button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Food Search Modal */}
      {searchModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setSearchModal(null)}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, width: 500, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 12 }}>Add Food to {searchModal}</div>
              <input
                autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search foods… (e.g. chicken, oats, protein)"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', outline: 'none' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--txt3)', flexShrink: 0 }}>Quantity (servings):</span>
                <input type="number" min={0.25} max={10} step={0.25} value={qty} onChange={e => setQty(Number(e.target.value))}
                  style={{ width: 72, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border2)', background: 'var(--bg4)', color: 'var(--txt)', fontSize: 14, fontFamily: 'Syne,sans-serif', fontWeight: 700, outline: 'none' }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map(food => (
                <div key={food.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--txt)' }}>{food.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>{food.brand} · {food.unit}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, marginRight: 14 }}>
                    <span style={{ color: 'var(--txt2)' }}><strong style={{ color: 'var(--txt)' }}>{Math.round(food.cal * qty)}</strong> kcal</span>
                    <span style={{ color: 'var(--violet2)' }}>{Math.round(food.p * qty * 10) / 10}g P</span>
                    <span style={{ color: 'var(--mint)' }}>{Math.round(food.c * qty * 10) / 10}g C</span>
                  </div>
                  <button onClick={() => addFood(searchModal, food)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--violet)', color: '#fff', fontSize: 12, fontWeight: 700 }}>Add</button>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>No foods found matching "{searchQ}"</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
