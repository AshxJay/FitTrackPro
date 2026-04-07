export type FitnessGoal = 'build_muscle' | 'lose_fat' | 'endurance' | 'athletic' | 'general';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';
export type EquipmentType = 'bodyweight' | 'minimal' | 'full_gym' | 'commercial';
export type WorkoutType = 'strength' | 'hypertrophy' | 'hiit' | 'cardio' | 'mobility';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'glutes' | 'core' | 'calves';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  stats: { height: number; weight: number; age: number; gender: string };
  goals: FitnessGoal[];
  experienceLevel: ExperienceLevel;
  equipment: EquipmentType[];
  units: 'metric' | 'imperial';
  subscription: 'free' | 'pro' | 'elite';
  streak: number;
  joinedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment: string;
  mechanic: 'compound' | 'isolation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips: string[];
}

export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  isWarmup: boolean;
  timestamp: Date;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  notes: string;
  order: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimatedOneRM: number;
  achievedAt: Date;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  name: string;
  type: WorkoutType;
  startedAt: Date;
  completedAt?: Date;
  duration: number;
  exercises: ExerciseLog[];
  notes: string;
  mood: 1 | 2 | 3 | 4 | 5;
  totalVolume: number;
  prsBreached: PersonalRecord[];
}

export interface NutritionEntry {
  id: string;
  userId: string;
  date: string;
  meals: Meal[];
  waterIntake: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface Meal {
  id: string;
  name: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  items: FoodItem[];
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface BodyMetric {
  id?: string;
  date: string;
  weight: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
}

export interface ScheduledWorkout {
  id: string;
  name: string;
  type: WorkoutType;
  dayOfWeek: number;
  estimatedDuration: number;
  muscleGroups: MuscleGroup[];
  exercises: { name: string; sets: number; reps: string }[];
}

export interface AIInsight {
  id: string;
  type: 'performance' | 'recovery' | 'nutrition' | 'warning';
  title: string;
  message: string;
  createdAt: Date;
}
