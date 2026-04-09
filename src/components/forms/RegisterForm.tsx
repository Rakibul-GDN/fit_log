'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required.').max(100),
    email: z.email(),
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

type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Registration form with validation and API submission.
 */
export function RegisterForm(): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    setServerError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = (await res.json()) as {
        success: boolean;
        data?: { message?: string; emailSent?: boolean };
        error?: { message?: string };
      };

      if (!res.ok || !result.success) {
        setServerError(result.error?.message ?? 'Registration failed.');
        return;
      }

      // Store email for resend verification
      sessionStorage.setItem('pendingVerificationEmail', data.email);

      // If email failed to send, show warning but still proceed
      if (!result.data?.emailSent) {
        setServerError(
          'Account created but verification email could not be sent. You can try resending from the login page.',
        );
      }

      setSuccess(result.data?.message ?? 'Registration successful!');
      setRegisteredEmail(data.email);
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  if (success) {
    return (
      <div className='rounded-lg border border-success-200 bg-success-50 p-6 text-center'>
        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100'>
          <span className='text-2xl text-success-600'>✓</span>
        </div>
        <h3 className='text-lg font-semibold text-success-700'>Check Your Email</h3>
        <p className='mt-2 text-sm text-default-600'>{success}</p>
        {registeredEmail && (
          <p className='mt-1 text-sm text-default-500'>
            We sent a verification link to <strong>{registeredEmail}</strong>.
          </p>
        )}
        <a
          className='mt-4 inline-block text-sm text-primary hover:underline'
          href='/login'
        >
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
      <Input
        
        label='Name (optional)'
        placeholder='John Doe'
        {...register('name')}
      />
      {errors.name && (
        <p className='text-sm text-danger-600'>{errors.name.message}</p>
      )}

      <Input
        
        label='Email'
        type='email'
        {...register('email')}
      />
      {errors.email && (
        <p className='text-sm text-danger-600'>{errors.email.message}</p>
      )}

      <Input
        
        label='Password'
        type='password'
        {...register('password')}
      />
      {errors.password && (
        <p className='text-sm text-danger-600'>{errors.password.message}</p>
      )}

      <Input
        
        label='Confirm Password'
        type='password'
        {...register('confirmPassword')}
      />
      {errors.confirmPassword && (
        <p className='text-sm text-danger-600'>
          {errors.confirmPassword.message}
        </p>
      )}

      {serverError && (
        <p className='text-sm text-danger-600'>{serverError}</p>
      )}

      <Button className='w-full' isLoading={isSubmitting} type='submit'>
        Create Account
      </Button>
    </form>
  );
}
