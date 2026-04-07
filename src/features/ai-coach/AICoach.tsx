import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import type { WorkoutSession } from '../../shared/types';
import type { NutritionDay } from '../../shared/lib/db';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

// Build a dynamic, personalised system prompt from real user data
function buildSystemPrompt(
  displayName: string,
  stats: { height: number; weight: number; age: number; gender: string },
  todayNutrition: NutritionDay,
  workoutHistory: WorkoutSession[],
  streak: number,
): string {
  const recentSessions = workoutHistory.slice(0, 5);
  const sessionSummary = recentSessions.length > 0
    ? recentSessions.map(s => {
        const date = s.completedAt instanceof Date ? s.completedAt : new Date(s.completedAt!);
        const vol = Math.round(s.totalVolume);
        return `- ${date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: ${s.name} (${vol.toLocaleString()} kg total volume, ${Math.round(s.duration / 60)} min)`;
      }).join('\n')
    : '- No sessions logged yet';

  // Collect PRs from history
  const prMap = new Map<string, { weight: number; reps: number; est1rm: number }>();
  workoutHistory.forEach(s => {
    (s.prsBreached ?? []).forEach(pr => {
      const existing = prMap.get(pr.exerciseName);
      if (!existing || pr.estimatedOneRM > existing.est1rm) {
        prMap.set(pr.exerciseName, { weight: pr.weight, reps: pr.reps, est1rm: pr.estimatedOneRM });
      }
    });
  });
  const prSummary = prMap.size > 0
    ? Array.from(prMap.entries()).map(([name, pr]) => `- ${name}: ${pr.weight}kg × ${pr.reps} (est. 1RM ${pr.est1rm}kg)`).join('\n')
    : '- No PRs recorded yet';

  return `You are ${displayName}'s AI fitness coach on FitTrackPro — an elite, highly knowledgeable fitness assistant with full access to their real training data.

ATHLETE PROFILE:
- Name: ${displayName}
- Age: ${stats.age}, Height: ${stats.height}cm, Weight: ${stats.weight}kg, Gender: ${stats.gender}
- Current training streak: ${streak} days
- Experience: Intermediate lifter

TODAY'S NUTRITION (live data):
- Calories: ${todayNutrition.calories.consumed} / ${todayNutrition.calories.target} kcal (${Math.round((todayNutrition.calories.consumed / todayNutrition.calories.target) * 100)}%)
- Protein: ${todayNutrition.protein.consumed}g / ${todayNutrition.protein.target}g
- Carbs: ${todayNutrition.carbs.consumed}g / ${todayNutrition.carbs.target}g
- Fat: ${todayNutrition.fat.consumed}g / ${todayNutrition.fat.target}g
- Water: ${todayNutrition.water} / 8 cups

RECENT TRAINING SESSIONS (newest first):
${sessionSummary}

PERSONAL RECORDS (from logged sessions):
${prSummary}

Keep responses concise, practical, and evidence-based. Use specific numbers. Reference the athlete's actual data above when giving advice. Be direct and encouraging.`;
}

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED_PROMPTS = [
  'Review my recent training sessions',
  'Am I hitting my protein targets?',
  'Should I deload this week?',
  'Best exercises for lagging legs',
  'How to optimise my nutrition timing',
  'Explain progressive overload for me',
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '14px 18px', background: 'var(--bg4)', borderRadius: '14px 14px 14px 4px', alignSelf: 'flex-start', marginTop: 4 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--violet)', animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

