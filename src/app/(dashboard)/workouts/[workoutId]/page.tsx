'use client';

import { Button } from '@/components/ui/button';
import { useWorkout, useDeleteWorkout } from '@/hooks/api/useWorkouts';
import { useParams, useRouter } from 'next/navigation';

export default function WorkoutDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const workoutId = params?.workoutId as string;
  const { data, isLoading, error } = useWorkout(workoutId);
  const deleteMutation = useDeleteWorkout();

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-8 text-muted-foreground">Loading workout...</div>;
  if (error) return <div className="mx-auto max-w-7xl px-4 py-8 text-destructive">Failed to load workout.</div>;

  const workout = data?.data;
  if (!workout) return <div className="mx-auto max-w-7xl px-4 py-8">Workout not found.</div>;

  const entries = (workout as { logEntries?: Array<{ id: string; exerciseId: string; exercise: { name: string }; setsCompleted: number; repsPerSet: number[]; weight: number; notes: string | null }> }).logEntries ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{new Date(workout.workoutDate as unknown as string).toLocaleDateString()}</h1>
          <p className="mt-1 text-muted-foreground">{workout.dayOfWeek as string}</p>
        </div>
        <Button variant="destructive" onClick={async () => { if (confirm('Delete this workout?')) { await deleteMutation.mutateAsync(workoutId); router.push('/workouts'); } }}>Delete</Button>
      </div>

      {workout.notes && <div className="mb-6 rounded-lg bg-muted p-4 text-sm text-foreground">{workout.notes as string}</div>}

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">{entry.exercise?.name ?? 'Unknown'}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{entry.setsCompleted} sets × {entry.repsPerSet.join(', ')} reps @ {entry.weight} kg</p>
            {entry.notes && <p className="mt-1 text-xs text-muted-foreground">{entry.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
