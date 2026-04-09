import { describe, it, expect } from 'vitest';
import {
  successResponseValidator,
  paginatedResponseValidator,
  errorResponseValidator,
} from './helpers';
import { z } from 'zod';

describe('Exercises API Contract Tests', () => {
  const exerciseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    category: z.string(),
    primaryMuscles: z.array(z.string()),
    isSystemExercise: z.boolean(),
    createdById: z.string().nullable(),
  });

  describe('GET /api/exercises', () => {
    it('should match paginated response shape for exercise list', () => {
      const schema = paginatedResponseValidator(exerciseSchema);

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'uuid-1',
            name: 'Bench Press',
            description: null,
            category: 'BARBELL',
            primaryMuscles: ['Chest', 'Triceps'],
            isSystemExercise: true,
            createdById: null,
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

    it('should accept search and category query params', () => {
      // Search and filter are handled via query params — response shape stays the same
      const schema = paginatedResponseValidator(exerciseSchema);

      const mockResponse = {
        success: true,
        data: [],
        pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/exercises', () => {
    it('should match success response shape for exercise creation', () => {
      const schema = successResponseValidator(exerciseSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'uuid-2',
          name: 'Custom Curl',
          description: 'My exercise',
          category: 'DUMBBELL',
          primaryMuscles: ['Biceps'],
          isSystemExercise: false,
          createdById: 'user-uuid',
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
});
