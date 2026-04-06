import { useState } from 'react';
import { COMMUNITY_USERS, FEED_POSTS, type CommunityUser } from './mockCommunityData';

const ME = COMMUNITY_USERS[0]; // Alex Rivera

function Avatar({ user, size = 40 }: { user: CommunityUser; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: user.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, color: '#fff', fontSize: size * 0.35, flexShrink: 0 }}>
      {user.initials}
    </div>
  );
}

const POST_META: Record<string, { emoji: string; label: string }> = {
  pr: { emoji: '🏆', label: 'Personal Record' },
  workout: { emoji: '✅', label: 'Workout Completed' },
  streak: { emoji: '🔥', label: 'Streak Milestone' },
  photo: { emoji: '📸', label: 'Progress Photo' },
};

function FeedView() {
  const [posts, setPosts] = useState(FEED_POSTS);
  const [compose, setCompose] = useState('');
  const [shared, setShared] = useState(false);

  const toggleLike = (id: string) =>
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));

  const share = () => {
    if (!compose.trim()) return;
    setShared(true);
    setCompose('');
    setTimeout(() => setShared(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Compose */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Avatar user={ME} size={38} />
          <div style={{ flex: 1 }}>
            <textarea
              value={compose}
              onChange={e => setCompose(e.target.value)}
              placeholder="Share a PR, workout, or milestone with the community…"
              rows={2}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--txt)', fontSize: 13, fontFamily: 'DM Sans,sans-serif', outline: 'none', resize: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={share} disabled={!compose.trim()} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: compose.trim() ? 'pointer' : 'default', background: compose.trim() ? 'var(--violet)' : 'rgba(255,255,255,0.05)', color: compose.trim() ? '#fff' : 'var(--txt3)', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' }}>
                Post to Community
              </button>
            </div>
          </div>
        </div>
        {shared && (
          <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--mint)', display: 'flex', alignItems: 'center', gap: 8 }}>
            ✅ Your post was shared successfully!
          </div>
        )}
      </div>

      {/* Posts */}
      {posts.map(post => {
        const user = COMMUNITY_USERS.find(u => u.id === post.userId)!;
        const meta = POST_META[post.type];
        return (
          <div key={post.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <Avatar user={user} size={40} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--txt)' }}>{user.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--txt3)' }}>@{user.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 99, color: 'var(--txt2)' }}>{meta.emoji} {meta.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{post.time}</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 14, color: 'var(--txt)', lineHeight: 1.65, margin: '0 0 14px' }}>{post.text}</p>

            {post.meta?.exercise && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)', marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>🏆</span>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--violet2)' }}>{post.meta.weight} kg × {post.meta.reps}</div>
                  <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{post.meta.exercise}</div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 20, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: post.liked ? 'var(--red)' : 'var(--txt3)', transition: 'color 0.2s', fontFamily: 'DM Sans,sans-serif' }}>
                {post.liked ? '❤️' : '🤍'} {post.likes}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--txt3)', fontFamily: 'DM Sans,sans-serif' }}>
                💬 {post.comments}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type LeaderboardPeriod = 'Weekly' | 'Monthly' | 'All Time';
type LeaderboardCategory = 'Volume' | 'Streak' | 'PRs' | 'Calories';

function LeaderboardView() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('Weekly');
  const [category, setCategory] = useState<LeaderboardCategory>('Volume');

  const getValue = (u: CommunityUser) => {
    if (category === 'Volume') return `${u.volume.toLocaleString()} kg`;
    if (category === 'Streak') return `${u.streak} days`;
    if (category === 'PRs') return `${u.prs} PRs`;
    return `${u.calories.toLocaleString()} kcal`;
  };

  const sorted = [...COMMUNITY_USERS].sort((a, b) => {
    if (category === 'Volume') return b.volume - a.volume;
    if (category === 'Streak') return b.streak - a.streak;
    if (category === 'PRs') return b.prs - a.prs;
    return b.calories - a.calories;
  });

  const rankColors = ['var(--gold)', 'var(--txt2)', 'var(--orange)'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', padding: 4, borderRadius: 10 }}>
          {(['Weekly', 'Monthly', 'All Time'] as LeaderboardPeriod[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', background: period === p ? 'var(--violet)' : 'transparent', color: period === p ? '#fff' : 'var(--txt3)', transition: 'all 0.2s' }}>{p}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', padding: 4, borderRadius: 10 }}>
          {(['Volume', 'Streak', 'PRs', 'Calories'] as LeaderboardCategory[]).map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', background: category === c ? 'rgba(255,255,255,0.1)' : 'transparent', color: category === c ? 'var(--txt)' : 'var(--txt3)', transition: 'all 0.2s' }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 8 }}>
        {[sorted[1], sorted[0], sorted[2]].map((u, visualPos) => {
          const rank = visualPos === 0 ? 2 : visualPos === 1 ? 1 : 3;
          const height = visualPos === 1 ? 120 : 90;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
          const isMe = u.id === ME.id;
          return (
            <div key={u.id} style={{ background: isMe ? 'rgba(124,92,252,0.12)' : 'var(--card)', border: `1px solid ${isMe ? 'var(--violet)' : 'var(--border)'}`, borderRadius: 16, padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: height + 60 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{medal}</div>
              <Avatar user={u} size={44} />
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginTop: 8 }}>{u.name.split(' ')[0]}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: rankColors[rank - 1], marginTop: 4 }}>{getValue(u)}</div>
            </div>
          );
        })}
      </div>

      {/* Full rankings table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {sorted.map((u, i) => {
          const isMe = u.id === ME.id;
          const trend = i < 3 ? '↑' : i > 6 ? '↓' : '→';
          const trendColor = i < 3 ? 'var(--mint)' : i > 6 ? 'var(--red)' : 'var(--txt3)';
          return (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isMe ? 'rgba(124,92,252,0.08)' : 'transparent', borderLeft: isMe ? '3px solid var(--violet)' : '3px solid transparent' }}>
              <div style={{ width: 32, fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: i < 3 ? rankColors[i] : 'var(--txt3)' }}>{i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}</div>
              <Avatar user={u} size={36} />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: isMe ? 'var(--violet2)' : 'var(--txt)' }}>{u.name} {isMe && <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'DM Sans,sans-serif', fontWeight: 400 }}>(you)</span>}</div>
                <div style={{ fontSize: 11, color: 'var(--txt3)' }}>@{u.username}</div>
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--txt)', marginRight: 14 }}>{getValue(u)}</div>
              <span style={{ fontSize: 14, color: trendColor, fontWeight: 700 }}>{trend}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Community() {
  const [tab, setTab] = useState<'feed' | 'leaderboard'>('feed');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '28px 32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--txt)', margin: '0 0 4px' }}>Community</h1>
          <p style={{ fontSize: 13, color: 'var(--txt3)', margin: 0 }}>Share your wins and compete with fellow athletes</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', padding: 4, borderRadius: 10 }}>
          {(['feed', 'leaderboard'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', background: tab === t ? 'var(--violet)' : 'transparent', color: tab === t ? '#fff' : 'var(--txt3)', transition: 'all 0.2s', boxShadow: tab === t ? '0 2px 12px rgba(124,92,252,0.3)' : 'none' }}>
              {t === 'feed' ? '📣 Activity Feed' : '🏆 Leaderboard'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        {tab === 'feed' ? <FeedView /> : <LeaderboardView />}
      </div>
    </div>
  );
}
