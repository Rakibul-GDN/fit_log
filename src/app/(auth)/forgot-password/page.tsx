'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

/** Forgot password page — request password reset email */
export default function ForgotPasswordPage(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      if (!email) return;

      setStatus('sending');
      setMessage('');

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = (await res.json()) as {
          success: boolean;
          data?: { message?: string };
          error?: { message?: string };
        };

        if (res.ok && data.success) {
          setStatus('sent');
          setMessage(data.data?.message ?? 'Check your email for a reset link.');
        } else {
          setStatus('error');
          setMessage(data.error?.message ?? 'Failed to send reset email.');
        }
      } catch {
        setStatus('error');
        setMessage('An unexpected error occurred.');
      }
    },
    [email],
  );

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border border-default-200 bg-card p-8 shadow-lg'>
        <h1 className='text-2xl font-bold'>Forgot Password</h1>
        <p className='mt-2 text-sm text-default-500'>
          Enter your email and we'll send you a password reset link.
        </p>

        {status === 'sent' ? (
          <div className='mt-6 space-y-4'>
            <div className='rounded border border-success-200 bg-success-50 p-3 text-sm text-success-700'>
              {message}
            </div>
            <Link className='text-sm text-primary hover:underline' href='/login'>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
            <Input
              label='Email'
              type='email'
              placeholder='your@email.com'
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />

            {status === 'error' && (
              <p className='text-sm text-danger-600'>{message}</p>
            )}

            <Button type='submit' isLoading={status === 'sending'} className='w-full'>
              Send Reset Link
            </Button>

            <Link className='text-sm text-primary hover:underline' href='/login'>
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
