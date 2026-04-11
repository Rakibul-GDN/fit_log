'use client';

import { Button } from '@/components/ui/Button';
import { RoutineWeekView } from '@/components/layout/RoutineWeekView';
import { useRoutine, useDeleteRoutine } from '@/hooks/api/useRoutines';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { usePageTitle } from '@/components/layout/PageTitleContext';
import { useToast } from '@/hooks/ui/useToast';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RoutineDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const routineId = params?.routineId as string;
  const { data, isLoading, error } = useRoutine(routineId);
  const deleteMutation = useDeleteRoutine();
  const { setTitle } = usePageTitle();
  const toast = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (data?.data?.name) setTitle(data.data.name);
  }, [data?.data?.name, setTitle]);

  const handleDelete = async (): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(routineId);
      toast.success('Routine deleted successfully.');
      router.push('/routines');
    } catch {
      toast.error('Failed to delete routine.');
    }
  };

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-8 text-muted-foreground">Loading routine...</div>;
  if (error) return <div className="mx-auto max-w-7xl px-4 py-8 text-destructive">Failed to load routine.</div>;

  const routine = data?.data;
  if (!routine) return <div className="mx-auto max-w-7xl px-4 py-8">Routine not found.</div>;

  const assignments = (routine as { exerciseAssignments?: Array<{ id: string; exerciseId: string; exercise: { name: string }; dayOfWeek: string; defaultSets: number; defaultReps: number; defaultWeight: number; order: number }> }).exerciseAssignments ?? [];
  const mappedAssignments = assignments.map((a) => ({ id: a.id, exerciseId: a.exerciseId, exerciseName: a.exercise.name, dayOfWeek: a.dayOfWeek, defaultSets: a.defaultSets, defaultReps: a.defaultReps, defaultWeight: a.defaultWeight, order: a.order }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {routine.description && <p className="mb-4 text-muted-foreground">{routine.description}</p>}
      <div className="mb-6 flex items-center justify-end gap-2">
        <Link className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" href={`/routines/${routineId}/quick-log`}>
          Quick Log
        </Link>
        <Link className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80" href={`/routines/${routineId}/edit`}>
          Edit
        </Link>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>Delete</Button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground">No exercises assigned to this routine.</p>
      ) : (
        <RoutineWeekView assignments={mappedAssignments} />
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Routine"
        description="Are you sure you want to delete this routine? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
