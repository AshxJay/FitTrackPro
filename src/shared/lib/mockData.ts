import type { User, ScheduledWorkout, AIInsight, PersonalRecord } from '../types';

export const mockUser: User = {
  id: 'usr_alex_001',
  email: 'alex.rivera@email.com',
  username: 'alexrivera',
  displayName: 'Alex Rivera',
  stats: { height: 180, weight: 82, age: 28, gender: 'male' },
  goals: ['build_muscle'],
  experienceLevel: 'intermediate',
  equipment: ['full_gym'],
  units: 'metric',
  subscription: 'pro',
  streak: 21,
  joinedAt: new Date('2025-12-01'),
};

export const mockSchedule: ScheduledWorkout[] = [
  {
    id: 'sw_1', name: 'Push Day A', type: 'strength', dayOfWeek: 1, estimatedDuration: 65,
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    exercises: [
      { name: 'Flat Barbell Bench Press', sets: 4, reps: '6' },
      { name: 'Incline DB Press', sets: 3, reps: '10' },
      { name: 'Cable Flyes', sets: 3, reps: '12' },
      { name: 'Overhead Press', sets: 3, reps: '8' },
      { name: 'Lateral Raises', sets: 4, reps: '15' },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12' },
    ],
  },
  {
    id: 'sw_2', name: 'Pull Day A', type: 'strength', dayOfWeek: 2, estimatedDuration: 70,
    muscleGroups: ['back', 'biceps'],
    exercises: [
      { name: 'Deadlift', sets: 4, reps: '5' },
      { name: 'Barbell Rows', sets: 4, reps: '8' },
      { name: 'Pull-ups', sets: 3, reps: '8' },
      { name: 'Cable Rows', sets: 3, reps: '12' },
      { name: 'Face Pulls', sets: 3, reps: '15' },
      { name: 'Barbell Curls', sets: 3, reps: '10' },
    ],
  },
  {
    id: 'sw_3', name: 'Zone 2 Cardio', type: 'cardio', dayOfWeek: 3, estimatedDuration: 45,
    muscleGroups: ['legs'],
    exercises: [{ name: 'Treadmill / Bike', sets: 1, reps: '45 min' }],
  },
  {
    id: 'sw_4', name: 'Leg Day A', type: 'strength', dayOfWeek: 4, estimatedDuration: 75,
    muscleGroups: ['legs', 'glutes', 'calves'],
    exercises: [
      { name: 'Back Squat', sets: 4, reps: '6' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10' },
      { name: 'Leg Press', sets: 3, reps: '12' },
      { name: 'Walking Lunges', sets: 3, reps: '20' },
      { name: 'Leg Curls', sets: 3, reps: '12' },
      { name: 'Calf Raises', sets: 4, reps: '15' },
    ],
  },
  {
    id: 'sw_5', name: 'Push Day B', type: 'hypertrophy', dayOfWeek: 5, estimatedDuration: 60,
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    exercises: [
      { name: 'Incline Barbell Press', sets: 4, reps: '8' },
      { name: 'DB Flat Press', sets: 3, reps: '12' },
      { name: 'Pec Deck', sets: 3, reps: '15' },
      { name: 'Arnold Press', sets: 3, reps: '10' },
      { name: 'Skull Crushers', sets: 3, reps: '12' },
    ],
  },
  {
    id: 'sw_6', name: 'HIIT Session', type: 'hiit', dayOfWeek: 6, estimatedDuration: 30,
    muscleGroups: ['core', 'legs'],
    exercises: [
      { name: 'Sprint Intervals', sets: 8, reps: '30s on / 30s off' },
      { name: 'Box Jumps', sets: 4, reps: '10' },
      { name: 'Burpees', sets: 3, reps: '15' },
    ],
  },
];

// Generate 26 weeks of heatmap data
export const generateHeatmapData = (): number[] => {
  const data: number[] = [];
  for (let i = 0; i < 26 * 7; i++) {
    const dayOfWeek = i % 7;
    if (dayOfWeek === 0) { data.push(0); continue; } // Sunday rest
    const rand = Math.random();
    if (rand < 0.15) data.push(0);
    else if (rand < 0.35) data.push(1);
    else if (rand < 0.6) data.push(2);
    else if (rand < 0.85) data.push(3);
    else data.push(4);
  }
  return data;
};

// Strength progression (estimated 1RM over time)
export const strengthHistory = {
  labels: ['Jan 6', 'Jan 13', 'Jan 20', 'Jan 27', 'Feb 3', 'Feb 10', 'Feb 17', 'Feb 24', 'Mar 3', 'Mar 10', 'Mar 17', 'Mar 24', 'Mar 31', 'Apr 6'],
  bench:     [88,  90,  91,  93,  94,  95,  96,  97,  99, 100, 101, 102, 102, 103],
  squat:     [118, 121, 123, 126, 128, 130, 131, 133, 135, 137, 138, 139, 140, 140],
  deadlift:  [150, 153, 155, 158, 160, 162, 164, 166, 168, 170, 171, 173, 174, 175],
  ohp:       [58,  59,  60,  61,  62,  63,  64,  64,  65,  66,  67,  68,  69,  70],
};

// Body weight progression (16 weeks, cutting from 86 to 82)
export const bodyWeightHistory = {
  labels: Array.from({ length: 16 }, (_, i) => {
    const d = new Date('2025-12-15');
    d.setDate(d.getDate() + i * 7);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }),
  weights: [86.2, 85.8, 85.4, 85.1, 84.7, 84.3, 84.0, 83.6, 83.3, 83.0, 82.7, 82.4, 82.2, 82.0, 81.9, 82.0],
};

export const mockPRs: PersonalRecord[] = [
  { exerciseId: 'bench', exerciseName: 'Bench Press', weight: 102.5, reps: 5, estimatedOneRM: 115, achievedAt: new Date('2026-04-03') },
  { exerciseId: 'squat', exerciseName: 'Back Squat', weight: 140, reps: 3, estimatedOneRM: 150, achievedAt: new Date('2026-04-01') },
  { exerciseId: 'ohp', exerciseName: 'Overhead Press', weight: 72.5, reps: 4, estimatedOneRM: 81, achievedAt: new Date('2026-03-31') },
];

export const mockAIInsights: AIInsight[] = [
  {
    id: 'ai_1', type: 'performance', title: 'Volume Spike Detected',
    message: 'Your bench press volume is up 22% this month. Consider adding a 5th set to your top compound — you\'re leaving gains on the table.',
    createdAt: new Date(),
  },
  {
    id: 'ai_2', type: 'warning', title: 'Leg Frequency Drop',
    message: 'You\'ve trained legs only once in 9 days. Frequency drop detected — schedule Pull + Legs back-to-back Wed/Thu.',
    createdAt: new Date(),
  },
  {
    id: 'ai_3', type: 'nutrition', title: 'Protein Target Streak',
    message: 'Protein target hit 6 of 7 days this week. You\'re in a slight surplus — perfect for this hypertrophy block.',
    createdAt: new Date(),
  },
];

export const todayNutrition = {
  calories: { consumed: 1618, target: 2000 },
  protein: { consumed: 178, target: 200 },
  carbs: { consumed: 240, target: 280 },
  fat: { consumed: 62, target: 70 },
  water: 5, // cups out of 8
};

export const weeklyStats = {
  caloriesBurned: 2218,
  caloriesGoal: 3000,
  weeklyVolume: 12840,
  lastWeekVolume: 11856,
  streak: 21,
  streakBest: 34,
  prsThisMonth: 8,
  prsLastMonth: 5,
  recoveryScore: 80,
};
