'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useWorkout, useDeleteWorkout, useUpdateWorkout } from '@/hooks/api/useWorkouts';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useToast } from '@/hooks/ui/useToast';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, X, Check, Plus, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

export default function WorkoutDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const workoutId = params?.workoutId as string;
  const { data, isLoading, error } = useWorkout(workoutId);
  const deleteMutation = useDeleteWorkout();
  const updateMutation = useUpdateWorkout();
  const toast = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEntryDeleteDialog, setShowEntryDeleteDialog] = useState<string | null>(null);
  const [isDeletingWorkout, setIsDeletingWorkout] = useState(false);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ repsPerSet: number[]; weightPerSet: number[] } | null>(null);

  type LogEntry = {
    id: string;
    exerciseId: string;
    exercise: { name: string };
    setsCompleted: number;
    repsPerSet: number[];
    weightPerSet: number[];
    notes: string | null;
  };

  const workout = data?.data;
  const initialEntries = (workout as { logEntries?: LogEntry[] })?.logEntries ?? [];
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries);

  if (isLoading) return <div className="mx-auto max-w-7xl px-4 py-8 text-muted-foreground">Loading workout...</div>;
  if (error) return <div className="mx-auto max-w-7xl px-4 py-8 text-destructive">Failed to load workout.</div>;
  if (!workout) return <div className="mx-auto max-w-7xl px-4 py-8">Workout not found.</div>;

  const handleDeleteWorkout = async (): Promise<void> => {
    setIsDeletingWorkout(true);
    try {
      await deleteMutation.mutateAsync(workoutId);
      toast.success('Workout deleted successfully.');
      router.push('/workouts');
    } catch {
      toast.error('Failed to delete workout.');
    } finally {
      setIsDeletingWorkout(false);
    }
  };

  const handleDeleteEntry = async (entryId: string): Promise<void> => {
    setIsDeletingEntry(true);
    const updated = entries.filter((e) => e.id !== entryId);
    if (updated.length === 0) {
      await handleDeleteWorkout();
      return;
    }
    setEntries(updated);
    setShowEntryDeleteDialog(null);
    try {
      await updateMutation.mutateAsync({
        workoutId,
        input: {
          entries: updated.map((e) => ({
            exerciseId: e.exerciseId,
            setsCompleted: e.setsCompleted,
            repsPerSet: e.repsPerSet,
            weightPerSet: e.weightPerSet,
            notes: e.notes ?? undefined,
          })),
        },
      });
      toast.success('Exercise removed from workout.');
    } catch {
      toast.error('Failed to remove exercise.');
      setEntries(initialEntries);
    } finally {
      setIsDeletingEntry(false);
    }
  };

  const startEditing = (entry: LogEntry): void => {
    setEditingId(entry.id);
    setEditData({ repsPerSet: [...entry.repsPerSet], weightPerSet: [...entry.weightPerSet] });
  };

  const cancelEditing = (): void => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEditing = async (): Promise<void> => {
    if (!editingId || !editData) return;
    const updated = entries.map((e) =>
      e.id === editingId
        ? { ...e, repsPerSet: editData.repsPerSet, weightPerSet: editData.weightPerSet, setsCompleted: editData.repsPerSet.length }
        : e
    );
    setEntries(updated);
    setEditingId(null);
    setEditData(null);
    try {
      await updateMutation.mutateAsync({
        workoutId,
        input: {
          entries: updated.map((e) => ({
            exerciseId: e.exerciseId,
            setsCompleted: e.setsCompleted,
            repsPerSet: e.repsPerSet,
            weightPerSet: e.weightPerSet,
            notes: e.notes ?? undefined,
          })),
        },
      });
    } catch {
      setEntries(initialEntries);
    }
  };

  const addSet = (entryId: string): void => {
    const updated = entries.map((e) => {
      if (e.id !== entryId) return e;
      const lastReps = e.repsPerSet[e.repsPerSet.length - 1] ?? 10;
      const lastWeight = e.weightPerSet[e.weightPerSet.length - 1] ?? 0;
      return {
        ...e,
        setsCompleted: e.setsCompleted + 1,
        repsPerSet: [...e.repsPerSet, lastReps],
        weightPerSet: [...e.weightPerSet, lastWeight],
      };
    });
    setEntries(updated);
  };

  const removeSet = (entryId: string, setIndex: number): void => {
    const updated = entries.map((e) => {
      if (e.id !== entryId || e.setsCompleted <= 1) return e;
      return {
        ...e,
        setsCompleted: e.setsCompleted - 1,
        repsPerSet: e.repsPerSet.filter((_, i) => i !== setIndex),
        weightPerSet: e.weightPerSet.filter((_, i) => i !== setIndex),
      };
    });
    setEntries(updated);
  };

  const moveEntry = (fromIndex: number, toIndex: number): void => {
    if (toIndex < 0 || toIndex >= entries.length) return;
    const updated = [...entries];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((e, i) => ({ ...e, order: i }));
    setEntries(reordered);
    void saveOrder(reordered);
  };

  const saveOrder = async (orderedEntries: LogEntry[]): Promise<void> => {
    try {
      await updateMutation.mutateAsync({
        workoutId,
        input: {
          entries: orderedEntries.map((e) => ({
            exerciseId: e.exerciseId,
            setsCompleted: e.setsCompleted,
            repsPerSet: e.repsPerSet,
            weightPerSet: e.weightPerSet,
            notes: e.notes ?? undefined,
          })),
        },
      });
    } catch {
      setEntries(initialEntries);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{new Date(workout.workoutDate as unknown as string).toLocaleDateString()}</h1>
          <p className="mt-1 text-muted-foreground">{workout.dayOfWeek as string}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
            Delete Workout
          </Button>
        </div>
      </div>

      {workout.notes && <div className="mb-6 rounded-lg bg-muted p-4 text-sm text-foreground">{workout.notes}</div>}

      <div className="space-y-4">
        {entries.map((entry, idx) => {
          const isEditing = editingId === entry.id;
          return (
            <div key={entry.id} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    #{idx + 1}
                  </Badge>
                  <h3 className="font-semibold">{entry.exercise?.name ?? 'Unknown'}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {idx > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveEntry(idx, idx - 1)}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                  )}
                  {idx < entries.length - 1 && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveEntry(idx, idx + 1)}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  )}
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => startEditing(entry)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowEntryDeleteDialog(entry.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {isEditing && editData ? (
                <div className="space-y-2">
                  {editData.repsPerSet.map((reps, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-14 justify-center">
                        Set {setIdx + 1}
                      </Badge>
                      <div className="flex-1">
                        <Label className="text-xs">Reps</Label>
                        <Input
                          type="number"
                          className="h-8"
                          value={reps}
                          onChange={(e) => {
                            const newReps = [...editData.repsPerSet];
                            newReps[setIdx] = parseInt(e.target.value, 10) || 0;
                            setEditData({ ...editData, repsPerSet: newReps });
                          }}
                          min={0}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Weight (kg)</Label>
                        <Input
                          type="number"
                          className="h-8"
                          value={editData.weightPerSet[setIdx] ?? 0}
                          onChange={(e) => {
                            const newWeights = [...editData.weightPerSet];
                            newWeights[setIdx] = parseFloat(e.target.value) || 0;
                            setEditData({ ...editData, weightPerSet: newWeights });
                          }}
                          min={0}
                          step={0.5}
                        />
                      </div>
                      {editData.repsPerSet.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-5 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            const newReps = editData.repsPerSet.filter((_, i) => i !== setIdx);
                            const newWeights = editData.weightPerSet.filter((_, i) => i !== setIdx);
                            setEditData({ repsPerSet: newReps, weightPerSet: newWeights });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => addSet(entry.id)}>
                    <Plus className="mr-1 h-3 w-3" /> Add Set
                  </Button>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={saveEditing}>
                      <Check className="mr-1 h-3 w-3" /> Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {entry.repsPerSet.map((reps, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-14 justify-center">
                        Set {setIdx + 1}
                      </Badge>
                      <span className="text-sm">{reps} reps</span>
                      <span className="text-sm text-muted-foreground">@</span>
                      <span className="text-sm">{entry.weightPerSet[setIdx] ?? 0} kg</span>
                      {entry.repsPerSet.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSet(entry.id, setIdx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteWorkout}
        title="Delete Workout"
        description="Are you sure you want to delete this entire workout? All exercises and sets will be lost."
        confirmLabel="Delete"
        loading={isDeletingWorkout}
      />
      <ConfirmDialog
        open={!!showEntryDeleteDialog}
        onOpenChange={(open) => { if (!open) setShowEntryDeleteDialog(null); }}
        onConfirm={() => { if (showEntryDeleteDialog) void handleDeleteEntry(showEntryDeleteDialog); }}
        title="Remove Exercise"
        description="Remove this exercise from the workout log?"
        confirmLabel="Remove"
        loading={isDeletingEntry}
      />
    </div>
  );
}
