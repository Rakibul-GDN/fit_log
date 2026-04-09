import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** Workout history card props */
export interface WorkoutHistoryCardProps {
  id: string;
  dayOfWeek: string;
  workoutDate: string;
  exerciseCount: number;
  routineName?: string | null;
}

/**
 * WorkoutHistoryCard — displays session summary with link to detail.
 */
export function WorkoutHistoryCard({
  id,
  dayOfWeek,
  workoutDate,
  exerciseCount,
  routineName,
}: WorkoutHistoryCardProps): ReactNode {
  const date = new Date(workoutDate);
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Link href={`/workouts/${id}`}>
      <Card className='cursor-pointer transition hover:shadow-md'>
        <div className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{formatted}</h4>
              <p className='text-sm text-default-500'>
                {dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}
                {routineName && ` • ${routineName}`}
              </p>
            </div>
            <span className='rounded-full bg-default-100 px-3 py-1 text-xs text-default-600'>
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
