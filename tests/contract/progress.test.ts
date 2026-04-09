import { describe, it, expect } from 'vitest';
import {
  successResponseValidator,
  paginatedResponseValidator,
  errorResponseValidator,
} from './helpers';
import { z } from 'zod';

describe('Progress API Contract Tests', () => {
  const progressDataPointSchema = z.object({
    id: z.string(),
    exerciseId: z.string(),
    exerciseName: z.string(),
    workoutDate: z.string(),
    weight: z.number(),
    volume: z.number(),
    setsCompleted: z.number(),
    repsPerSet: z.array(z.number()),
  });

  const bodyMeasurementSchema = z.object({
    id: z.string(),
    userId: z.string(),
    measurementType: z.string(),
    value: z.number(),
    unit: z.string(),
    measurementDate: z.string(),
    notes: z.string().nullable(),
  });

  const progressSummarySchema = z.object({
    exerciseId: z.string(),
    exerciseName: z.string(),
    dataPoints: z.array(progressDataPointSchema),
    trend: z.enum(['increasing', 'decreasing', 'stable']),
    startWeight: z.number(),
    currentWeight: z.number(),
    changePercent: z.number(),
  });

  describe('GET /api/progress', () => {
    it('should match success response shape for progress data', () => {
      const schema = successResponseValidator(z.array(progressSummarySchema));

      const mockResponse = {
        success: true,
        data: [
          {
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            dataPoints: [
              {
                id: 'entry-1',
                exerciseId: 'ex-1',
                exerciseName: 'Bench Press',
                workoutDate: '2026-04-01T00:00:00.000Z',
                weight: 60,
                volume: 1800,
                setsCompleted: 3,
                repsPerSet: [10, 10, 10],
              },
            ],
            trend: 'increasing',
            startWeight: 60,
            currentWeight: 70,
            changePercent: 16.67,
          },
        ],
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should match error response shape for unauthenticated request', () => {
      const schema = errorResponseValidator;

      const mockResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('GET /api/progress/measurements', () => {
    it('should match paginated response shape for body measurements', () => {
      const schema = paginatedResponseValidator(bodyMeasurementSchema);

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'measurement-1',
            userId: 'user-1',
            measurementType: 'BODY_WEIGHT',
            value: 75.5,
            unit: 'KG',
            measurementDate: '2026-04-09T00:00:00.000Z',
            notes: null,
          },
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/progress/measurements', () => {
    it('should match success response shape for measurement creation', () => {
      const schema = successResponseValidator(bodyMeasurementSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'measurement-2',
          userId: 'user-1',
          measurementType: 'WAIST',
          value: 82,
          unit: 'CM',
          measurementDate: '2026-04-09T00:00:00.000Z',
          notes: 'Morning measurement',
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });
});
