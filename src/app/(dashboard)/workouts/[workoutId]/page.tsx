'use client';

import { Button } from '@/components/ui/Button';
import { useWorkout, useDeleteWorkout } from '@/hooks/api/useWorkouts';
import { useParams, useRouter } from 'next/navigation';

/** Workout detail page — full session view. */
export default function WorkoutDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const workoutId = params?.workoutId as string;

  const { data, isLoading, error } = useWorkout(workoutId);
  const deleteMutation = useDeleteWorkout();

  const handleDelete = async (): Promise<void> => {
    if (confirm('Are you sure you want to delete this workout?')) {
      await deleteMutation.mutateAsync(workoutId);
      router.push('/workouts');
    }
  };

  if (isLoading) return <div className='mx-auto max-w-7xl px-4 py-8'>Loading...</div>;
  if (error) return <div className='mx-auto max-w-7xl px-4 py-8 text-danger-600'>Failed to load workout.</div>;

  const workout = data?.data;
  if (!workout) return <div className='mx-auto max-w-7xl px-4 py-8'>Workout not found.</div>;

  const date = new Date(workout.workoutDate as unknown as string);
  const formatted = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const dayLabel = (workout.dayOfWeek as string ?? '').charAt(0) + (workout.dayOfWeek as string ?? '').slice(1).toLowerCase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workoutAny = workout as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const entries: { id: string; exercise?: { name: string }; setsCompleted: number; repsPerSet: number[]; weight: number; notes: string | null }[] = workoutAny.logEntries ?? [];

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{formatted}</h1>
          <p className='mt-1 text-default-500'>
            {dayLabel}
            {' • '}{entries.length} exercise{entries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button color='danger' onPress={() => void handleDelete()}>
          Delete
        </Button>
      </div>

      {workout.notes && (
        <div className='mb-6 rounded-lg bg-default-100 p-4 text-sm text-default-700'>
          {workout.notes}
        </div>
      )}

      <div className='space-y-4'>
        {entries.map((entry) => (
          <div className='rounded-lg border border-default-200 bg-card p-4' key={entry.id}>
            <h4 className='font-semibold'>{entry.exercise?.name ?? 'Unknown'}</h4>
            <p className='mt-1 text-sm text-default-500'>
              {entry.setsCompleted} sets × {entry.repsPerSet.join(', ')} reps @ {entry.weight}kg
            </p>
            {entry.notes && <p className='mt-1 text-xs text-default-400'>{entry.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
