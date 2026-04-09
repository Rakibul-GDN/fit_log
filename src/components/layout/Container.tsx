import type { ReactNode } from 'react';

/**
 * Container props.
 */
export interface ContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'wide';
}

const variantClasses: Record<NonNullable<ContainerProps['variant']>, string> = {
  default: 'max-w-7xl',
  narrow: 'max-w-4xl',
  wide: 'max-w-screen-2xl',
};

/**
 * Page container wrapper with consistent max-width and padding.
 */
export function Container({
  children,
  className = '',
  variant = 'default',
}: ContainerProps) {
  const classes = `${variantClasses[variant]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`.trim();

  return <div className={classes}>{children}</div>;
}
