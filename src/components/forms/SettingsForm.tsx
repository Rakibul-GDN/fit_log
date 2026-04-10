'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/types/entities';

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

export function SettingsForm({ user, onSubmit, isSubmitting = false }: SettingsFormProps): React.ReactElement {
  const { register, handleSubmit, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: { name: user.name ?? '', email: user.email, preferredUnits: user.preferredUnits },
  });

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-4">
        <h3 className="text-lg font-semibold">Account Settings</h3>
      </div>
      <div className="border-t border-border" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div>
          <Input label="Name" placeholder="Your name" {...register('name')} />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Input label="Email" type="email" placeholder="your@email.com" {...register('email')} disabled={!user.emailVerified} />
          {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
          {!user.emailVerified && <p className="mt-1 text-xs text-muted-foreground">Verify your email before changing it</p>}
        </div>
        <div>
          <Label htmlFor="preferredUnits">Preferred Units</Label>
          <select id="preferredUnits" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('preferredUnits')}>
            <option value="METRIC">Metric (kg, cm)</option>
            <option value="IMPERIAL">Imperial (lbs, in)</option>
          </select>
          {errors.preferredUnits && <p className="mt-1 text-sm text-destructive">{errors.preferredUnits.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  );
}
