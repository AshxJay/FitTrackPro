import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import { saveAIMessage, subscribeToAIChat, clearAIChat, type ChatMessage } from '../../shared/lib/db';
import type { NutritionDay } from '../../shared/lib/db';
import type { WorkoutSession } from '../../shared/types';

// ── Gemini Config ─────────────────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.0-flash';
const VITE_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const IS_DEV = import.meta.env.DEV as boolean;

// In dev: call Gemini directly (VITE_ key is fine for local use)
// In prod (Vercel): call /api/chat which holds the server-side GEMINI_API_KEY
const GEMINI_DIRECT_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${key}`;

// ── System Prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(
  displayName: string,
  stats: { height: number; weight: number; age: number; gender: string },
  todayNutrition: NutritionDay,
  workoutHistory: WorkoutSession[],
  streak: number,
): string {
  const recent = workoutHistory.slice(0, 5).map(s => {
    const d = s.completedAt instanceof Date ? s.completedAt : new Date(s.completedAt!);
    return `- ${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: ${s.name} (${Math.round(s.totalVolume ?? 0).toLocaleString()} kg volume, ${Math.round(s.duration / 60)} min)`;
  }).join('\n') || '- No sessions logged yet';

  const prMap = new Map<string, { weight: number; reps: number; est1rm: number }>();
  workoutHistory.forEach(s =>
    (s.prsBreached ?? []).forEach(pr => {
      const ex = prMap.get(pr.exerciseName);
      if (!ex || pr.estimatedOneRM > ex.est1rm)
        prMap.set(pr.exerciseName, { weight: pr.weight, reps: pr.reps, est1rm: pr.estimatedOneRM });
    })
  );
  const prSummary = prMap.size > 0
    ? Array.from(prMap.entries()).map(([n, p]) => `- ${n}: ${p.weight}kg × ${p.reps} (est. 1RM ${p.est1rm}kg)`).join('\n')
    : '- No PRs recorded yet';

  return `You are ${displayName}'s personal AI fitness coach inside FitTrackPro — an expert coach with full access to their real, live training data.

ATHLETE PROFILE:
- Name: ${displayName}
- Age: ${stats.age} | Height: ${stats.height}cm | Weight: ${stats.weight}kg | Gender: ${stats.gender}
- Current streak: ${streak} consecutive training days

TODAY'S LIVE NUTRITION:
- Calories: ${todayNutrition.calories.consumed} / ${todayNutrition.calories.target} kcal (${Math.round((todayNutrition.calories.consumed / todayNutrition.calories.target) * 100)}%)
- Protein: ${todayNutrition.protein.consumed}g / ${todayNutrition.protein.target}g
- Carbs: ${todayNutrition.carbs.consumed}g / ${todayNutrition.carbs.target}g
- Fat: ${todayNutrition.fat.consumed}g / ${todayNutrition.fat.target}g
- Water: ${todayNutrition.water} / 8 cups

RECENT TRAINING (newest first):
${recent}

PERSONAL RECORDS:
${prSummary}

Guidelines: Be direct, specific, and reference their actual data. Use numbers. Keep responses concise (3-5 sentences max unless a detailed plan is requested). You're a high-performance coach, not a general wellness advisor.`;
}

