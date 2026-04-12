'use client';

import { QuickLogReview } from '@/components/forms/QuickLogReview';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

interface LogEntry { id: string; exerciseId: string; exerciseName: string; setsCompleted: number; repsPerSet: number[]; weightPerSet: number[]; notes: string }

export default function QuickLogPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const routineId = params?.routineId as string;
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>(DAYS[0]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(async (day: typeof DAYS[number]): Promise<void> => {
    setIsLoading(true); setError(null);
    try {
      const res = await fetch(`/api/routines/${routineId}/quick-log-preview?dayOfWeek=${day}`);
      const data = (await res.json()) as { success: boolean; data?: { entries: LogEntry[] }; error?: { message: string } };
      if (!res.ok || !data.success) { setError(data.error?.message ?? 'Failed to load exercises'); setLogEntries([]); }
      else { setLogEntries(data.data?.entries ?? []); setStep('review'); }
    } catch { setError('An unexpected error occurred.'); }
    finally { setIsLoading(false); }
  }, [routineId]);

  const handleSave = useCallback(async (entries: LogEntry[]): Promise<void> => {
    try {
      const res = await fetch(`/api/routines/${routineId}/quick-log`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: selectedDay, workoutDate: new Date().toISOString(), entries: entries.map((e) => ({ exerciseId: e.exerciseId, setsCompleted: e.setsCompleted, repsPerSet: e.repsPerSet, weightPerSet: e.weightPerSet, notes: e.notes || null })) }),
      });
      if (!res.ok) throw new Error('Failed to save workout');
      router.push('/workouts');
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save workout'); }
  }, [routineId, selectedDay, router]);

  const handleDiscard = useCallback((): void => { setStep('select'); setLogEntries([]); setError(null); }, []);

  if (step === 'select') return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Quick Log</h1>
      <p className="mb-4 text-muted-foreground">Select the day you want to log from this routine.</p>
      {error && <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Day of Week</label>
          <select className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value as typeof DAYS[number])}>
            {DAYS.map((day) => <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
        <button className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50" disabled={isLoading} onClick={() => void fetchPreview(selectedDay)} type="button">
          {isLoading ? 'Loading exercises...' : 'Preview Exercises'}
        </button>
        <button className="w-full text-sm text-muted-foreground transition hover:text-foreground" onClick={() => router.push(`/routines/${routineId}`)} type="button">← Back to Routine</button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {error && <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <QuickLogReview dayOfWeek={selectedDay} entries={logEntries} onDiscard={handleDiscard} onSave={handleSave} />
    </div>
  );
}
