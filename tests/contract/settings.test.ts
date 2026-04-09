import { describe, it, expect } from 'vitest';
import {
  successResponseValidator,
  errorResponseValidator,
} from './helpers';
import { z } from 'zod';

describe('Settings API Contract Tests', () => {
  const settingsSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    preferredUnits: z.enum(['METRIC', 'IMPERIAL']),
    emailVerified: z.boolean(),
  });

  describe('GET /api/settings', () => {
    it('should match success response shape for settings retrieval', () => {
      const schema = successResponseValidator(settingsSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          preferredUnits: 'METRIC',
          emailVerified: true,
        },
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

  describe('PATCH /api/settings', () => {
    it('should match success response shape for settings update', () => {
      const schema = successResponseValidator(settingsSchema);

      const mockResponse = {
        success: true,
        data: {
          id: 'user-1',
          email: 'updated@example.com',
          name: 'Updated Name',
          preferredUnits: 'IMPERIAL',
          emailVerified: true,
        },
        message: 'Settings updated successfully.',
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should match error response shape for validation failure', () => {
      const schema = errorResponseValidator;

      const mockResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data.',
          details: { email: ['Invalid email address'] },
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });
});
