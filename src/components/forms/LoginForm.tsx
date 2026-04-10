'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';

const loginSchema = z.object({ email: z.email(), password: z.string().min(1) });
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm(): ReactNode {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        redirect: 'manual',
      });
      if (res.ok || res.status === 302) {
        window.location.href = '/';
      } else {
        setServerError('Invalid email or password.');
      }
    } catch {
      setServerError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input label="Email" type="email" placeholder="your@email.com" {...register('email')} />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Input label="Password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <div className="text-right">
        <Link className="text-sm text-primary hover:underline" href="/forgot-password">Forgot Password?</Link>
      </div>
      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
