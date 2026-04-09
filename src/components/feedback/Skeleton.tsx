import { cn } from '@heroui/react';

/**
 * Skeleton props.
 */
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

const variantClasses: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
};

/**
 * Loading skeleton component for content placeholders.
 */
export function Skeleton({
  className = '',
  variant = 'text',
  width = '100%',
  height = '1rem',
}: SkeletonProps) {
  const classes = cn(
    'animate-pulse bg-default-200',
    variantClasses[variant],
    className,
  );

  return (
    <div
      className={classes}
      style={{ width, height }}
      aria-busy="true"
      role="status"
    />
  );
}
