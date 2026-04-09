'use client';

import { WorkoutLogForm } from '@/components/forms/WorkoutLogForm';
import { useCreateWorkout } from '@/hooks/api/useWorkouts';
import { useRouter } from 'next/navigation';
import type { WorkoutEntry } from '@/components/forms/WorkoutLogForm';

/** Manual workout logging page. */
export default function LogWorkoutPage(): React.ReactElement {
  const router = useRouter();
  const createMutation = useCreateWorkout();

  const handleSubmit = async (data: { dayOfWeek: string; workoutDate: string; notes: string; entries: WorkoutEntry[] }): Promise<void> => {
    await createMutation.mutateAsync({
      dayOfWeek: data.dayOfWeek,
      workoutDate: data.workoutDate,
      notes: data.notes || undefined,
      entries: data.entries,
    });
    router.push('/workouts');
  };

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <h1 className='mb-6 text-3xl font-bold'>Log Workout</h1>
      <WorkoutLogForm
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
