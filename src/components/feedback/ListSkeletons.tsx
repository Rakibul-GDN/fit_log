import { Skeleton } from '@/components/feedback/Skeleton';
import { Card } from '@/components/ui/Card';

/** Skeleton for routine list cards */
export function RoutineListSkeleton(): React.ReactElement {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <div className='p-4 space-y-3'>
            <Skeleton variant='text' height='1.25rem' />
            <Skeleton variant='text' height='0.875rem' />
            <div className='flex gap-2 pt-2'>
              <Skeleton variant='rectangular' height='2rem' width='5rem' />
              <Skeleton variant='rectangular' height='2rem' width='5rem' />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton for workout history cards */
export function WorkoutListSkeleton(): React.ReactElement {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <div className='p-4 space-y-3'>
            <Skeleton variant='text' height='1.25rem' />
            <Skeleton variant='text' height='0.875rem' />
            <Skeleton variant='text' height='0.875rem' />
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton for exercise library grid */
export function ExerciseListSkeleton(): React.ReactElement {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i}>
          <div className='p-4 space-y-3'>
            <Skeleton variant='text' height='1.25rem' />
            <Skeleton variant='text' height='0.875rem' />
            <Skeleton variant='text' height='0.875rem' />
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton for progress chart area */
export function ProgressSkeleton(): React.ReactElement {
  return (
    <div className='space-y-6'>
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <div className='p-4 space-y-3'>
            <Skeleton variant='text' height='1.25rem' width='8rem' />
            <Skeleton variant='rectangular' height='16rem' />
          </div>
        </Card>
      ))}
    </div>
  );
}
