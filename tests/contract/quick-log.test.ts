import { describe, it, expect } from 'vitest';
import {
  successResponseValidator,
  errorResponseValidator,
} from '@/tests/contract/helpers';
import { z } from 'zod';

describe('Quick Log API Contract Tests', () => {
  const logEntrySchema = z.object({
    id: z.string(),
    exerciseId: z.string(),
    setsCompleted: z.number(),
    repsPerSet: z.array(z.number()),
    weight: z.number(),
    notes: z.string().nullable(),
  });

  const quickLogResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    routineId: z.string().nullable(),
    dayOfWeek: z.string(),
    workoutDate: z.string(),
    notes: z.string().nullable(),
    logEntries: z.array(logEntrySchema),
  });

  describe('POST /api/routines/[id]/quick-log', () => {
    it('should match success response shape for quick-log creation', () => {
      const schema = successResponseValidator(quickLogResponseSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'log-uuid',
          userId: 'user-uuid',
          routineId: 'routine-uuid',
          dayOfWeek: 'MONDAY',
          workoutDate: '2026-04-09T00:00:00.000Z',
          notes: null,
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

    it('should match error response shape for invalid routine', () => {
      const result = errorResponseValidator.safeParse({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Routine not found.',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should match error response shape for no exercises on selected day', () => {
      const result = errorResponseValidator.safeParse({
        success: false,
        error: {
          code: 'NO_EXERCISES',
          message: 'No exercises assigned to this day.',
        },
      });

      expect(result.success).toBe(true);
    });
  });
});
