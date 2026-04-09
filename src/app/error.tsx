'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

/**
 * Global error boundary component.
 * Displays user-friendly error message with retry option.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): ReactNode {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 px-4'>
      <h2 className='text-2xl font-bold text-red-600'>Something went wrong</h2>
      <p className='text-gray-600'>
        An unexpected error occurred. Please try again.
      </p>
      <button
        className='rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        onClick={(): void => {
          reset();
        }}
        type='button'
      >
        Try again
      </button>
    </div>
  );
}
