import { describe, it, expect } from 'vitest';
import {
  successResponseValidator,
  errorResponseValidator,
} from './helpers';
import { z } from 'zod';

describe('Auth API Contract Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should match success response shape', () => {
      const schema = successResponseValidator(
        z.object({
          userId: z.string(),
          email: z.email(),
          message: z.string(),
        }),
      );

      const mockResponse = {
        success: true,
        data: {
          userId: 'test-uuid',
          email: 'test@example.com',
          message: 'Registration successful. Please check your email for verification.',
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should match error response shape for duplicate email', () => {
      const result = errorResponseValidator.safeParse({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email already exists.',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should match error response shape for validation errors', () => {
      const result = errorResponseValidator.safeParse({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data.',
          details: {
            email: ['Invalid email format.'],
            password: ['Password must be at least 8 characters.'],
          },
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should match success response shape', () => {
      const schema = successResponseValidator(
        z.object({
          message: z.string(),
        }),
      );

      const mockResponse = {
        success: true,
        data: {
          message: 'Email verified successfully. You can now log in.',
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should match error response shape for invalid token', () => {
      const result = errorResponseValidator.safeParse({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired verification token.',
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should match success response shape', () => {
      const schema = successResponseValidator(
        z.object({
          message: z.string(),
        }),
      );

      const mockResponse = {
        success: true,
        data: {
          message: 'If an account exists with that email, we have sent a password reset link.',
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should match success response shape', () => {
      const schema = successResponseValidator(
        z.object({
          message: z.string(),
        }),
      );

      const mockResponse = {
        success: true,
        data: {
          message: 'Password reset successfully. You can now log in.',
        },
      };

      const result = schema.safeParse(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should match error response shape for invalid token', () => {
      const result = errorResponseValidator.safeParse({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired password reset token.',
        },
      });

      expect(result.success).toBe(true);
    });
  });
});
