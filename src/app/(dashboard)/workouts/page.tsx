'use client';

import { Button } from '@/components/ui/Button';
import { WorkoutHistoryCard } from '@/components/layout/WorkoutHistoryCard';
import { WorkoutListSkeleton } from '@/components/feedback/ListSkeletons';
import { useWorkouts } from '@/hooks/api/useWorkouts';
import Link from 'next/link';
import { useState } from 'react';

/** Workout history page — list, filter by date, pagination. */
export default function WorkoutsPage(): React.ReactElement {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useWorkouts(page, 20);

  return (
    <div className='mx-auto max-w-7xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Workout History</h1>
          <p className='mt-1 text-default-500'>View your past workout sessions</p>
        </div>
        <div className='flex gap-2'>
          <Link
            className='rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90'
            href='/workouts/log'
          >
            Log Workout
          </Link>
        </div>
      </div>

      {isLoading && <WorkoutListSkeleton />}

      {error && <p className='text-danger-600'>Failed to load workouts.</p>}

      {data?.data && data.data.length === 0 && (
        <div className='rounded-lg border border-dashed border-default-300 p-8 text-center'>
          <p className='text-lg text-default-500'>No workouts logged yet</p>
          <Link
            className='mt-4 inline-block rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90'
            href='/workouts/log'
          >
            Log your first workout
          </Link>
        </div>
      )}

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {data?.data?.map((workout) => (
          <WorkoutHistoryCard
            key={workout.id}
            dayOfWeek={workout.dayOfWeek as string}
            exerciseCount={(workout as { logEntries?: unknown[] }).logEntries?.length ?? 0}
            id={workout.id}
            routineName={null}
            workoutDate={workout.workoutDate as unknown as string}
          />
        ))}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className='mt-6 flex justify-center gap-2'>
          {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} size='sm' onPress={() => setPage(p)}>
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
