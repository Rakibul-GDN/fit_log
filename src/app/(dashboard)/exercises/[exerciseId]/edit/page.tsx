'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { useUpdateExercise } from '@/hooks/api/useExercises';

const exerciseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'RESISTANCE_BAND', 'OTHER']),
  primaryMuscles: z.array(z.string().min(1)).min(1),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

export default function EditExercisePage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const exerciseId = params?.exerciseId as string;
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const updateExercise = useUpdateExercise();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', description: '', category: 'BARBELL', primaryMuscles: [''] },
  });

  // Fetch exercise data
  useEffect(() => {
    let cancelled = false;

    const fetchExercise = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/exercises/${exerciseId}`);
        if (!res.ok) {
          setServerError('Failed to load exercise.');
          return;
        }
        const json = (await res.json()) as { success: boolean; data: { name: string; description?: string | null; category: string; primaryMuscles: string[] } };
        if (!cancelled && json.data) {
          setValue('name', json.data.name);
          setValue('description', json.data.description ?? '');
          setValue('category', json.data.category as never);
          setValue('primaryMuscles', json.data.primaryMuscles);
        }
      } catch {
        if (!cancelled) {
          setServerError('An unexpected error occurred.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchExercise();
    return () => { cancelled = true; };
  }, [exerciseId, setValue]);

  const onSubmit = useCallback(async (data: ExerciseFormValues): Promise<void> => {
    setServerError(null);
    await updateExercise.mutateAsync({
      exerciseId,
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category,
        primaryMuscles: data.primaryMuscles,
      },
    });
    router.push('/exercises');
  }, [exerciseId, router, updateExercise]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted"></div>
          <div className="h-10 w-full rounded bg-muted"></div>
          <div className="h-10 w-full rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  if (serverError && !updateExercise.isPending) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Edit Exercise</h1>
        <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{serverError}</div>
        <Button variant="outline" onClick={() => router.push('/exercises')}>Back to Exercises</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Edit Exercise</h1>
      {serverError && <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{serverError}</div>}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Exercise Name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        <Input label="Description (optional)" {...register('description')} />
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" {...register('category')}>
            {['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'RESISTANCE_BAND', 'OTHER'].map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Primary Muscles (comma-separated)</label>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" {...register('primaryMuscles', { setValueAs: (v: unknown) => typeof v === 'string' ? v.split(',').map((s) => s.trim()) : v })} />
          {errors.primaryMuscles && <p className="text-sm text-destructive">{errors.primaryMuscles.message}</p>}
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={updateExercise.isPending}>
            {updateExercise.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.push('/exercises')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
