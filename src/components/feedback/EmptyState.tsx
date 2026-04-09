import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import type { ReactNode } from 'react';

/**
 * Empty state props.
 */
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  /** Use href for Next.js Link navigation */
  href?: string;
  /** Use onPress for client-side callbacks */
  onPress?: () => void;
}

/**
 * Empty state component for displaying placeholder content when no data exists.
 * Supports both Next.js Link navigation and client-side callbacks.
 */
export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  href,
  onPress,
}: EmptyStateProps): React.ReactElement {
  const actionButton =
    actionLabel && (href || onPress) ? (
      href ? (
        <Button as={Link} className='mt-4' href={href}>
          {actionLabel}
        </Button>
      ) : (
        <Button className='mt-4' onPress={onPress}>
          {actionLabel}
        </Button>
      )
    ) : null;

  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
      {icon && <div className='mb-4 text-4xl text-default-400'>{icon}</div>}
      <h3 className='text-lg font-semibold text-foreground'>{title}</h3>
      {description && (
        <p className='mt-1 max-w-sm text-sm text-default-500'>{description}</p>
      )}
      {actionButton}
    </div>
  );
}
