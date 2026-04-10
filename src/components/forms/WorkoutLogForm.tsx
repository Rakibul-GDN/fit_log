'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExercises } from '@/hooks/api/useExercises';
import { useState, type ReactNode } from 'react';

export interface WorkoutEntry {
  exerciseId: string;
  exerciseName?: string;
  setsCompleted: number;
  repsPerSet: number[];
  weight: number;
  notes: string;
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
  const [entries, setEntries] = useState<WorkoutEntry[]>(defaultEntries.length > 0 ? defaultEntries : [{ exerciseId: '', setsCompleted: 3, repsPerSet: [10, 10, 10], weight: 0, notes: '' }]);

  const updateEntry = (index: number, field: keyof WorkoutEntry, value: unknown): void => { setEntries((p) => { const u = [...p]; u[index] = { ...u[index], [field]: value }; return u; }); };
  const addExercise = (): void => setEntries((p) => [...p, { exerciseId: '', setsCompleted: 3, repsPerSet: [10], weight: 0, notes: '' }]);
  const removeExercise = (index: number): void => setEntries((p) => p.filter((_, i) => i !== index));

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
          <select id="dayOfWeek" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
            {DAYS.map((d) => <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>)}
          </select>
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
        {entries.map((entry, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-start gap-2">
              <span className="mt-2 text-sm font-medium text-muted-foreground">#{i + 1}</span>
              <select className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" value={entry.exerciseId} onChange={(e) => { const ex = exercises.find((x) => x.id === e.target.value); updateEntry(i, 'exerciseId', e.target.value); if (ex) updateEntry(i, 'exerciseName', ex.name); }}>
                <option value="">Select exercise</option>
                {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
              {entries.length > 1 && <Button variant="destructive" size="sm" onClick={() => removeExercise(i)}>×</Button>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Sets</Label><Input type="number" value={entry.setsCompleted} onChange={(e) => updateEntry(i, 'setsCompleted', parseInt(e.target.value, 10) || 1)} /></div>
              <div><Label>Reps per set</Label><Input value={entry.repsPerSet.join(', ')} onChange={(e) => updateEntry(i, 'repsPerSet', e.target.value.split(',').map((r) => parseInt(r.trim(), 10) || 10))} /></div>
              <div><Label>Weight</Label><Input type="number" value={entry.weight} onChange={(e) => updateEntry(i, 'weight', parseFloat(e.target.value) || 0)} /></div>
            </div>
          </div>
        ))}
      </div>

      <div><Label htmlFor="notes">Notes (optional)</Label><textarea id="notes" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} /></div>
      <Button className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? 'Saving...' : 'Save Workout'}</Button>
    </form>
  );
}
