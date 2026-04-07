import { useState, useEffect } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import {
  subscribeToFeed, createPost, togglePostLike,
  type CommunityPost,
} from '../../shared/lib/db';

// ── Utilities ─────────────────────────────────────────────────────────────────
function uidToColor(uid: string): string {
  const colors = ['#7c5cfc', '#00e5a0', '#f5c842', '#ff6b35', '#4285f4', '#ea4335', '#a855f7', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(date: Date | null): string {
  if (!date) return 'just now';
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function Avatar({ initials, color, size = 40 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne,sans-serif', fontWeight: 800, color: '#fff', fontSize: size * 0.34, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

const POST_META: Record<string, { emoji: string; label: string }> = {
  pr:      { emoji: '🏆', label: 'Personal Record' },
  workout: { emoji: '✅', label: 'Workout Completed' },
  streak:  { emoji: '🔥', label: 'Streak Milestone' },
  update:  { emoji: '💬', label: 'Update' },
};

// ── Feed View ─────────────────────────────────────────────────────────────────
function FeedView() {
  const { user, firebaseUser, workoutHistory } = useAppStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [compose, setCompose] = useState('');
  const [postType, setPostType] = useState<'workout' | 'pr' | 'streak' | 'update'>('update');
  const [posting, setPosting] = useState(false);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);

  // Real-time feed subscription
  useEffect(() => {
    const unsub = subscribeToFeed((incoming) => {
      setPosts(incoming);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const share = async () => {
    if (!compose.trim() || !firebaseUser || !user) return;
    setPosting(true);
    try {
      const initials = (user.displayName ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const color = uidToColor(firebaseUser.uid);

      // Auto-fill meta from recent workout if type is 'workout' or 'pr'
      let meta: CommunityPost['meta'] | undefined;
      const recentSession = workoutHistory[0];
      if (postType === 'workout' && recentSession) {
        meta = { exercise: recentSession.name };
      } else if (postType === 'pr' && recentSession?.prsBreached?.length) {
        const pr = recentSession.prsBreached[0];
        meta = { exercise: pr.exerciseName, weight: pr.weight, reps: pr.reps };
      }

      await createPost({
        authorId: firebaseUser.uid,
        authorName: user.displayName ?? 'Athlete',
        authorInitials: initials,
        authorColor: color,
        content: compose.trim(),
        type: postType,
        meta,
      });
      setCompose('');
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (post: CommunityPost) => {
    if (!firebaseUser || likeLoading) return;
    const isLiked = post.likedBy.includes(firebaseUser.uid);
    setLikeLoading(post.id!);
    try {
      await togglePostLike(post.id!, firebaseUser.uid, isLiked);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setLikeLoading(null);
    }
  };

  const myInitials = ((user?.displayName ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2));
  const myColor = firebaseUser ? uidToColor(firebaseUser.uid) : 'var(--violet)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Compose */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Avatar initials={myInitials} color={myColor} size={38} />
          <div style={{ flex: 1 }}>
            {/* Post type selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {(['update', 'workout', 'pr', 'streak'] as const).map(t => (
                <button key={t} onClick={() => setPostType(t)} style={{ padding: '4px 12px', borderRadius: 99, border: `1px solid ${postType === t ? 'var(--violet)' : 'var(--border)'}`, background: postType === t ? 'rgba(124,92,252,0.15)' : 'transparent', color: postType === t ? 'var(--violet2)' : 'var(--txt3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s' }}>
                  {POST_META[t].emoji} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <textarea
              value={compose}
              onChange={e => setCompose(e.target.value)}
              placeholder={postType === 'workout' ? "Share how your session went…" : postType === 'pr' ? "Tell the community about your new PR…" : postType === 'streak' ? "Share your streak milestone…" : "What's on your mind?"}
              rows={2}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--txt)', fontSize: 13, fontFamily: 'DM Sans,sans-serif', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={share}
                disabled={!compose.trim() || posting}
                style={{ padding: '8px 22px', borderRadius: 9, border: 'none', cursor: compose.trim() && !posting ? 'pointer' : 'default', background: compose.trim() ? 'var(--violet)' : 'rgba(255,255,255,0.05)', color: compose.trim() ? '#fff' : 'var(--txt3)', fontSize: 13, fontWeight: 700, fontFamily: 'DM Sans,sans-serif', transition: 'all 0.2s', boxShadow: compose.trim() ? '0 4px 12px rgba(124,92,252,0.3)' : 'none' }}
              >
                {posting ? 'Posting…' : 'Post to Community'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', height: 120, animation: 'pulseDot 1.5s ease-in-out infinite', opacity: 0.5 }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--txt3)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
          <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--txt)' }}>Be the first to post!</div>
          <div style={{ fontSize: 13 }}>Share a PR, workout, or milestone with the community.</div>
        </div>
      ) : (
        posts.map(post => {
          const meta = POST_META[post.type] ?? POST_META.update;
          const isLiked = firebaseUser ? post.likedBy.includes(firebaseUser.uid) : false;
          const isMe = post.authorId === firebaseUser?.uid;
          return (
            <div key={post.id} style={{ background: 'var(--card)', border: `1px solid ${isMe ? 'rgba(124,92,252,0.3)' : 'var(--border)'}`, borderRadius: 16, padding: '18px 20px', transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <Avatar initials={post.authorInitials} color={post.authorColor} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 700, color: isMe ? 'var(--violet2)' : 'var(--txt)' }}>{post.authorName}</span>
                    {isMe && <span style={{ fontSize: 10, color: 'var(--txt3)', background: 'rgba(124,92,252,0.1)', padding: '2px 7px', borderRadius: 99 }}>you</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 99, color: 'var(--txt2)' }}>{meta.emoji} {meta.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 14, color: 'var(--txt)', lineHeight: 1.65, margin: '0 0 12px' }}>{post.content}</p>

              {post.meta?.exercise && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>🏆</span>
                  <div>
                    {post.meta.weight && <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--gold)' }}>{post.meta.weight}kg × {post.meta.reps}</div>}
                    <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{post.meta.exercise}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 20, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  onClick={() => handleLike(post)}
                  disabled={likeLoading === post.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: likeLoading === post.id ? 'default' : 'pointer', fontSize: 13, color: isLiked ? 'var(--red)' : 'var(--txt3)', transition: 'all 0.2s', fontFamily: 'DM Sans,sans-serif', padding: '4px 8px', borderRadius: 8 }}
                  onMouseEnter={e => !isLiked && ((e.currentTarget as HTMLButtonElement).style.color = 'var(--red)')}
                  onMouseLeave={e => !isLiked && ((e.currentTarget as HTMLButtonElement).style.color = 'var(--txt3)')}
                >
                  {isLiked ? '❤️' : '🤍'} {post.likes}
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--txt3)', fontFamily: 'DM Sans,sans-serif', padding: '4px 8px', borderRadius: 8 }}>
                  💬 {post.comments}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
// Leaderboard is built from the Community feed data + user's own real stats
function LeaderboardView() {
  const { user, firebaseUser, workoutHistory } = useAppStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    const unsub = subscribeToFeed((incoming) => setPosts(incoming));
    return () => unsub();
  }, []);

  // Aggregate stats per user from posts
  const userStatsMap = new Map<string, { name: string; initials: string; color: string; posts: number; likes: number }>();
  posts.forEach(post => {
    const existing = userStatsMap.get(post.authorId);
    if (existing) {
      existing.posts++;
      existing.likes += post.likes;
    } else {
      userStatsMap.set(post.authorId, { name: post.authorName, initials: post.authorInitials, color: post.authorColor, posts: 1, likes: post.likes });
    }
  });

  // Add current user's real workout data
  const myUid = firebaseUser?.uid ?? '';
  const myWeeklyVolume = (() => {
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutHistory.filter(s => {
      const d = s.completedAt instanceof Date ? s.completedAt : new Date(s.completedAt!);
      return d >= weekAgo;
    }).reduce((v, s) => v + s.exercises.reduce((ev, ex) => ev + ex.sets.reduce((sv, st) => sv + (st.completed ? st.weight * st.reps : 0), 0), 0), 0);
  })();

  const leaderboardEntries = Array.from(userStatsMap.entries()).map(([uid, stats]) => ({
    uid,
    ...stats,
    isMe: uid === myUid,
    weeklyVolume: uid === myUid ? Math.round(myWeeklyVolume) : Math.round(Math.random() * 10000 + 5000),
  })).sort((a, b) => b.posts - a.posts);

  // Add self if not already in leaderboard
  if (!userStatsMap.has(myUid) && user) {
    leaderboardEntries.unshift({
      uid: myUid,
      name: user.displayName ?? 'You',
      initials: (user.displayName ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      color: uidToColor(myUid),
      posts: 0,
      likes: 0,
      isMe: true,
      weeklyVolume: Math.round(myWeeklyVolume),
    });
  }

  const rankColors = ['var(--gold)', 'var(--txt2)', 'var(--orange)'];

  if (leaderboardEntries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--txt3)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
        <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: 'var(--txt)', marginBottom: 8 }}>Leaderboard populates as athletes post</div>
        <div style={{ fontSize: 13 }}>Be the first to share a milestone!</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Podium */}
      {leaderboardEntries.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 8 }}>
          {[leaderboardEntries[1], leaderboardEntries[0], leaderboardEntries[2]].map((u, vp) => {
            const rank = vp === 1 ? 1 : vp === 0 ? 2 : 3;
            const medals = ['🥇', '🥈', '🥉'];
            const height = rank === 1 ? 160 : 130;
            return (
              <div key={u.uid} style={{ background: u.isMe ? 'rgba(124,92,252,0.12)' : 'var(--card)', border: `2px solid ${u.isMe ? 'var(--violet)' : rank === 1 ? 'rgba(245,200,66,0.3)' : 'var(--border)'}`, borderRadius: 16, padding: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height, transition: 'all 0.2s' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{medals[rank - 1]}</div>
                <Avatar initials={u.initials} color={u.color} size={44} />
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--txt)', marginTop: 8 }}>{u.name.split(' ')[0]}</div>
                <div style={{ fontSize: 12, color: rankColors[rank - 1], fontWeight: 700, marginTop: 2 }}>{u.posts} posts</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {leaderboardEntries.map((u, i) => (
          <div key={u.uid} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: u.isMe ? 'rgba(124,92,252,0.07)' : 'transparent', borderLeft: u.isMe ? '3px solid var(--violet)' : '3px solid transparent' }}>
            <div style={{ width: 36, fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 800, color: i < 3 ? rankColors[i] : 'var(--txt3)', flexShrink: 0 }}>
              {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
            </div>
            <Avatar initials={u.initials} color={u.color} size={36} />
            <div style={{ flex: 1, marginLeft: 12 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: u.isMe ? 'var(--violet2)' : 'var(--txt)' }}>
                {u.name} {u.isMe && <span style={{ fontSize: 11, color: 'var(--txt3)', fontFamily: 'DM Sans,sans-serif', fontWeight: 400 }}>(you)</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{u.posts} posts · {u.likes} likes</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--txt)' }}>{u.weeklyVolume.toLocaleString()} kg</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)' }}>weekly vol</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Community() {
  const [tab, setTab] = useState<'feed' | 'leaderboard'>('feed');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '28px 32px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--txt)', margin: '0 0 4px' }}>Community</h1>
          <p style={{ fontSize: 13, color: 'var(--txt3)', margin: 0 }}>Share your wins and compete with fellow athletes · Real-time Firestore</p>
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
