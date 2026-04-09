'use client';

import type { CardProps } from '@heroui/react';
import { Card as HeroCard } from '@heroui/react';
import type { ReactNode } from 'react';

/**
 * Card component — wrapper around HeroUI Card.
 */
export function Card({
  children,
  ...props
}: CardProps): ReactNode {
  return <HeroCard {...props}>{children}</HeroCard>;
}
