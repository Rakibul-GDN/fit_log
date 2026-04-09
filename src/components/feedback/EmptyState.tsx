import { Button } from '@heroui/react';
import type { ReactNode } from 'react';

/**
 * Empty state props.
 */
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty state component for displaying placeholder content when no data exists.
 */
export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-default-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-default-500 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button className='mt-4' onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
