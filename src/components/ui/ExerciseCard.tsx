import { Card } from '@/components/ui/Card';
import type { ReactNode } from 'react';

/** Exercise card props */
export interface ExerciseCardProps {
  name: string;
  category: string;
  primaryMuscles: string[];
  isSystemExercise: boolean;
  description?: string | null;
}

/**
 * ExerciseCard — displays exercise info with category badge and muscle tags.
 */
export function ExerciseCard({
  name,
  category,
  primaryMuscles,
  isSystemExercise,
  description,
}: ExerciseCardProps): ReactNode {
  return (
    <Card>
      <div className='p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h4 className='truncate text-sm font-semibold'>{name}</h4>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  isSystemExercise
                    ? 'bg-primary/10 text-primary'
                    : 'bg-default-100 text-default-600'
                }`}
              >
                {isSystemExercise ? 'Library' : 'Custom'}
              </span>
            </div>
            {description && (
              <p className='mt-1 truncate text-xs text-default-500'>{description}</p>
            )}
          </div>
          <span className='shrink-0 rounded bg-default-100 px-2 py-1 text-xs text-default-600'>
            {category.replace(/_/g, ' ')}
          </span>
        </div>
        {primaryMuscles.length > 0 && (
          <div className='mt-2 flex flex-wrap gap-1'>
            {primaryMuscles.map((muscle) => (
              <span
                className='rounded bg-default-50 px-2 py-0.5 text-xs text-default-500'
                key={muscle}
              >
                {muscle}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
