'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, X, Check } from 'lucide-react';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

const EXERCISE_CATEGORIES = ['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'RESISTANCE_BAND', 'OTHER'] as const;

const assignmentSchema = z.object({
  exerciseId: z.string().min(1, 'Exercise is required.'),
  dayOfWeek: z.enum(DAYS),
  defaultSets: z.number().int().min(1).max(100),
  defaultReps: z.number().int().min(1).max(500),
  defaultWeight: z.number().min(0),
  order: z.number().int().min(0),
});

const routineFormSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100),
  description: z.string().max(500).optional(),
  assignments: z.array(assignmentSchema).min(1, 'At least one exercise assignment is required.'),
});

export type RoutineFormValues = z.infer<typeof routineFormSchema>;

export interface RoutineFormProps {
  defaultValues?: Partial<RoutineFormValues>;
  exercises?: { id: string; name: string; category: string }[];
  onExercisesChange?: (exercises: { id: string; name: string; category: string }[]) => void;
  onSubmit: (data: RoutineFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100),
  category: z.enum(EXERCISE_CATEGORIES),
  primaryMuscles: z.string().min(1, 'At least one muscle group required.'),
  description: z.string().max(500).optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

/** Inline exercise creation dialog for RoutineForm */
function CreateExerciseDialog({
  onExerciseCreated,
}: {
  onExerciseCreated: (exercise: { id: string; name: string; category: string }) => void;
}): ReactNode {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', category: 'BARBELL', primaryMuscles: '', description: '' },
  });

  const onSubmit = async (data: ExerciseFormValues): Promise<void> => {
    setIsCreating(true);
    setServerError(null);
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          primaryMuscles: data.primaryMuscles.split(',').map((m) => m.trim()).filter(Boolean),
          description: data.description ?? null,
        }),
      });

      const result = (await res.json()) as { success: boolean; data?: { id: string; name: string; category: string }; error?: { message: string } };

      if (!res.ok) {
        setServerError(result.error?.message ?? 'Failed to create exercise.');
        return;
      }

      if (result.success && result.data) {
        onExerciseCreated(result.data);
        reset();
        setValue('category', 'BARBELL');
        setOpen(false);
        setServerError(null);
      }
    } catch {
      setServerError('An unexpected error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (val) setValue('category', 'BARBELL'); }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          New Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Exercise</DialogTitle>
          <DialogDescription>
            Add a custom exercise to your library and use it in this routine.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="ex-name">Exercise Name</Label>
            <Input id="ex-name" placeholder="e.g., Bulgarian Split Squat" {...register('name')} />
            {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="ex-category">Category</Label>
            <Select onValueChange={(v) => setValue('category', v as typeof EXERCISE_CATEGORIES[number])} defaultValue="BARBELL">
              <SelectTrigger id="ex-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXERCISE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>}
          </div>
          <div>
            <Label htmlFor="ex-muscles">Primary Muscles (comma-separated)</Label>
            <Input id="ex-muscles" placeholder="e.g., Quadriceps, Glutes, Hamstrings" {...register('primaryMuscles')} />
            {errors.primaryMuscles && <p className="mt-1 text-sm text-destructive">{errors.primaryMuscles.message}</p>}
          </div>
          <div>
            <Label htmlFor="ex-desc">Description (optional)</Label>
            <Input id="ex-desc" placeholder="Form tips, notes, etc." {...register('description')} />
            {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
          </div>
          {serverError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isCreating}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? 'Creating...' : 'Create Exercise'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Editable target values for an assignment */
function EditableAssignmentTargets({
  sets,
  reps,
  weight,
  onChange,
}: {
  sets: number;
  reps: number;
  weight: number;
  onChange: (sets: number, reps: number, weight: number) => void;
}): ReactNode {
  const [editing, setEditing] = useState(false);
  const [tempSets, setTempSets] = useState(String(sets));
  const [tempReps, setTempReps] = useState(String(reps));
  const [tempWeight, setTempWeight] = useState(String(weight));

  useEffect(() => {
    if (editing) {
      setTempSets(String(sets));
      setTempReps(String(reps));
      setTempWeight(String(weight));
    }
  }, [sets, reps, weight, editing]);

  const handleSave = (): void => {
    const s = parseInt(tempSets, 10) || sets;
    const r = parseInt(tempReps, 10) || reps;
    const w = parseFloat(tempWeight) || weight;
    onChange(s, r, w);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {sets} sets × {reps} reps @ {weight}kg
        </span>
        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditing(true)}>
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <Input
          className="h-7 w-14 text-xs"
          value={tempSets}
          onChange={(e) => setTempSets(e.target.value)}
          type="number"
          min={1}
          aria-label="Sets"
        />
        <span className="text-xs text-muted-foreground">×</span>
        <Input
          className="h-7 w-14 text-xs"
          value={tempReps}
          onChange={(e) => setTempReps(e.target.value)}
          type="number"
          min={1}
          aria-label="Reps"
        />
        <span className="text-xs text-muted-foreground">@</span>
        <Input
          className="h-7 w-16 text-xs"
          value={tempWeight}
          onChange={(e) => setTempWeight(e.target.value)}
          type="number"
          min={0}
          step={0.5}
          aria-label="Weight"
        />
        <span className="text-xs text-muted-foreground">kg</span>
      </div>
      <div className="flex gap-1">
        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-emerald-600" onClick={handleSave}>
          <Check className="h-3 w-3" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => setEditing(false)}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function RoutineForm({ defaultValues, exercises = [], onExercisesChange, onSubmit, isSubmitting }: RoutineFormProps): ReactNode {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>('MONDAY');
  const [localExercises, setLocalExercises] = useState(exercises);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RoutineFormValues>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: { name: defaultValues?.name ?? '', description: defaultValues?.description ?? '', assignments: defaultValues?.assignments ?? [] },
  });

  const assignments = watch('assignments');

  useEffect(() => {
    if (defaultValues?.assignments && defaultValues.assignments.length > 0) {
      setValue('assignments', defaultValues.assignments);
    }
  }, [defaultValues?.assignments, setValue]);

  useEffect(() => {
    setLocalExercises(exercises);
  }, [exercises]);

  const handleExerciseCreated = (exercise: { id: string; name: string; category: string }): void => {
    const updated = [...localExercises, exercise];
    setLocalExercises(updated);
    onExercisesChange?.(updated);
    setSelectedExercise(exercise.id);
  };

  const addAssignment = (): void => {
    if (!selectedExercise) return;
    const setsEl = document.getElementById('target-sets') as HTMLInputElement | null;
    const repsEl = document.getElementById('target-reps') as HTMLInputElement | null;
    const weightEl = document.getElementById('target-weight') as HTMLInputElement | null;
    const sets = Math.max(1, parseInt(setsEl?.value ?? '3', 10) || 3);
    const reps = Math.max(1, parseInt(repsEl?.value ?? '10', 10) || 10);
    const weight = Math.max(0, parseFloat(weightEl?.value ?? '0') || 0);

    const current = assignments ?? [];
    setValue('assignments', [...current, { exerciseId: selectedExercise, dayOfWeek: selectedDay, defaultSets: sets, defaultReps: reps, defaultWeight: weight, order: current.length }]);
    setSelectedExercise('');
    if (setsEl) setsEl.value = '3';
    if (repsEl) repsEl.value = '10';
    if (weightEl) weightEl.value = '0';
  };

  const removeAssignment = (index: number): void => {
    const current = assignments ?? [];
    setValue('assignments', current.filter((_, i) => i !== index));
  };

  const updateAssignmentTargets = (index: number, sets: number, reps: number, weight: number): void => {
    const current = assignments ?? [];
    const updated = [...current];
    updated[index] = { ...updated[index], defaultSets: sets, defaultReps: reps, defaultWeight: weight };
    setValue('assignments', updated);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Routine Name" {...register('name')} />
      {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      <Input label="Description (optional)" {...register('description')} />

      <div>
        <h3 className="mb-2 text-lg font-semibold">Exercises</h3>
        {assignments && assignments.length > 0 ? (
          <ul className="space-y-2">
            {assignments.map((a, i) => (
              <li key={i} className="flex items-center gap-2 rounded bg-muted p-2">
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    {localExercises.find((e) => e.id === a.exerciseId)?.name ?? 'Unknown'}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    — {a.dayOfWeek.charAt(0) + a.dayOfWeek.slice(1).toLowerCase()}
                  </span>
                  <div className="mt-1">
                    <EditableAssignmentTargets
                      sets={a.defaultSets}
                      reps={a.defaultReps}
                      weight={a.defaultWeight}
                      onChange={(sets, reps, weight) => updateAssignmentTargets(i, sets, reps, weight)}
                    />
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => removeAssignment(i)}>Remove</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No exercises assigned yet.</p>
        )}
        {errors.assignments && <p className="mt-1 text-sm text-destructive">{errors.assignments.message}</p>}

        <div className="mt-3 space-y-2 rounded border p-3">
          <p className="text-sm font-medium">Add Exercise</p>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {localExercises.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id}>
                    {ex.name} ({ex.category.replace(/_/g, ' ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as typeof DAYS[number])}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target inputs: sets × reps @ weight */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="flex items-center gap-1">
              <Label className="text-xs text-muted-foreground">Sets</Label>
              <Input
                className="h-8 w-16"
                type="number"
                min={1}
                max={100}
                id="target-sets"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAssignment(); } }}
              />
            </div>
            <span className="text-xs text-muted-foreground">×</span>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-muted-foreground">Reps</Label>
              <Input
                className="h-8 w-16"
                type="number"
                min={1}
                max={500}
                id="target-reps"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAssignment(); } }}
              />
            </div>
            <span className="text-xs text-muted-foreground">@</span>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
              <Input
                className="h-8 w-20"
                type="number"
                min={0}
                step={0.5}
                id="target-weight"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAssignment(); } }}
              />
            </div>
            <Button type="button" onClick={addAssignment} disabled={!selectedExercise} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </div>

      <CreateExerciseDialog onExerciseCreated={handleExerciseCreated} />

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving...' : (defaultValues ? 'Update Routine' : 'Create Routine')}
      </Button>
    </form>
  );
}
