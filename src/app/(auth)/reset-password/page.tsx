'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const forgotPasswordSchema = z.object({
  email: z.email(),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type ForgotFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Reset password page — handles both forgot password request and actual password reset.
 */
export default function ResetPasswordPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className='flex min-h-screen items-center justify-center'>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (token) {
    return (
      <div className='flex min-h-screen items-center justify-center px-4'>
        <div className='w-full max-w-md rounded-lg border border-default-200 bg-card p-8 shadow-lg'>
          <div className='mb-6 text-center'>
            <h1 className='text-2xl font-bold'>Set New Password</h1>
            <p className='mt-1 text-sm text-default-500'>
              Enter your new password below
            </p>
          </div>
          <ResetForm token={token} />
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border border-default-200 bg-card p-8 shadow-lg'>
        <div className='mb-6 text-center'>
          <h1 className='text-2xl font-bold'>Reset Password</h1>
          <p className='mt-1 text-sm text-default-500'>
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <ForgotPasswordForm />
        <p className='mt-6 text-center text-sm text-default-500'>
          <Link className='font-medium text-primary hover:underline' href='/login'>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Forgot password form */
function ForgotPasswordForm(): React.ReactElement {
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotFormValues): Promise<void> => {
    setServerError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = (await res.json()) as {
        success: boolean;
        data?: { message?: string };
        error?: { message?: string };
      };

      if (res.ok && result.success) {
        setSuccess(result.data?.message ?? 'Reset link sent if account exists.');
      } else {
        setServerError(result.error?.message ?? 'Request failed.');
      }
    } catch {
      setServerError('An unexpected error occurred.');
    }
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
      <Input label='Email' type='email' {...register('email')} />
      {errors.email && (
        <p className='text-sm text-danger-600'>{errors.email.message}</p>
      )}

      {serverError && <p className='text-sm text-danger-600'>{serverError}</p>}

      {success && <p className='text-sm text-success-600'>{success}</p>}

      <Button className='w-full' isLoading={isSubmitting} type='submit'>
        Send Reset Link
      </Button>
    </form>
  );
}

/** Reset password form (when token is present) */
function ResetForm({ token }: { token: string }): React.ReactElement {
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetFormValues): Promise<void> => {
    setServerError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = (await res.json()) as {
        success: boolean;
        data?: { message?: string };
        error?: { message?: string };
      };

      if (res.ok && result.success) {
        setSuccess(result.data?.message ?? 'Password reset successfully.');
      } else {
        setServerError(result.error?.message ?? 'Reset failed.');
      }
    } catch {
      setServerError('An unexpected error occurred.');
    }
  };

  if (success) {
    return (
      <div className='rounded-lg border border-success-200 bg-success-50 p-6 text-center'>
        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100'>
          <span className='text-2xl text-success-600'>✓</span>
        </div>
        <h2 className='text-xl font-semibold text-success-700'>
          Password Reset!
        </h2>
        <p className='mt-2 text-sm text-default-600'>{success}</p>
        <Link
          className='mt-4 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
          href='/login'
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
      <Input label='New Password' type='password' {...register('password')} />
      {errors.password && (
        <p className='text-sm text-danger-600'>{errors.password.message}</p>
      )}

      <Input label='Confirm New Password' type='password' {...register('confirmPassword')} />
      {errors.confirmPassword && (
        <p className='text-sm text-danger-600'>
          {errors.confirmPassword.message}
        </p>
      )}

      {serverError && <p className='text-sm text-danger-600'>{serverError}</p>}

      <Button className='w-full' isLoading={isSubmitting} type='submit'>
        Reset Password
      </Button>
    </form>
  );
}
