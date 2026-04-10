'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useState } from 'react';
import Link from 'next/link';

const forgotSchema = z.object({ email: z.email() });
const resetSchema = z.object({ password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/), confirmPassword: z.string() }).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match.', path: ['confirmPassword'] });

type ForgotValues = z.infer<typeof forgotSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage(): React.ReactElement {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const token = searchParams.get('token');

  if (token) return <ResetPasswordForm token={token} />;
  return <ForgotPasswordForm />;
}

function ForgotPasswordForm(): React.ReactElement {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = useCallback(async (data: ForgotValues): Promise<void> => {
    setStatus('sending');
    try {
      const res = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = (await res.json()) as { success: boolean; data?: { message?: string }; error?: { message?: string } };
      if (res.ok && result.success) { setStatus('sent'); setMessage(result.data?.message ?? 'Check your email.'); }
      else { setStatus('error'); setMessage(result.error?.message ?? 'Failed.'); }
    } catch { setStatus('error'); setMessage('An unexpected error occurred.'); }
  }, []);

  if (status === 'sent') return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="rounded border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100"><span className="text-2xl text-emerald-600">✓</span></div>
          <h2 className="text-xl font-semibold text-emerald-700">Check Your Email</h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <Link className="mt-4 inline-block text-sm text-primary hover:underline" href="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          {status === 'error' && <p className="text-sm text-destructive">{message}</p>}
          <Button type="submit" disabled={status === 'sending'} className="w-full">{status === 'sending' ? 'Sending...' : 'Send Reset Link'}</Button>
          <Link className="text-sm text-primary hover:underline" href="/login">← Back to Login</Link>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordForm({ token }: { token: string }): React.ReactElement {
  const { register, handleSubmit, formState: { errors } } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = useCallback(async (data: ResetValues): Promise<void> => {
    setIsSubmitting(true); setServerError(null);
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: data.password }) });
      const result = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (!res.ok || !result.success) { setServerError(result.error?.message ?? 'Failed.'); return; }
      setSuccess('Password reset successfully. You can now log in.');
    } catch { setServerError('An unexpected error occurred.'); }
    finally { setIsSubmitting(false); }
  }, [token]);

  if (success) return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100"><span className="text-2xl text-emerald-600">✓</span></div>
        <h2 className="text-xl font-semibold text-emerald-700">Password Reset</h2>
        <p className="mt-2 text-sm text-muted-foreground">{success}</p>
        <Link className="mt-4 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" href="/login">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your new password.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="New Password" type="password" {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          <Input label="Confirm Password" type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Resetting...' : 'Reset Password'}</Button>
          <Link className="text-sm text-primary hover:underline" href="/login">← Back to Login</Link>
        </form>
      </div>
    </div>
  );
}
