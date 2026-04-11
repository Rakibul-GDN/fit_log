'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useExercises } from '@/hooks/api/useExercises';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';

interface LogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsPerSet: number[];
  weightPerSet: number[];
  notes: string;
}

export interface QuickLogReviewProps {
  entries: LogEntry[];
  _routineId?: string;
  dayOfWeek: string;
  onSave: (entries: LogEntry[]) => void | Promise<void>;
  onDiscard: () => void;
}

export function QuickLogReview({ entries: initialEntries, dayOfWeek, onSave, onDiscard }: QuickLogReviewProps): ReactNode {
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { data: exercisesData } = useExercises(1, 100);

  const updateEntry = (index: number, field: keyof LogEntry, value: unknown): void => {
    setEntries((prev) => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u; });
  };

  const removeEntry = (index: number): void => setEntries((p) => p.filter((_, i) => i !== index));

  const addExercise = (exerciseId: string): void => {
    const exercise = exercisesData?.data?.find((e) => e.id === exerciseId);
    if (!exercise) return;
    setEntries((prev) => [...prev, { id: `new-${Date.now()}`, exerciseId: exercise.id, exerciseName: exercise.name, setsCompleted: 3, repsPerSet: [10, 10, 10], weightPerSet: [0, 0, 0], notes: '' }]);
  };

  /** Add a set to an entry */
  const addSet = (entryIndex: number): void => {
    setEntries((prev) => {
      const u = [...prev];
      const entry = u[entryIndex];
      u[entryIndex] = {
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
    setEntries((prev) => {
      const u = [...prev];
      const entry = u[entryIndex];
      if (entry.setsCompleted <= 1) return prev;
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
    setEntries((prev) => {
      const u = [...prev];
      const entry = u[entryIndex];
      const newReps = [...entry.repsPerSet];
      newReps[setIndex] = reps;
      u[entryIndex] = { ...entry, repsPerSet: newReps };
      return u;
    });
  };

  /** Update weight for a specific set */
  const updateSetWeight = (entryIndex: number, setIndex: number, weight: number): void => {
    setEntries((prev) => {
      const u = [...prev];
      const entry = u[entryIndex];
      const newWeights = [...entry.weightPerSet];
      newWeights[setIndex] = weight;
      u[entryIndex] = { ...entry, weightPerSet: newWeights };
      return u;
    });
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try { await onSave(entries); router.push('/workouts'); }
    catch { /* toast will show */ }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Review Workout — {dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}</h2>
        <p className="text-muted-foreground">Review and edit each set before saving</p>
      </div>

      <div className="space-y-6">
        {entries.map((entry, i) => (
          <div key={entry.id} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-lg font-semibold">{entry.exerciseName}</span>
              <Button variant="destructive" size="sm" onClick={() => removeEntry(i)}>×</Button>
            </div>

            <div className="space-y-2">
              {entry.repsPerSet.map((reps, setIdx) => (
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
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => addSet(i)}>
                <Plus className="mr-1 h-3 w-3" /> Add Set
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add exercise dropdown */}
      <div className="flex gap-2">
        <select className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={(e) => { if (e.target.value) { addExercise(e.target.value); e.target.value = ''; } }}>
          <option value="">+ Add exercise...</option>
          {exercisesData?.data?.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
        </select>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? 'Saving...' : 'Save Workout'}
        </Button>
        <Button variant="outline" onClick={onDiscard}>Discard</Button>
      </div>
    </div>
  );
}
