import type { PaginatedResponse, SuccessResponse, ErrorResponse } from '@/types/api';

/** Parse paginated API response into typed data + metadata */
export function parsePaginatedResponse<T>(
  response: PaginatedResponse<T>,
): {
  items: T[];
  pagination: PaginatedResponse<T>['pagination'];
} {
  return {
    items: response.data,
    pagination: response.pagination,
  };
}

/** Parse non-paginated API response into typed data */
export function parseResponse<T>(response: SuccessResponse<T>): T {
  return response.data;
}

/** Check if response is an error envelope */
export function isErrorResponse(
  response: unknown,
): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as Record<string, unknown>).success === false
  );
}

/** Extract error message from any API response */
export function extractErrorMessage(response: unknown): string {
  if (isErrorResponse(response)) {
    return response.error.message;
  }
  if (response instanceof Error) {
    return response.message;
  }
  return 'An unexpected error occurred';
}
