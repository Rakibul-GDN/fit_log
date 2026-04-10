'use client';

import { Button } from '@/components/ui/Button';
import { RoutineWeekView } from '@/components/layout/RoutineWeekView';
import { useRoutine, useDeleteRoutine } from '@/hooks/api/useRoutines';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RoutineDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const routineId = params?.routineId as string;
  const { data, isLoading, error } = useRoutine(routineId);
  const deleteMutation = useDeleteRoutine();

  const handleDelete = async (): Promise<void> => {
    if (confirm('Delete this routine?')) { await deleteMutation.mutateAsync(routineId); router.push('/routines'); }
  };

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-8 text-muted-foreground">Loading routine...</div>;
  if (error) return <div className="mx-auto max-w-7xl px-4 py-8 text-destructive">Failed to load routine.</div>;

  const routine = data?.data;
  if (!routine) return <div className="mx-auto max-w-7xl px-4 py-8">Routine not found.</div>;

  const assignments = (routine as { exerciseAssignments?: Array<{ id: string; exerciseId: string; exercise: { name: string }; dayOfWeek: string; defaultSets: number; defaultReps: number; defaultWeight: number; order: number }> }).exerciseAssignments ?? [];
  const mappedAssignments = assignments.map((a) => ({ id: a.id, exerciseId: a.exerciseId, exerciseName: a.exercise.name, dayOfWeek: a.dayOfWeek, defaultSets: a.defaultSets, defaultReps: a.defaultReps, defaultWeight: a.defaultWeight, order: a.order }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{routine.name}</h1>
          {routine.description && <p className="mt-1 text-muted-foreground">{routine.description}</p>}
        </div>
        <div className="flex gap-2">
          <Link className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" href={`/routines/${routineId}/quick-log`}>
            Quick Log
          </Link>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground">No exercises assigned to this routine.</p>
      ) : (
        <RoutineWeekView assignments={mappedAssignments} />
      )}
    </div>
  );
}
