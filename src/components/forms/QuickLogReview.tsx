'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExercises } from '@/hooks/api/useExercises';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

interface LogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsPerSet: number[];
  weight: number;
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
    setEntries((prev) => [...prev, { id: `new-${Date.now()}`, exerciseId: exercise.id, exerciseName: exercise.name, setsCompleted: 3, repsPerSet: [10, 10, 10], weight: 0, notes: '' }]);
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
        <p className="text-muted-foreground">Review and edit your workout before saving</p>
      </div>

      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={entry.id} className="rounded-lg border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{entry.exerciseName}</span>
              <Button variant="destructive" size="sm" onClick={() => removeEntry(i)}>×</Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Sets</Label>
                <Input type="number" value={entry.setsCompleted} onChange={(e) => updateEntry(i, 'setsCompleted', parseInt(e.target.value, 10) || 1)} />
              </div>
              <div>
                <Label>Reps per set</Label>
                <Input value={entry.repsPerSet.join(', ')} onChange={(e) => updateEntry(i, 'repsPerSet', e.target.value.split(',').map((r) => parseInt(r.trim(), 10) || 10))} />
              </div>
              <div>
                <Label>Weight</Label>
                <Input type="number" value={entry.weight} onChange={(e) => updateEntry(i, 'weight', parseFloat(e.target.value) || 0)} />
              </div>
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
