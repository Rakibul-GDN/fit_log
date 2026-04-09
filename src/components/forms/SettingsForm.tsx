'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { User } from '@/types/entities';

// Form-specific schema - all fields required for form
const settingsFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  preferredUnits: z.enum(['METRIC', 'IMPERIAL']),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface SettingsFormProps {
  user: User;
  onSubmit: (data: SettingsFormValues) => void;
  isSubmitting?: boolean;
}

/** Form for updating account settings (name, email, units) */
export function SettingsForm({
  user,
  onSubmit,
  isSubmitting = false,
}: SettingsFormProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: user.name ?? '',
      email: user.email,
      preferredUnits: user.preferredUnits,
    },
  });

  const handleFormSubmit = (data: SettingsFormValues): void => {
    onSubmit(data);
  };

  return (
    <Card>
      <div className='p-4'>
        <h3 className='text-lg font-semibold'>Account Settings</h3>
      </div>
      <div className='border-t border-default-200' />
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6 p-4 pt-0'>
        <div className='space-y-4'>
          <Input
            label='Name'
            placeholder='Your name'
            {...register('name')}
          />
          {errors.name && (
            <p className='text-sm text-danger-600'>{errors.name.message}</p>
          )}

          <Input
            label='Email'
            type='email'
            placeholder='your@email.com'
            {...register('email')}
            isDisabled={!user.emailVerified}
          />
          {errors.email && (
            <p className='text-sm text-danger-600'>{errors.email.message}</p>
          )}
          {!user.emailVerified && (
            <p className='text-xs text-default-400'>
              Verify your email before changing it
            </p>
          )}

          <div>
            <label className='mb-1 block text-sm font-medium' htmlFor='preferredUnits'>
              Preferred Units
            </label>
            <select
              id='preferredUnits'
              className='w-full rounded border border-default-300 bg-transparent p-2 text-sm'
              {...register('preferredUnits')}
            >
              <option value='METRIC'>Metric (kg, cm)</option>
              <option value='IMPERIAL'>Imperial (lbs, in)</option>
            </select>
            {errors.preferredUnits && (
              <p className='mt-1 text-sm text-danger-600'>{errors.preferredUnits.message}</p>
            )}
          </div>
        </div>

        <Button type='submit' color='primary' isLoading={isSubmitting}>
          Save Settings
        </Button>
      </form>
    </Card>
  );
}
