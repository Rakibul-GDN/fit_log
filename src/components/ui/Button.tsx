'use client';

import { Button as HeroButton } from '@heroui/react';

/**
 * Button component — wrapper around HeroUI Button.
 * Supports isLoading prop for loading state display.
 */
export function Button({
  isLoading,
  children,
  ...props
}: { isLoading?: boolean; children: React.ReactNode } & Record<string, unknown>) {
  if (isLoading) {
    return (
      <HeroButton {...(props as object)} isDisabled>
        <span className='inline-flex items-center gap-2'>
          <svg
            className='h-4 w-4 animate-spin'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
              fill='currentColor'
            />
          </svg>
          Loading...
        </span>
      </HeroButton>
    );
  }
  return (
    <HeroButton {...(props as object)}>
      {children}
    </HeroButton>
  );
}
