import StatCard from '../../shared/components/StatCard';
import StrengthChart from './StrengthChart';
import TrainingHeatmap from './TrainingHeatmap';
import TodayWorkoutCard from './TodayWorkoutCard';
import WeekScheduleCard from './WeekScheduleCard';
import NutritionCard from './NutritionCard';
import AICoachCard from './AICoachCard';
import { weeklyStats, mockPRs } from '../../shared/lib/mockData';
import { pct } from '../../shared/lib/utils';

const fadeUpStyle = (delay: number): React.CSSProperties => ({
  animation: `fadeUp 0.5s ${delay}ms ease both`,
});

export default function Dashboard() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, background: 'var(--bg)' }}>

      {/* PR Banner */}
      <div
        style={{ ...fadeUpStyle(0), background: 'linear-gradient(135deg,rgba(245,200,66,0.08),rgba(255,107,53,0.08))', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245,200,66,0.45)'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245,200,66,0.2)'}
      >
        <div style={{ fontSize: 28, flexShrink: 0 }}>🏆</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--gold)' }}>
            {mockPRs.length} New Personal Records This Week
          </div>
          <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 2 }}>You're in peak form — keep pushing.</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {mockPRs.map(pr => (
              <div key={pr.exerciseId} style={{ padding: '4px 10px', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 6, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--gold)' }}>
                {pr.exerciseName} {pr.weight}kg × {pr.reps}
              </div>
            ))}
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,200,66,0.5)" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard
          label="Calories Burned" value={weeklyStats.caloriesBurned} subLabel="" trend="12%" trendUp
          ringPct={pct(weeklyStats.caloriesBurned, weeklyStats.caloriesGoal)} color="orange" animDelay={200}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#ff6b35"><path d="M12 2c0 0-7 6-7 12a7 7 0 0 0 14 0c0-6-7-12-7-12z"/></svg>}
        />
        <StatCard
          label="Weekly Volume" value={weeklyStats.weeklyVolume} subLabel="kg total lifted" trend="8.3%" trendUp
          color="violet" animDelay={300}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9b7ffe" strokeWidth="2.2" strokeLinecap="round"><path d="M6 12h4m4 0h4M10 12V8m4 4v4"/><rect x="2" y="10" width="4" height="4" rx="1"/><rect x="18" y="10" width="4" height="4" rx="1"/></svg>}
        />
        <StatCard
          label="Current Streak" value={weeklyStats.streak} subLabel={`days in a row 🔥  Personal best: ${weeklyStats.streakBest}`}
          color="mint" animDelay={400}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#00e5a0"><path d="M12 2c0 0-6 5-6 11a6 6 0 0 0 12 0C18 7 12 2 12 2z"/></svg>}
        />
        <StatCard
          label="PRs This Month" value={weeklyStats.prsThisMonth} subLabel={`Last month: ${weeklyStats.prsLastMonth}`} trend="60%" trendUp
          color="gold" animDelay={500}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="#f5c842"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>}
        />
      </div>

      {/* Middle: Chart + Workout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 14 }}>
        {/* Chart + Heatmap stacked */}
        <div style={{ ...fadeUpStyle(100), gridColumn: '1 / 3', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StrengthChart />
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
          >
            <TrainingHeatmap />
          </div>
        </div>

        {/* Today's workout */}
        <div style={fadeUpStyle(150)}>
          <TodayWorkoutCard />
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div style={fadeUpStyle(200)}><WeekScheduleCard /></div>
        <div style={fadeUpStyle(250)}><NutritionCard /></div>
        <div style={fadeUpStyle(300)}><AICoachCard /></div>
      </div>

    </div>
  );
}
