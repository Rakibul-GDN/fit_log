'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useExercises } from '@/hooks/api/useExercises';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';

/** Log entry with editable fields */
interface LogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsPerSet: number[];
  weight: number;
  notes: string;
}

/** Quick log review props */
export interface QuickLogReviewProps {
  entries: LogEntry[];
  _routineId?: string;
  dayOfWeek: string;
  onSave: (entries: LogEntry[]) => void | Promise<void>;
  onDiscard: () => void;
}

/**
 * QuickLogReview — pre-filled exercise list with editable sets/reps/weight.
 */
export function QuickLogReview({
  entries: initialEntries,
  _routineId,
  dayOfWeek,
  onSave,
  onDiscard,
}: QuickLogReviewProps): ReactNode {
  const [entries, setEntries] = useState<LogEntry[]>(initialEntries);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const { data: exercisesData } = useExercises(1, 100);

  const updateEntry = (index: number, field: keyof LogEntry, value: unknown): void => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeEntry = (index: number): void => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const addExercise = (exerciseId: string): void => {
    const exercise = exercisesData?.data?.find((e) => e.id === exerciseId);
    if (!exercise) return;

    setEntries((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        setsCompleted: 3,
        repsPerSet: [10, 10, 10],
        weight: 0,
        notes: '',
      },
    ]);
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      await onSave(entries);
      router.push('/workouts');
    } catch {
      // Error handled by mutation
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Quick Log — {dayOfWeek.replace(/_/g, ' ').toLowerCase()}</h2>
          <p className='text-sm text-default-500'>Review and edit your workout before saving</p>
        </div>
        <div className='flex gap-2'>
          <Button color='danger' onPress={onDiscard}>
            Discard
          </Button>
          <Button isLoading={isSaving} onPress={() => void handleSave()}>
            Save Workout
          </Button>
        </div>
      </div>

      <div className='space-y-4'>
        {entries.map((entry, i) => (
          <div className='rounded-lg border border-default-200 bg-card p-4' key={entry.id}>
            <div className='mb-3 flex items-center justify-between'>
              <h4 className='font-semibold'>{entry.exerciseName}</h4>
              <Button color='danger' size='sm' onPress={() => removeEntry(i)}>
                Remove
              </Button>
            </div>
            <div className='grid grid-cols-3 gap-3'>
              <Input
                label='Sets'
                type='number'
                value={entry.setsCompleted}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const sets = parseInt(e.target.value, 10) || 1;
                  updateEntry(i, 'setsCompleted', sets);
                  updateEntry(i, 'repsPerSet', Array(sets).fill(10));
                }}
              />
              <Input
                label='Reps per set'
                type='text'
                value={entry.repsPerSet.join(', ')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const reps = e.target.value
                    .split(',')
                    .map((r) => parseInt(r.trim(), 10) || 10);
                  updateEntry(i, 'repsPerSet', reps);
                }}
              />
              <Input
                label='Weight (kg)'
                type='number'
                value={entry.weight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateEntry(i, 'weight', parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add exercise dropdown */}
      <div className='flex items-center gap-2'>
        <select
          className='flex-1 rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
          onChange={(e) => {
            if (e.target.value) addExercise(e.target.value);
            e.target.value = '';
          }}
        >
          <option value=''>+ Add Exercise</option>
          {exercisesData?.data?.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
