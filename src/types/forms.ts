import type { DayOfWeek, ExerciseCategory } from '@prisma/client';

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface ExerciseAssignmentForm {
  exerciseId: string;
  dayOfWeek: DayOfWeek;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  order: number;
}

export interface RoutineForm {
  name: string;
  description: string;
  assignments: ExerciseAssignmentForm[];
}

export interface WorkoutForm {
  dayOfWeek: DayOfWeek;
  workoutDate: Date;
  notes: string;
  entries: {
    exerciseId: string;
    setsCompleted: number;
    repsPerSet: number[];
    weight: number;
    notes: string;
  }[];
}

export interface ExerciseForm {
  name: string;
  description: string;
  category: ExerciseCategory;
  primaryMuscles: string[];
}
