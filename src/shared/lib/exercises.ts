export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio' | 'Full Body';
export type Equipment = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Kettlebell' | 'Other';

export interface ExerciseDef {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  ytId: string; // YouTube Video ID for PiP
}

export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // CHEST
  { id: 'ch_1', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', ytId: 'rT7DgCr-3pg' },
  { id: 'ch_2', name: 'Incline Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', ytId: 'SrqOu55lrOU' },
  { id: 'ch_3', name: 'Dumbbell Bench Press', muscleGroup: 'Chest', equipment: 'Dumbbell', ytId: 'VmB1G1K7v94' },
  { id: 'ch_4', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', ytId: '8iPEnn-ltC8' },
  { id: 'ch_5', name: 'Decline Barbell Press', muscleGroup: 'Chest', equipment: 'Barbell', ytId: 'LfyQBUKR8SE' },
  { id: 'ch_6', name: 'Dumbbell Flyes', muscleGroup: 'Chest', equipment: 'Dumbbell', ytId: 'eozdVDA78K0' },
  { id: 'ch_7', name: 'Cable Crossover', muscleGroup: 'Chest', equipment: 'Cable', ytId: 'taI4XduLpTk' },
  { id: 'ch_8', name: 'Pec Deck Machine', muscleGroup: 'Chest', equipment: 'Machine', ytId: 'O-WqV-bH4tI' },
  { id: 'ch_9', name: 'Push-Ups', muscleGroup: 'Chest', equipment: 'Bodyweight', ytId: 'IODxDxX7oi4' },
  { id: 'ch_10', name: 'Weighted Dips', muscleGroup: 'Chest', equipment: 'Bodyweight', ytId: 'yN6Q1UI_xkE' },

  // BACK
  { id: 'bk_1', name: 'Barbell Deadlift', muscleGroup: 'Back', equipment: 'Barbell', ytId: 'op9kVnSso6Q' },
  { id: 'bk_2', name: 'Romanian Deadlift (RDL)', muscleGroup: 'Back', equipment: 'Barbell', ytId: 'JCXUYuzwNrM' },
  { id: 'bk_3', name: 'Pull-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', ytId: 'eGo4IYtlCvk' },
  { id: 'bk_4', name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', ytId: 'CAwf7n6Luuc' },
  { id: 'bk_5', name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', ytId: '9efgcAjQe7E' },
  { id: 'bk_6', name: 'Single-Arm Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell', ytId: 'pYcpY20QaE8' },
  { id: 'bk_7', name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cable', ytId: 'GZbfZ033f74' },
  { id: 'bk_8', name: 'T-Bar Row', muscleGroup: 'Back', equipment: 'Machine', ytId: 'j3IgkO7V5_g' },
  { id: 'bk_9', name: 'Straight-Arm Pulldown', muscleGroup: 'Back', equipment: 'Cable', ytId: 'G18jC3GzEGE' },
  { id: 'bk_10', name: 'Chin-Ups', muscleGroup: 'Back', equipment: 'Bodyweight', ytId: 'brhRXlOhsAM' },

  // LEGS
  { id: 'lg_1', name: 'Barbell Back Squat', muscleGroup: 'Legs', equipment: 'Barbell', ytId: 'bEv6CCg2BC8' },
  { id: 'lg_2', name: 'Barbell Front Squat', muscleGroup: 'Legs', equipment: 'Barbell', ytId: 'v-mQjiGCJjE' },
  { id: 'lg_3', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', ytId: 'IZxyjW7OSvc' },
  { id: 'lg_4', name: 'Hack Squat', muscleGroup: 'Legs', equipment: 'Machine', ytId: 'rYgF8A4f7BA' },
  { id: 'lg_5', name: 'Bulgarian Split Squat', muscleGroup: 'Legs', equipment: 'Dumbbell', ytId: '2C-uNgKwPLE' },
  { id: 'lg_6', name: 'Walking Lunges', muscleGroup: 'Legs', equipment: 'Dumbbell', ytId: 'L8fvypPrzzs' },
  { id: 'lg_7', name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', ytId: 'YyvSfVjQeL0' },
  { id: 'lg_8', name: 'Lying Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', ytId: '1Tq3QdYUuHs' },
  { id: 'lg_9', name: 'Seated Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', ytId: 'F488k6O1Uto' },
  { id: 'lg_10', name: 'Standing Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', ytId: 'ym1eb-tT-jQ' },
  { id: 'lg_11', name: 'Seated Calf Raise', muscleGroup: 'Legs', equipment: 'Machine', ytId: 'JbyjNymZOt0' },
  { id: 'lg_12', name: 'Hip Thrust', muscleGroup: 'Legs', equipment: 'Barbell', ytId: 'SEdqd1n0cvg' },
  { id: 'lg_13', name: 'Goblet Squat', muscleGroup: 'Legs', equipment: 'Dumbbell', ytId: 'MeIiIdcgROs' },
  { id: 'lg_14', name: 'Good Mornings', muscleGroup: 'Legs', equipment: 'Barbell', ytId: 'v_K02v7AkiI' },
  { id: 'lg_15', name: 'Sumo Deadlift', muscleGroup: 'Legs', equipment: 'Barbell', ytId: 'wQCSGlsL2-I' },

  // SHOULDERS
  { id: 'sh_1', name: 'Overhead Press (OHP)', muscleGroup: 'Shoulders', equipment: 'Barbell', ytId: '2yjwXTZKDDI' },
  { id: 'sh_2', name: 'Seated Dumbbell Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', ytId: 'qEwKCR5JCog' },
  { id: 'sh_3', name: 'Arnold Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', ytId: '6Z15_Wb2B-c' },
  { id: 'sh_4', name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', ytId: '3VcKaXpzqRo' },
  { id: 'sh_5', name: 'Cable Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Cable', ytId: 'PPrzBWZDOhA' },
  { id: 'sh_6', name: 'Machine Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Machine', ytId: 'WvLMauqrnK8' },
  { id: 'sh_7', name: 'Face Pulls', muscleGroup: 'Shoulders', equipment: 'Cable', ytId: 'V8dZ3pyiCBo' },
  { id: 'sh_8', name: 'Reverse Pec Deck', muscleGroup: 'Shoulders', equipment: 'Machine', ytId: '5q_3CFOx5u4' },
  { id: 'sh_9', name: 'Dumbbell Front Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', ytId: '-t7fuZnFjQ4' },
  { id: 'sh_10', name: 'Upright Row', muscleGroup: 'Shoulders', equipment: 'Barbell', ytId: 'amCU-ziHITM' },

  // ARMS
  { id: 'ar_1', name: 'Barbell Curl', muscleGroup: 'Arms', equipment: 'Barbell', ytId: 'kwG2ipFRgfo' },
  { id: 'ar_2', name: 'Dumbbell Alternating Curl', muscleGroup: 'Arms', equipment: 'Dumbbell', ytId: 'sAq_ocpRh_I' },
  { id: 'ar_3', name: 'Hammer Curl', muscleGroup: 'Arms', equipment: 'Dumbbell', ytId: 'zC3nLlEvin4' },
  { id: 'ar_4', name: 'EZ Bar Preacher Curl', muscleGroup: 'Arms', equipment: 'Barbell', ytId: 'fIWP-WoVvgU' },
  { id: 'ar_5', name: 'Cable Bicep Curl', muscleGroup: 'Arms', equipment: 'Cable', ytId: 'AsKVjA6Jc1U' },
  { id: 'ar_6', name: 'Tricep Pushdown (Rope)', muscleGroup: 'Arms', equipment: 'Cable', ytId: 'vB5OHsJ3EME' },
  { id: 'ar_7', name: 'Tricep Pushdown (V-Bar)', muscleGroup: 'Arms', equipment: 'Cable', ytId: '2-LAMcpzODU' },
  { id: 'ar_8', name: 'Skull Crushers', muscleGroup: 'Arms', equipment: 'Barbell', ytId: 'd_KZxkY_0cM' },
  { id: 'ar_9', name: 'Overhead Tricep Extension', muscleGroup: 'Arms', equipment: 'Dumbbell', ytId: 'nRiJVZDpdL0' },
  { id: 'ar_10', name: 'Close-Grip Bench Press', muscleGroup: 'Arms', equipment: 'Barbell', ytId: 'nEF0bv2FW94' },
  { id: 'ar_11', name: 'Concentration Curls', muscleGroup: 'Arms', equipment: 'Dumbbell', ytId: 'Jvj2wV0ikQo' },
  { id: 'ar_12', name: 'Tricep Kickbacks', muscleGroup: 'Arms', equipment: 'Dumbbell', ytId: '6SS6K3lAwZ8' },

  // CORE
  { id: 'cr_1', name: 'Crunches', muscleGroup: 'Core', equipment: 'Bodyweight', ytId: 'Xyd_fa5zoEU' },
  { id: 'cr_2', name: 'Plank', muscleGroup: 'Core', equipment: 'Bodyweight', ytId: 'pSHjTRCQxIw' },
  { id: 'cr_3', name: 'Hanging Leg Raises', muscleGroup: 'Core', equipment: 'Bodyweight', ytId: 'Pr1ieGZ5atk' },
  { id: 'cr_4', name: 'Cable Crunch', muscleGroup: 'Core', equipment: 'Cable', ytId: '5ER5Of4F-TA' },
  { id: 'cr_5', name: 'Russian Twists', muscleGroup: 'Core', equipment: 'Bodyweight', ytId: 'wkD8rjkodUI' },
  { id: 'cr_6', name: 'Ab Wheel Rollout', muscleGroup: 'Core', equipment: 'Other', ytId: 'KjGhe8s8p44' },
  { id: 'cr_7', name: 'Bicycle Crunches', muscleGroup: 'Core', equipment: 'Bodyweight', ytId: '9FGilxCbdz8' },
  { id: 'cr_8', name: 'Dragon Flag', muscleGroup: 'Core', equipment: 'Bodyweight', ytId: 'vVvGfWNTfP4' },

  // CARDIO / FULL BODY
  { id: 'cb_1', name: 'Treadmill Sprints', muscleGroup: 'Cardio', equipment: 'Machine', ytId: 'tOQvT4YJ6pQ' },
  { id: 'cb_2', name: 'Rowing Machine', muscleGroup: 'Cardio', equipment: 'Machine', ytId: 'zQGQOsEwYw4' },
  { id: 'cb_3', name: 'Stair Climber', muscleGroup: 'Cardio', equipment: 'Machine', ytId: 'I7mC6X01F_Q' },
  { id: 'cb_4', name: 'Kettlebell Swings', muscleGroup: 'Full Body', equipment: 'Kettlebell', ytId: 'sSBYGtgLZPU' },
  { id: 'cb_5', name: 'Burpees', muscleGroup: 'Full Body', equipment: 'Bodyweight', ytId: 'auBLPKaJ2vM' },
  { id: 'cb_6', name: 'Jump Rope', muscleGroup: 'Cardio', equipment: 'Other', ytId: 'FJmR874kK2E' },
  { id: 'cb_7', name: 'Cycling', muscleGroup: 'Cardio', equipment: 'Machine', ytId: 'hTf-n404oQ0' },
  { id: 'cb_8', name: 'Battle Ropes', muscleGroup: 'Full Body', equipment: 'Other', ytId: 'n1hZ24x2P_E' },
];

export function getExercisesByMuscle(muscle: MuscleGroup): ExerciseDef[] {
  return EXERCISE_LIBRARY.filter(e => e.muscleGroup === muscle);
}

export function searchExercises(query: string): ExerciseDef[] {
  const q = query.toLowerCase();
  return EXERCISE_LIBRARY.filter(e => 
    e.name.toLowerCase().includes(q) || 
    e.muscleGroup.toLowerCase().includes(q) ||
    e.equipment.toLowerCase().includes(q)
  );
}
