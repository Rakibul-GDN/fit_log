'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Form-specific schema using strings for date (HTML date input)
const bodyMeasurementFormSchema = z.object({
  measurementType: z.enum([
    'BODY_WEIGHT',
    'CHEST',
    'WAIST',
    'HIPS',
    'LEFT_ARM',
    'RIGHT_ARM',
    'LEFT_THIGH',
    'RIGHT_THIGH',
    'LEFT_CALF',
    'RIGHT_CALF',
    'SHOULDERS',
    'NECK',
    'BODY_FAT_PERCENTAGE',
  ]),
  value: z.number().positive().max(1000),
  unit: z.enum(['KG', 'LBS', 'CM', 'INCHES']),
  measurementDate: z.string(),
  notes: z.string().max(500).optional(),
});

export type BodyMeasurementFormValues = z.infer<typeof bodyMeasurementFormSchema>;

const MEASUREMENT_TYPES = [
  { value: 'BODY_WEIGHT', label: 'Body Weight' },
  { value: 'CHEST', label: 'Chest' },
  { value: 'WAIST', label: 'Waist' },
  { value: 'HIPS', label: 'Hips' },
  { value: 'LEFT_ARM', label: 'Left Arm' },
  { value: 'RIGHT_ARM', label: 'Right Arm' },
  { value: 'LEFT_THIGH', label: 'Left Thigh' },
  { value: 'RIGHT_THIGH', label: 'Right Thigh' },
  { value: 'LEFT_CALF', label: 'Left Calf' },
  { value: 'RIGHT_CALF', label: 'Right Calf' },
  { value: 'SHOULDERS', label: 'Shoulders' },
  { value: 'NECK', label: 'Neck' },
  { value: 'BODY_FAT_PERCENTAGE', label: 'Body Fat %' },
] as const;

const UNITS = [
  { value: 'KG', label: 'kg' },
  { value: 'LBS', label: 'lbs' },
  { value: 'CM', label: 'cm' },
  { value: 'INCHES', label: 'in' },
] as const;

interface BodyMeasurementFormProps {
  onSubmit: (data: BodyMeasurementFormValues) => void;
  isSubmitting?: boolean;
}

/** Form for adding a new body measurement */
export function BodyMeasurementForm({
  onSubmit,
  isSubmitting = false,
}: BodyMeasurementFormProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BodyMeasurementFormValues>({
    resolver: zodResolver(bodyMeasurementFormSchema),
    defaultValues: {
      measurementType: 'BODY_WEIGHT',
      value: 0,
      unit: 'KG',
      measurementDate: new Date().toISOString().split('T')[0],
      notes: undefined,
    },
  });

  const handleFormSubmit = (data: BodyMeasurementFormValues): void => {
    onSubmit(data);
    reset({
      measurementType: data.measurementType,
      value: 0,
      unit: data.unit,
      measurementDate: data.measurementDate,
      notes: undefined,
    });
  };

  return (
    <Card>
      <div className='p-4'>
        <h3 className='text-lg font-semibold'>Add Body Measurement</h3>
      </div>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4 p-4 pt-0'>
        <div>
          <label className='mb-1 block text-sm font-medium' htmlFor='measurementType'>
            Measurement Type
          </label>
          <select
            id='measurementType'
            className='w-full rounded border border-default-300 bg-transparent p-2 text-sm'
            {...register('measurementType')}
          >
            {MEASUREMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.measurementType && (
            <p className='mt-1 text-sm text-danger-600'>{errors.measurementType.message}</p>
          )}
        </div>

        <div className='flex gap-4'>
          <div className='flex-1'>
            <Input
              label='Value'
              type='number'
              step='0.1'
              {...register('value', { valueAsNumber: true })}
            />
            {errors.value && (
              <p className='mt-1 text-sm text-danger-600'>{errors.value.message}</p>
            )}
          </div>
          <div className='w-32'>
            <label className='mb-1 block text-sm font-medium' htmlFor='unit'>
              Unit
            </label>
            <select
              id='unit'
              className='w-full rounded border border-default-300 bg-transparent p-2 text-sm'
              {...register('unit')}
            >
              {UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            {errors.unit && (
              <p className='mt-1 text-sm text-danger-600'>{errors.unit.message}</p>
            )}
          </div>
        </div>

        <Input
          label='Date'
          type='date'
          {...register('measurementDate')}
        />
        {errors.measurementDate && (
          <p className='mt-1 text-sm text-danger-600'>{errors.measurementDate.message}</p>
        )}

        <div>
          <label className='mb-1 block text-sm font-medium' htmlFor='notes'>
            Notes (optional)
          </label>
          <textarea
            id='notes'
            className='w-full rounded border border-default-300 bg-transparent p-2 text-sm'
            maxLength={500}
            placeholder='Any notes about this measurement'
            {...register('notes')}
          />
          {errors.notes && (
            <p className='mt-1 text-sm text-danger-600'>{errors.notes.message}</p>
          )}
        </div>

        <Button type='submit' color='primary' isLoading={isSubmitting}>
          Add Measurement
        </Button>
      </form>
    </Card>
  );
}
