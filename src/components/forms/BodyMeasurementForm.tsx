'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';

const bodyMeasurementFormSchema = z.object({
  measurementType: z.enum([
    'BODY_WEIGHT', 'CHEST', 'WAIST', 'HIPS', 'LEFT_ARM', 'RIGHT_ARM',
    'LEFT_THIGH', 'RIGHT_THIGH', 'LEFT_CALF', 'RIGHT_CALF',
    'SHOULDERS', 'NECK', 'BODY_FAT_PERCENTAGE',
  ]),
  value: z.number().positive().max(1000),
  unit: z.enum(['KG', 'LBS', 'CM', 'INCHES']),
  measurementDate: z.string(),
  notes: z.string().max(500).optional(),
});

export type BodyMeasurementFormValues = z.infer<typeof bodyMeasurementFormSchema>;

interface BodyMeasurementFormProps {
  onSubmit: (data: BodyMeasurementFormValues) => void;
  isSubmitting?: boolean;
}

export function BodyMeasurementForm({ onSubmit, isSubmitting = false }: BodyMeasurementFormProps): React.ReactElement {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BodyMeasurementFormValues>({
    resolver: zodResolver(bodyMeasurementFormSchema),
    defaultValues: {
      measurementType: 'BODY_WEIGHT', value: 0, unit: 'KG',
      measurementDate: new Date().toISOString().split('T')[0], notes: undefined,
    },
  });

  const handleFormSubmit = (data: BodyMeasurementFormValues): void => {
    onSubmit(data);
    reset({ ...data, value: 0, notes: undefined });
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Add Body Measurement</h3>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="measurementType">Measurement Type</Label>
          <select id="measurementType" className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('measurementType')}>
            {['BODY_WEIGHT','CHEST','WAIST','HIPS','LEFT_ARM','RIGHT_ARM','LEFT_THIGH','RIGHT_THIGH','LEFT_CALF','RIGHT_CALF','SHOULDERS','NECK','BODY_FAT_PERCENTAGE'].map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {errors.measurementType && <p className="mt-1 text-sm text-destructive">{errors.measurementType.message}</p>}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input label="Value" type="number" step="0.1" {...register('value', { valueAsNumber: true })} />
            {errors.value && <p className="mt-1 text-sm text-destructive">{errors.value.message}</p>}
          </div>
          <div className="w-32">
            <Label htmlFor="unit">Unit</Label>
            <select id="unit" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('unit')}>
              {['KG','LBS','CM','INCHES'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            {errors.unit && <p className="mt-1 text-sm text-destructive">{errors.unit.message}</p>}
          </div>
        </div>

        <Input label="Date" type="date" {...register('measurementDate')} />
        {errors.measurementDate && <p className="mt-1 text-sm text-destructive">{errors.measurementDate.message}</p>}

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <textarea id="notes" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" maxLength={500} {...register('notes')} />
          {errors.notes && <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>Add Measurement</Button>
      </form>
    </div>
  );
}
