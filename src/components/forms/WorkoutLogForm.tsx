'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useExercises } from '@/hooks/api/useExercises';
import { useState, type ReactNode } from 'react';
import { Plus, X, Target } from 'lucide-react';

export interface WorkoutEntry {
  exerciseId: string;
  exerciseName?: string;
  setsCompleted: number;
  repsPerSet: number[];
  weightPerSet: number[];
  notes: string;
  /** Target values from routine (optional, shown as reference) */
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
}

export interface WorkoutLogFormProps {
  defaultEntries?: WorkoutEntry[];
  defaultDayOfWeek?: string;
  defaultDate?: string;
  defaultNotes?: string;
  onSubmit: (data: { dayOfWeek: string; workoutDate: string; notes: string; entries: WorkoutEntry[] }) => void | Promise<void>;
  isSubmitting?: boolean;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

export function WorkoutLogForm({ defaultEntries = [], defaultDayOfWeek = 'MONDAY', defaultDate = new Date().toISOString().split('T')[0], defaultNotes = '', onSubmit, isSubmitting }: WorkoutLogFormProps): ReactNode {
  const { data: exercisesData } = useExercises(1, 200);
  const exercises = exercisesData?.data ?? [];
  const [dayOfWeek, setDayOfWeek] = useState(defaultDayOfWeek);
  const [workoutDate, setWorkoutDate] = useState(defaultDate);
  const [notes, setNotes] = useState(defaultNotes);
  const [entries, setEntries] = useState<WorkoutEntry[]>(
    defaultEntries.length > 0
      ? defaultEntries
      : [{ exerciseId: '', setsCompleted: 3, repsPerSet: [10, 10, 10], weightPerSet: [0, 0, 0], notes: '' }]
  );

  const updateEntry = (index: number, field: keyof WorkoutEntry, value: unknown): void => {
    setEntries((p) => { const u = [...p]; u[index] = { ...u[index], [field]: value }; return u; });
  };

  const addExercise = (): void => {
    setEntries((p) => [...p, { exerciseId: '', setsCompleted: 1, repsPerSet: [10], weightPerSet: [0], notes: '' }]);
  };

  const removeExercise = (index: number): void => setEntries((p) => p.filter((_, i) => i !== index));

  /** Add a new set to an entry */
  const addSet = (index: number): void => {
    setEntries((p) => {
      const u = [...p];
      const entry = u[index];
      u[index] = {
        ...entry,
        setsCompleted: entry.setsCompleted + 1,
        repsPerSet: [...entry.repsPerSet, entry.repsPerSet[entry.repsPerSet.length - 1] ?? 10],
        weightPerSet: [...entry.weightPerSet, entry.weightPerSet[entry.weightPerSet.length - 1] ?? 0],
      };
      return u;
    });
  };

  /** Remove a set from an entry */
  const removeSet = (entryIndex: number, setIndex: number): void => {
    setEntries((p) => {
      const u = [...p];
      const entry = u[entryIndex];
      if (entry.setsCompleted <= 1) return p; // Must have at least 1 set
      u[entryIndex] = {
        ...entry,
        setsCompleted: entry.setsCompleted - 1,
        repsPerSet: entry.repsPerSet.filter((_, i) => i !== setIndex),
        weightPerSet: entry.weightPerSet.filter((_, i) => i !== setIndex),
      };
      return u;
    });
  };

  /** Update reps for a specific set */
  const updateSetReps = (entryIndex: number, setIndex: number, reps: number): void => {
    setEntries((p) => {
      const u = [...p];
      const entry = u[entryIndex];
      const newReps = [...entry.repsPerSet];
      newReps[setIndex] = reps;
      u[entryIndex] = { ...entry, repsPerSet: newReps };
      return u;
    });
  };

  /** Update weight for a specific set */
  const updateSetWeight = (entryIndex: number, setIndex: number, weight: number): void => {
    setEntries((p) => {
      const u = [...p];
      const entry = u[entryIndex];
      const newWeights = [...entry.weightPerSet];
      newWeights[setIndex] = weight;
      u[entryIndex] = { ...entry, weightPerSet: newWeights };
      return u;
    });
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const valid = entries.filter((en) => en.exerciseId);
    if (valid.length === 0) return;
    void onSubmit({ dayOfWeek, workoutDate, notes, entries: valid });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="dayOfWeek">Day of Week</Label>
          <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="workoutDate">Date</Label>
          <input id="workoutDate" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" type="date" value={workoutDate} onChange={(e) => setWorkoutDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Exercises ({entries.length})</h3>
          <Button type="button" size="sm" onClick={addExercise}>+ Add Exercise</Button>
        </div>
        {entries.map((entry, i) => {
          return (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-start gap-2">
                <span className="mt-2 text-sm font-medium text-muted-foreground">#{i + 1}</span>
                <Select
                  value={entry.exerciseId}
                  onValueChange={(v) => {
                    const ex = exercises.find((x) => x.id === v);
                    updateEntry(i, 'exerciseId', v);
                    if (ex) updateEntry(i, 'exerciseName', ex.name);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((ex) => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {ex.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {entries.length > 1 && <Button variant="destructive" size="sm" onClick={() => removeExercise(i)}>×</Button>}
              </div>

              {/* Target display */}
              {(entry.targetSets || entry.targetReps || entry.targetWeight) && (
                <div className="mb-3 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Target: {entry.targetSets ?? '—'} sets × {entry.targetReps ?? '—'} reps @ {entry.targetWeight ?? '—'}kg
                  </span>
                </div>
              )}

              {/* Per-set logging */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">
                    Sets Completed: {entry.setsCompleted}
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => addSet(i)}>
                    <Plus className="mr-1 h-3 w-3" /> Add Set
                  </Button>
                </div>

                <div className="space-y-2">
                  {entry.repsPerSet.map((reps, setIdx) => (
                    <div key={setIdx} className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-16 justify-center">
                        Set {setIdx + 1}
                      </Badge>
                      <div className="flex-1">
                        <Label className="text-xs">Reps</Label>
                        <Input
                          type="number"
                          className="h-8"
                          value={reps}
                          onChange={(e) => updateSetReps(i, setIdx, parseInt(e.target.value, 10) || 0)}
                          min={0}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">Weight (kg)</Label>
                        <Input
                          type="number"
                          className="h-8"
                          value={entry.weightPerSet[setIdx] ?? 0}
                          onChange={(e) => updateSetWeight(i, setIdx, parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.5}
                        />
                      </div>
                      {entry.setsCompleted > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-5 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSet(i, setIdx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <textarea id="notes" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} />
      </div>
      <Button className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving...' : 'Save Workout'}</Button>
    </form>
  );
}
