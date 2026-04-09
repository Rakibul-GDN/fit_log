'use client';

import { QuickLogReview } from '@/components/forms/QuickLogReview';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

interface LogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setsCompleted: number;
  repsPerSet: number[];
  weight: number;
  notes: string;
}

/** Quick log page — select day, review/edit pre-filled exercises, save or discard. */
export default function QuickLogPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const routineId = params?.routineId as string;

  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>(DAYS[0]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch preview (does NOT create workout)
  const fetchPreview = useCallback(async (day: typeof DAYS[number]): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/routines/${routineId}/quick-log-preview?dayOfWeek=${day}`);
      const data = (await res.json()) as {
        success: boolean;
        data?: { entries: LogEntry[] };
        error?: { message: string; code?: string };
      };
      if (!res.ok || !data.success) {
        setError(data.error?.message ?? 'Failed to load exercises');
        setLogEntries([]);
      } else {
        setLogEntries(data.data?.entries ?? []);
        setStep('review');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [routineId]);

  // Save workout (creates it in DB)
  const handleSave = useCallback(async (entries: LogEntry[]): Promise<void> => {
    try {
      const res = await fetch(`/api/routines/${routineId}/quick-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          workoutDate: new Date().toISOString(),
          entries: entries.map((e) => ({
            exerciseId: e.exerciseId,
            setsCompleted: e.setsCompleted,
            repsPerSet: e.repsPerSet,
            weight: e.weight,
            notes: e.notes || null,
          })),
        }),
      });
      if (!res.ok) {
        const errData = (await res.json()) as { error?: { message?: string } };
        throw new Error(errData.error?.message ?? 'Failed to save workout');
      }
      router.push('/workouts');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save workout';
      setError(message);
    }
  }, [routineId, selectedDay, router]);

  const handleDiscard = useCallback((): void => {
    setStep('select');
    setLogEntries([]);
    setError(null);
  }, []);

  // Reset to select step when day changes
  useEffect(() => {
    if (step === 'review') {
      setStep('select');
      setLogEntries([]);
    }
  }, [selectedDay, step]);

  if (step === 'select') {
    return (
      <div className='mx-auto max-w-2xl px-4 py-8'>
        <h1 className='mb-6 text-3xl font-bold'>Quick Log</h1>
        <p className='mb-4 text-default-500'>Select the day you want to log from this routine.</p>

        {error && (
          <div className='mb-4 rounded border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700'>
            {error}
          </div>
        )}

        <div className='space-y-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>Day of Week</label>
            <select
              className='w-full rounded-md border border-default-200 bg-card px-3 py-2 text-sm'
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as typeof DAYS[number])}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            className='w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50'
            disabled={isLoading}
            onClick={() => void fetchPreview(selectedDay)}
            type='button'
          >
            {isLoading ? 'Loading exercises...' : 'Preview Exercises'}
          </button>

          <button
            className='w-full text-sm text-default-500 transition hover:text-foreground'
            onClick={() => router.push(`/routines/${routineId}`)}
            type='button'
          >
            ← Back to Routine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      {error && (
        <div className='mb-4 rounded border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700'>
          {error}
        </div>
      )}
      <QuickLogReview
        dayOfWeek={selectedDay}
        entries={logEntries}
        onDiscard={handleDiscard}
        onSave={handleSave}
      />
    </div>
  );
}
