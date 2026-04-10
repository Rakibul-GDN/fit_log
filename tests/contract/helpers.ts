import { z } from 'zod';

/** Assert response matches expected Zod schema shape */
export function assertResponseShape<T>(
  schema: z.ZodType<T>,
  data: unknown,
): asserts data is T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Response shape mismatch: ${result.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`,
    );
  }
}

/** Success response validator factory */
export function successResponseValidator<T>(dataSchema: z.ZodType<T>) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });
}

/** Paginated response validator factory */
export function paginatedResponseValidator<T>(itemSchema: z.ZodType<T>) {
  return z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });
}

/** Error response validator */
export const errorResponseValidator = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
