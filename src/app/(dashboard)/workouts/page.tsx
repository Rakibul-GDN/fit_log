'use client';

import { Button } from '@/components/ui/button';
import { useWorkouts, useDeleteWorkout } from '@/hooks/api/useWorkouts';
import { WorkoutListSkeleton } from '@/components/feedback/ListSkeletons';
import { WorkoutHistoryCard } from '@/components/layout/WorkoutHistoryCard';
import { WorkoutCalendar } from '@/components/layout/WorkoutCalendar';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/hooks/ui/useToast';
import Link from 'next/link';
import { useState, useCallback } from 'react';

export default function WorkoutsPage(): React.ReactElement {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useWorkouts(page, 20);
  const deleteMutation = useDeleteWorkout();
  const toast = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = useCallback(async (): Promise<void> => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
      toast.success('Workout deleted successfully.');
      void refetch();
    } catch {
      toast.error('Failed to delete workout.');
    }
  }, [deleteId, deleteMutation, refetch, toast]);

  return (
    <div className="mx-auto max-w-full px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workout Calendar</h1>
          <p className="mt-1 text-muted-foreground">View your workouts on a calendar</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" href="/workouts/log">
            Log Workout
          </Link>
        </div>
      </div>

      {isLoading && <WorkoutListSkeleton />}
      {error && <p className="text-destructive">Failed to load workouts.</p>}

      {data?.data && data.data.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-lg text-muted-foreground">No workouts logged yet</p>
          <Link className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90" href="/workouts/log">
            Log your first workout
          </Link>
        </div>
      )}

      {data?.data && data.data.length > 0 && (
        <WorkoutCalendar
          workouts={data.data.map((workout) => ({
            id: workout.id,
            workoutDate: workout.workoutDate as unknown as string,
            dayOfWeek: workout.dayOfWeek as string,
            exerciseCount: (workout as { logEntries?: unknown[] }).logEntries?.length ?? 0,
          }))}
          onSelectWorkout={(id) => {
            window.location.href = `/workouts/${id}`;
          }}
          onViewAll={(date, ids) => {
            // For now, just go to the first log. You can enhance this to show a modal with all logs for the day.
            if (ids.length > 0) window.location.href = `/workouts/${ids[0]}`;
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        title="Delete Workout"
        description="Are you sure you want to delete this workout? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
