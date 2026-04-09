/** Standard API response envelope for single resource or action */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/** Paginated list response with metadata */
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/** Error response for failed requests */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/** Union type for all API responses */
export type ApiResponse<T = unknown> =
  | SuccessResponse<T>
  | PaginatedResponse<T>
  | ErrorResponse;
