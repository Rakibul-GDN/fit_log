'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Routine card props */
export interface RoutineCardProps {
  id: string;
  name: string;
  description: string | null;
  exerciseCount: number;
  onDelete?: () => void;
}

/**
 * RoutineCard — summary display for a routine with edit/delete actions.
 */
export function RoutineCard({
  id,
  name,
  description,
  exerciseCount,
  onDelete,
}: RoutineCardProps): ReactNode {
  return (
    <Card>
      <div className='flex items-start justify-between p-4'>
        <div className='min-w-0 flex-1'>
          <h3 className='text-lg font-semibold truncate'>{name}</h3>
          {description && (
            <p className='mt-1 text-sm text-default-500 truncate'>{description}</p>
          )}
          <p className='mt-2 text-xs text-default-400'>
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} assigned
          </p>
        </div>
        <div className='flex gap-2 ml-4'>
          <Button as={Link} href={`/routines/${id}`} size='sm'>
            View
          </Button>
          {onDelete && (
            <Button color='danger' size='sm' onPress={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