export default function AICoach() {
  const { user, todayNutrition, workoutHistory } = useAppStore();

  const streak = useMemo(() => {
    if (!workoutHistory.length) return 0;
    const daySet = new Set(
      workoutHistory.map(s => {
        const d = s.completedAt instanceof Date ? s.completedAt : new Date(s.completedAt!);
        return d.toISOString().split('T')[0];
      })
    );
    let s = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (daySet.has(d.toISOString().split('T')[0])) s++;
      else if (i > 0) break;
    }
    return s;
  }, [workoutHistory]);

  const displayName = user?.displayName ?? 'Athlete';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey ${displayName}! 👋 I'm your AI fitness coach, powered by Claude. I have full context on your real training data, nutrition intake, and goals.\n\nAsk me anything — from programming questions to nutrition advice, or just tell me how your last session felt. What's on your mind?`,
    },
  ]);

  // Update the welcome message when real user data loads
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{
          role: 'assistant',
          content: `Hey ${displayName}! 👋 I'm your AI fitness coach, powered by Claude. I have full access to your real training data — ${workoutHistory.length} sessions logged, ${streak}-day streak, and your live nutrition targets.\n\nAsk me anything. What's on your mind?`,
        }];
      }
      return prev;
    });
  }, [displayName, workoutHistory.length, streak]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    const systemPrompt = buildSystemPrompt(
      displayName,
      user?.stats ?? { height: 175, weight: 75, age: 25, gender: 'unknown' },
      todayNutrition,
      workoutHistory,
      streak,
    );

    if (!API_KEY) {
      await new Promise(r => setTimeout(r, 800));
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'd love to help with that! To enable real AI responses:\n\n1. Open **.env.local** in your project\n2. Add: \`VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here\`\n3. Restart the dev server\n\nYou can get your API key at **console.anthropic.com**.\n\nFor now, here's my take: Your current streak of **${streak} days** shows great consistency. Based on your nutrition data, you're at **${todayNutrition.protein.consumed}g / ${todayNutrition.protein.target}g protein** today. Keep hitting those targets!`,
      }]);
      setLoading(false);
      return;
    }

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: text.trim() });

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', max_tokens: 1024, stream: true, system: systemPrompt, messages: history }),
      });

      if (!resp.ok) throw new Error(`API error: ${resp.status}`);

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              assistantText += parsed.delta.text;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reach AI. Check your API key and try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const formatMsg = (text: string) => {
    // Render **bold** and simple newlines
    return text.split('\n').map((line, i, arr) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          {i < arr.length - 1 && <br />}
        </span>
      );
    });
  };

  // Sidebar context values from real data
  const recentSession = workoutHistory[0];

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* ── Chat Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--violet),#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: '#fff', fontWeight: 700, fontFamily: 'Syne,sans-serif' }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <circle cx="12" cy="12" r="3" fill="#fff" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--mint)', border: '2px solid var(--bg2)', animation: 'pulseDot 2s ease-in-out infinite' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--txt)' }}>AI Coach</div>
            <div style={{ fontSize: 12, color: 'var(--mint)' }}>● Online — Powered by Claude</div>
          </div>
          {!API_KEY && (
            <div style={{ marginLeft: 'auto', padding: '6px 12px', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)', borderRadius: 8, fontSize: 11, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚠️ Demo mode — set VITE_ANTHROPIC_API_KEY for live AI
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)' }} />
                  AI Coach
                </div>
              )}
              <div style={{
                maxWidth: '78%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'var(--violet)' : 'var(--bg4)',
                color: 'var(--txt)', fontSize: 14, lineHeight: 1.7, fontFamily: 'DM Sans,sans-serif',
              }}>
                {msg.content ? formatMsg(msg.content) : <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: 12 }}>Thinking…</span>}
              </div>
              {msg.role === 'user' && (
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>{displayName}</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 5 }}>AI Coach</div>
              <TypingDots />
            </div>
          )}
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.25)', borderRadius: 10, fontSize: 13, color: 'var(--red)' }}>⚠️ {error}</div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your coach anything… (Enter to send, Shift+Enter for new line)"
              rows={2}
              disabled={loading}
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', resize: 'none', outline: 'none', transition: 'border 0.2s', lineHeight: 1.5 }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{ width: 48, height: 48, borderRadius: 12, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', background: input.trim() && !loading ? 'linear-gradient(135deg,var(--violet),#5a3fd4)' : 'rgba(255,255,255,0.06)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: input.trim() && !loading ? '0 4px 14px rgba(124,92,252,0.35)' : 'none' }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 8 }}>Powered by Claude · Responses are AI-generated coaching suggestions, not medical advice</div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', padding: '20px 16px' }}>
        {/* Live context */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginBottom: 12 }}>📊 Live Context</div>
          {[
            { label: 'Training Streak', val: `${streak} days 🔥` },
            { label: 'Protein Today', val: `${todayNutrition.protein.consumed}g / ${todayNutrition.protein.target}g` },
            { label: 'Calories', val: `${todayNutrition.calories.consumed.toLocaleString()} / ${todayNutrition.calories.target.toLocaleString()}` },
            { label: 'Last Session', val: recentSession ? recentSession.name : 'None yet' },
            { label: 'Sessions Logged', val: `${workoutHistory.length} total` },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>{s.val}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(0,229,160,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)', animation: 'pulseDot 2s ease-in-out infinite' }} />
            Real-time from Firestore
          </div>
        </div>

        {/* Quick prompts */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginBottom: 12 }}>💡 Quick Prompts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {SUGGESTED_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMessage(p)} style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--txt2)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s', lineHeight: 1.4 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--violet)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--txt)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--txt2)'; }}
              >{p}</button>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(124,92,252,0.1),rgba(0,229,160,0.05))', border: '1px solid rgba(124,92,252,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 4 }}>Powered by</div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 800, background: 'linear-gradient(90deg,var(--violet2),var(--mint))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Claude by Anthropic</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>claude-3-5-haiku-20241022</div>
        </div>
      </div>
    </div>
  );
}
