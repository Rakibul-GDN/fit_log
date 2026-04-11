import { z } from 'zod';

/** Pagination query parameters */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(200).default(10),
});

/** Registration request body */
export const registerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
});

/** Login request body */
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

/** Email verification request body */
export const verifyEmailSchema = z.object({
  token: z.uuid(),
});

/** Forgot password request body */
export const forgotPasswordSchema = z.object({
  email: z.email(),
});

/** Reset password request body */
export const resetPasswordSchema = z.object({
  token: z.uuid(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
});

/** Routine creation/update body */
export const routineSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  assignments: z
    .array(
      z.object({
        exerciseId: z.uuid(),
        dayOfWeek: z.enum([
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
          'SUNDAY',
        ]),
        defaultSets: z.number().int().min(1).max(100).default(3),
        defaultReps: z.number().int().min(1).max(500).default(10),
        defaultWeight: z.number().min(0).default(0),
        order: z.number().int().min(0),
      }),
    )
    .default([]),
});

/** Exercise creation body */
export const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum([
    'BARBELL',
    'DUMBBELL',
    'MACHINE',
    'CABLE',
    'BODYWEIGHT',
    'KETTLEBELL',
    'RESISTANCE_BAND',
    'OTHER',
  ]),
  primaryMuscles: z.array(z.string().min(1)).min(1),
});

/** Workout log creation/update body */
export const workoutLogSchema = z.object({
  routineId: z.uuid().optional().nullable(),
  dayOfWeek: z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]),
  workoutDate: z.coerce.date(),
  notes: z.string().max(1000).optional(),
  entries: z
    .array(
      z.object({
        exerciseId: z.uuid(),
        setsCompleted: z.number().int().min(1).max(100),
        repsPerSet: z.array(z.number().int().min(1).max(500)),
        weightPerSet: z.array(z.number().min(0)),
        notes: z.string().max(500).optional(),
      }),
    )
    .min(1),
});

/** Body measurement creation body */
export const bodyMeasurementSchema = z.object({
  measurementType: z.enum([
    'BODY_WEIGHT',
    'CHEST',
    'WAIST',
    'HIPS',
    'LEFT_ARM',
    'RIGHT_ARM',
    'LEFT_THIGH',
    'RIGHT_THIGH',
    'LEFT_CALF',
    'RIGHT_CALF',
    'SHOULDERS',
    'NECK',
    'BODY_FAT_PERCENTAGE',
  ]),
  value: z.number().positive().max(1000),
  unit: z.enum(['KG', 'LBS', 'CM', 'INCHES']),
  measurementDate: z.coerce.date(),
  notes: z.string().max(500).optional(),
});

/** Settings update body */
export const settingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email().optional(),
  preferredUnits: z.enum(['METRIC', 'IMPERIAL']).optional(),
});
