'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, type ReactNode } from 'react';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100).optional(),
  email: z.email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match.', path: ['confirmPassword'] });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm(): ReactNode {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      const result = (await res.json()) as { success: boolean; data?: { emailSent?: boolean }; error?: { message?: string } };
      if (!res.ok || !result.success) {
        setServerError(result.error?.message ?? 'Registration failed.');
        return;
      }
      sessionStorage.setItem('pendingVerificationEmail', data.email);
      if (!result.data?.emailSent) {
        setServerError('Account created but verification email could not be sent.');
      }
      setSuccess('Account created! Check your email for a verification link.');
    } catch {
      setServerError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-2xl text-emerald-600">✓</span>
        </div>
        <h3 className="text-lg font-semibold text-emerald-700">Check Your Email</h3>
        <p className="mt-2 text-sm text-muted-foreground">{success}</p>
        <p className="mt-1 text-sm text-muted-foreground">The link expires in 24 hours.</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input label="Name (optional)" placeholder="Your name" {...register('name')} />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div>
        <Input label="Email" type="email" placeholder="your@email.com" {...register('email')} />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Input label="Password" type="password" placeholder="Min. 8 chars, uppercase, number" {...register('password')} />
        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div>
        <Input label="Confirm Password" type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
