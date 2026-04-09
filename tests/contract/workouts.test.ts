import { describe, it, expect } from 'vitest';
import {
  successResponseValidator,
  paginatedResponseValidator,
  errorResponseValidator,
} from './helpers';
import { z } from 'zod';

describe('Workouts API Contract Tests', () => {
  const logEntrySchema = z.object({
    id: z.string(),
    exerciseId: z.string(),
    setsCompleted: z.number(),
    repsPerSet: z.array(z.number()),
    weight: z.number(),
    notes: z.string().nullable(),
  });

  const workoutSchema = z.object({
    id: z.string(),
    userId: z.string(),
    routineId: z.string().nullable(),
    dayOfWeek: z.string(),
    workoutDate: z.string(),
    notes: z.string().nullable(),
    logEntries: z.array(logEntrySchema),
  });

  describe('GET /api/workouts', () => {
    it('should match paginated response shape for workout history', () => {
      const schema = paginatedResponseValidator(workoutSchema);

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'workout-1',
            userId: 'user-1',
            routineId: null,
            dayOfWeek: 'MONDAY',
            workoutDate: '2026-04-09T00:00:00.000Z',
            notes: null,
            logEntries: [],
          },
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/workouts', () => {
    it('should match success response shape for workout creation', () => {
      const schema = successResponseValidator(workoutSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'workout-2',
          userId: 'user-1',
          routineId: null,
          dayOfWeek: 'TUESDAY',
          workoutDate: '2026-04-09T00:00:00.000Z',
          notes: 'Great session',
          logEntries: [
            {
              id: 'entry-1',
              exerciseId: 'ex-1',
              setsCompleted: 3,
              repsPerSet: [10, 10, 10],
              weight: 60,
              notes: null,
            },
          ],
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('GET /api/workouts/[id]', () => {
    it('should match success response shape for workout detail', () => {
      const schema = successResponseValidator(workoutSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'workout-1',
          userId: 'user-1',
          routineId: null,
          dayOfWeek: 'MONDAY',
          workoutDate: '2026-04-09T00:00:00.000Z',
          notes: null,
          logEntries: [],
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('PATCH /api/workouts/[id]', () => {
    it('should match success response shape for workout update', () => {
      const schema = successResponseValidator(workoutSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'workout-1',
          userId: 'user-1',
          routineId: null,
          dayOfWeek: 'MONDAY',
          workoutDate: '2026-04-09T00:00:00.000Z',
          notes: 'Updated notes',
          logEntries: [],
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('DELETE /api/workouts/[id]', () => {
    it('should match success response shape for workout deletion', () => {
      const schema = successResponseValidator(z.object({}));

      const mockResponse = {
        success: true,
        data: {},
        message: 'Workout deleted successfully.',
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });
});
