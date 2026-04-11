import type { DayOfWeek, ExerciseCategory, MeasurementType, MeasurementUnit, UnitSystem } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  preferredUnits: UnitSystem;
  createdAt: Date;
  updatedAt: Date;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  category: ExerciseCategory;
  primaryMuscles: string[];
  isSystemExercise: boolean;
  createdById: string | null;
  createdAt: Date;
}

export interface ExerciseAssignment {
  id: string;
  routineId: string;
  exerciseId: string;
  dayOfWeek: DayOfWeek;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  order: number;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  routineId: string | null;
  dayOfWeek: DayOfWeek;
  workoutDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogEntry {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  setsCompleted: number;
  repsPerSet: number[];
  weightPerSet: number[];
  notes: string | null;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  measurementType: MeasurementType;
  value: number;
  unit: MeasurementUnit;
  measurementDate: Date;
  notes: string | null;
  createdAt: Date;
}

export interface RoutineWithAssignments extends Routine {
  exerciseAssignments: (ExerciseAssignment & { exercise: Exercise })[];
}

export interface WorkoutLogWithEntries extends WorkoutLog {
  logEntries: (LogEntry & { exercise: Exercise })[];
}
