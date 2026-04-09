import { describe, it, expect } from 'vitest';
import {
  successResponseValidator,
  paginatedResponseValidator,
  errorResponseValidator,
} from './helpers';
import { z } from 'zod';

describe('Routines API Contract Tests', () => {
  const exerciseAssignmentSchema = z.object({
    id: z.string(),
    exerciseId: z.string(),
    dayOfWeek: z.string(),
    defaultSets: z.number(),
    defaultReps: z.number(),
    defaultWeight: z.number(),
    order: z.number(),
  });

  const routineSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

  const routineWithAssignmentsSchema = routineSchema.extend({
    exerciseAssignments: z.array(
      exerciseAssignmentSchema.extend({
        exercise: z.object({
          id: z.string(),
          name: z.string(),
          category: z.string(),
        }),
      }),
    ),
  });

  describe('GET /api/routines', () => {
    it('should match paginated response shape for routine list', () => {
      const schema = paginatedResponseValidator(routineSchema);

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'uuid-1',
            name: 'Strength Phase',
            description: null,
            createdAt: '2026-04-09T00:00:00.000Z',
            updatedAt: '2026-04-09T00:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          totalItems: 1,
          totalPages: 1,
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/routines', () => {
    it('should match success response shape for routine creation', () => {
      const schema = successResponseValidator(routineWithAssignmentsSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'uuid-1',
          name: 'Strength Phase',
          description: 'Build strength',
          createdAt: '2026-04-09T00:00:00.000Z',
          updatedAt: '2026-04-09T00:00:00.000Z',
          exerciseAssignments: [
            {
              id: 'assign-1',
              exerciseId: 'ex-1',
              dayOfWeek: 'MONDAY',
              defaultSets: 3,
              defaultReps: 10,
              defaultWeight: 60,
              order: 0,
              exercise: {
                id: 'ex-1',
                name: 'Bench Press',
                category: 'BARBELL',
              },
            },
          ],
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should match error response shape for validation errors', () => {
      const result = errorResponseValidator.safeParse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data.',
          details: {
            name: ['Name is required.'],
          },
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('GET /api/routines/[id]', () => {
    it('should match success response shape for routine detail', () => {
      const schema = successResponseValidator(routineWithAssignmentsSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'uuid-1',
          name: 'Strength Phase',
          description: null,
          createdAt: '2026-04-09T00:00:00.000Z',
          updatedAt: '2026-04-09T00:00:00.000Z',
          exerciseAssignments: [],
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should match error response shape for not found', () => {
      const result = errorResponseValidator.safeParse({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Routine not found.',
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('PATCH /api/routines/[id]', () => {
    it('should match success response shape for routine update', () => {
      const schema = successResponseValidator(routineWithAssignmentsSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'uuid-1',
          name: 'Updated Phase',
          description: 'Updated description',
          createdAt: '2026-04-09T00:00:00.000Z',
          updatedAt: '2026-04-09T00:00:00.000Z',
          exerciseAssignments: [],
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('DELETE /api/routines/[id]', () => {
    it('should match success response shape for routine deletion', () => {
      const schema = successResponseValidator(z.object({}));

      const mockResponse = {
        success: true,
        data: {},
        message: 'Routine deleted successfully.',
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });
});
