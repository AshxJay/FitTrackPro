export interface CommunityUser {
  id: string; name: string; username: string; initials: string; avatarColor: string;
  streak: number; volume: number; prs: number; calories: number; rank: number;
}

export const COMMUNITY_USERS: CommunityUser[] = [
  { id: 'u1', name: 'Alex Rivera', username: 'alexrivera', initials: 'AR', avatarColor: '#7c5cfc', streak: 21, volume: 12840, prs: 8, calories: 2218, rank: 1 },
  { id: 'u2', name: 'Jordan Kim', username: 'jkim_lifts', initials: 'JK', avatarColor: '#00e5a0', streak: 35, volume: 15200, prs: 5, calories: 2890, rank: 2 },
  { id: 'u3', name: 'Sam Patel', username: 'sampatel_fit', initials: 'SP', avatarColor: '#ff6b35', streak: 14, volume: 11500, prs: 12, calories: 2650, rank: 3 },
  { id: 'u4', name: 'Riley Chen', username: 'rchen_runs', initials: 'RC', avatarColor: '#f5c842', streak: 42, volume: 9800, prs: 3, calories: 2100, rank: 4 },
  { id: 'u5', name: 'Taylor Brooks', username: 'tbrooks90', initials: 'TB', avatarColor: '#9b7ffe', streak: 7, volume: 14100, prs: 7, calories: 3100, rank: 5 },
  { id: 'u6', name: 'Casey Morgan', username: 'caseyM_gains', initials: 'CM', avatarColor: '#00c8ff', streak: 19, volume: 10200, prs: 9, calories: 2450, rank: 6 },
  { id: 'u7', name: 'Drew Johnson', username: 'drewj_lifts', initials: 'DJ', avatarColor: '#ff3b5c', streak: 28, volume: 13500, prs: 6, calories: 2780, rank: 7 },
  { id: 'u8', name: 'Quinn Davis', username: 'quinndavis', initials: 'QD', avatarColor: '#7fe5f0', streak: 11, volume: 8900, prs: 4, calories: 2300, rank: 8 },
  { id: 'u9', name: 'Morgan Lee', username: 'morganlee_fit', initials: 'ML', avatarColor: '#c084fc', streak: 56, volume: 11800, prs: 11, calories: 2560, rank: 9 },
  { id: 'u10', name: 'Avery White', username: 'averywhite', initials: 'AW', avatarColor: '#fb923c', streak: 9, volume: 9100, prs: 2, calories: 2180, rank: 10 },
];

export type FeedPostType = 'pr' | 'workout' | 'streak' | 'photo';
export interface FeedPost {
  id: string; userId: string; type: FeedPostType; text: string;
  likes: number; comments: number; time: string; liked: boolean;
  meta?: { exercise?: string; weight?: number; reps?: number; streak?: number; duration?: number; };
}

export const FEED_POSTS: FeedPost[] = [
  { id: 'p1', userId: 'u2', type: 'pr', text: 'Just crushed a new bench press PR! 5 plates 🏆🔥', likes: 34, comments: 8, time: '12 min ago', liked: false, meta: { exercise: 'Bench Press', weight: 135, reps: 1 } },
  { id: 'p2', userId: 'u9', type: 'streak', text: 'Day 56 in a row! Never breaking the chain 🔥🔥🔥', likes: 91, comments: 22, time: '38 min ago', liked: true, meta: { streak: 56 } },
  { id: 'p3', userId: 'u4', type: 'workout', text: '10km morning zone 2 run ✅ Feeling great this week!', likes: 27, comments: 5, time: '1 hr ago', liked: false, meta: { duration: 56 } },
  { id: 'p5', userId: 'u5', type: 'workout', text: 'Leg day complete. 5 sets of squats at 150kg 🦵💥', likes: 48, comments: 11, time: '2 hr ago', liked: false, meta: { duration: 70 } },
  { id: 'p6', userId: 'u3', type: 'pr', text: 'New deadlift PR — 200kg! Never thought I\'d get here 💪', likes: 112, comments: 31, time: '3 hr ago', liked: false, meta: { exercise: 'Deadlift', weight: 200, reps: 1 } },
  { id: 'p7', userId: 'u6', type: 'photo', text: '12-week transformation check-in. Consistency over motivation! 📸', likes: 203, comments: 44, time: '5 hr ago', liked: true },
  { id: 'p8', userId: 'u7', type: 'workout', text: 'Push day B done. Feeling the gains from this program 💪', likes: 19, comments: 3, time: '7 hr ago', liked: false, meta: { duration: 62 } },
  { id: 'p9', userId: 'u8', type: 'streak', text: '11 days straight! Building the habit 🔥', likes: 15, comments: 2, time: '9 hr ago', liked: false, meta: { streak: 11 } },
  { id: 'p10', userId: 'u10', type: 'workout', text: 'First upper body session post-injury. Taking it slow but feeling strong again 💪', likes: 67, comments: 18, time: '12 hr ago', liked: false },
];