// ── Gemini API call ───────────────────────────────────────────────────────────
async function callGemini(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: geminiMessages,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.75 },
  });

  let response: Response;
  if (IS_DEV && VITE_KEY) {
    // Local dev: call Gemini directly
    response = await fetch(GEMINI_DIRECT_URL(VITE_KEY), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
  } else {
    // Production: go through the secure Vercel API route
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
    });
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error ${response.status}: ${err}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const chunk: string = parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (chunk) { fullText += chunk; onChunk(chunk); }
      } catch { /* skip malformed chunks */ }
    }
  }
  return fullText;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '14px 18px', background: 'var(--bg4)', borderRadius: '14px 14px 14px 4px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--violet)', animation: `pulseDot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

function formatMsg(text: string) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

const SUGGESTED_PROMPTS = [
  'Review my recent training sessions',
  'Am I hitting my protein targets today?',
  'Should I deload this week?',
  'Give me a progressive overload plan',
  'How to improve recovery between sessions',
  'What should I eat post-workout?',
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function AICoach() {
  const { user, todayNutrition, workoutHistory, firebaseUser } = useAppStore();
  const displayName = user?.displayName ?? 'Athlete';

  const streak = useMemo(() => {
    if (!workoutHistory.length) return 0;
    const daySet = new Set(
      workoutHistory.map(s => {
        const d = s.completedAt instanceof Date ? s.completedAt : new Date(s.completedAt!);
        return d.toISOString().split('T')[0];
      })
    );
    let s = 0; const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      if (daySet.has(d.toISOString().split('T')[0])) s++;
      else if (i > 0) break;
    }
    return s;
  }, [workoutHistory]);

  const WELCOME: ChatMessage = {
    role: 'assistant',
    content: `Hey ${displayName}! 👋 I'm your AI fitness coach, powered by Gemini. I have live access to your training data — **${workoutHistory.length} sessions logged**, **${streak}-day streak**, and your real nutrition stats.\n\nAsk me anything about your training, nutrition, or recovery.`,
    createdAt: null,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from Firestore
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = subscribeToAIChat(firebaseUser.uid, (firestoreMsgs) => {
      if (!historyLoaded) setHistoryLoaded(true);
      if (firestoreMsgs.length > 0) {
        setMessages([WELCOME, ...firestoreMsgs]);
      }
    });
    return () => unsub();
  }, [firebaseUser?.uid]);

  // Update welcome message when user data loads
  useEffect(() => {
    setMessages(prev => {
      if (prev[0]?.role === 'assistant' && !prev[0].id) {
        return [{
          ...prev[0],
          content: `Hey ${displayName}! 👋 I'm your AI fitness coach, powered by Gemini. I have live access to your training data — **${workoutHistory.length} sessions logged**, **${streak}-day streak**, and your real nutrition stats.\n\nAsk me anything.`,
        }, ...prev.slice(1)];
      }
      return prev;
    });
  }, [displayName, workoutHistory.length, streak]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim(), createdAt: new Date() };
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

    // History for Gemini: exclude the welcome message (no id = transient) and only send actual conversation
    const historyForAI = messages.filter(m => m.id).map(m => ({ role: m.role, content: m.content }));
    historyForAI.push({ role: 'user', content: text.trim() });

    // Save user msg to Firestore
    if (firebaseUser) {
      saveAIMessage(firebaseUser.uid, { role: 'user', content: text.trim() }).catch(console.error);
    }

    // Stream assistant response
    let assistantText = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', createdAt: new Date() }]);

    try {
      assistantText = await callGemini(historyForAI, systemPrompt, (chunk) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: (updated[updated.length - 1].content ?? '') + chunk,
          };
          return updated;
        });
      });

      // Save assistant msg to Firestore
      if (firebaseUser && assistantText) {
        saveAIMessage(firebaseUser.uid, { role: 'assistant', content: assistantText }).catch(console.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reach Gemini. Check your API key.');
      setMessages(prev => prev.slice(0, -1)); // Remove empty assistant message
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!firebaseUser) return;
    await clearAIChat(firebaseUser.uid);
    setMessages([WELCOME]);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const recentSession = workoutHistory[0];
  const hasKey = IS_DEV ? !!VITE_KEY : true; // In prod we assume the server has the key

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* ── Chat ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#4285f4,#34a853,#fbbc04,#ea4335)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🧠</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--txt)' }}>AI Coach</div>
            <div style={{ fontSize: 12, color: 'var(--mint)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)', animation: 'pulseDot 2s infinite' }} />
              {hasKey ? 'Online — Powered by Gemini 2.0 Flash' : 'Demo mode — VITE_GEMINI_API_KEY not set'}
            </div>
          </div>
          {messages.filter(m => m.id).length > 0 && (
            <button onClick={clearChat} title="Clear history" style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--txt3)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif' }}>
              Clear history
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <div key={msg.id ?? `msg-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <div style={{ fontSize: 11, color: 'var(--txt3)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--violet)' }} />
                  AI Coach
                </div>
              )}
              <div style={{
                maxWidth: '80%', padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'linear-gradient(135deg,var(--violet),#5a3fd4)' : 'var(--bg4)',
                color: 'var(--txt)', fontSize: 14, lineHeight: 1.7, fontFamily: 'DM Sans,sans-serif',
              }}>
                {msg.content ? formatMsg(msg.content) : <span style={{ opacity: 0.4, fontStyle: 'italic', fontSize: 12 }}>Thinking…</span>}
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

        {/* Input */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask your coach anything… (Enter to send)"
              rows={2}
              disabled={loading}
              style={{ flex: 1, padding: '11px 14px', borderRadius: 12, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--txt)', fontSize: 14, fontFamily: 'DM Sans,sans-serif', resize: 'none', outline: 'none', lineHeight: 1.5 }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{ width: 48, height: 48, borderRadius: 12, border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', background: input.trim() && !loading ? 'linear-gradient(135deg,#4285f4,var(--violet))' : 'rgba(255,255,255,0.06)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', boxShadow: input.trim() && !loading ? '0 4px 14px rgba(66,133,244,0.4)' : 'none' }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 6 }}>Powered by Gemini · Chat history saved across devices · Not medical advice</div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div style={{ width: 272, display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', padding: '20px 16px' }}>
        {/* Live Context */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginBottom: 12 }}>📊 Live Context</div>
          {[
            { label: 'Training Streak', val: `${streak} days 🔥` },
            { label: 'Protein Today', val: `${todayNutrition.protein.consumed}g / ${todayNutrition.protein.target}g` },
            { label: 'Calories', val: `${todayNutrition.calories.consumed.toLocaleString()} / ${todayNutrition.calories.target.toLocaleString()}` },
            { label: 'Water', val: `${todayNutrition.water} / 8 cups` },
            { label: 'Last Session', val: recentSession ? recentSession.name : 'None yet' },
            { label: 'Total Sessions', val: `${workoutHistory.length}` },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: 'var(--txt3)' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>{s.val}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(0,229,160,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--mint)', animation: 'pulseDot 2s infinite' }} />
            Live from Firestore
          </div>
        </div>

        {/* Quick Prompts */}
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
        <div style={{ padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,rgba(66,133,244,0.1),rgba(52,168,83,0.08))', border: '1px solid rgba(66,133,244,0.2)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--txt3)', marginBottom: 4 }}>Powered by</div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 800, background: 'linear-gradient(90deg,#4285f4,#34a853)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Google Gemini</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 3 }}>gemini-2.0-flash</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>Chat history synced to Firestore</div>
        </div>
      </div>
    </div>
  );
}
