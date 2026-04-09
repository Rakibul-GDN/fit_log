'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';

/**
 * Email verification page — validates token and shows success/error.
 */
export default function VerifyEmailPage(): React.ReactElement {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailSkeleton(): React.ReactElement {
  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border border-default-200 bg-card p-8 text-center shadow-lg'>
        <div className='flex justify-center'>
          <LoadingSpinner />
        </div>
        <h2 className='mt-4 text-xl font-semibold'>Loading...</h2>
      </div>
    </div>
  );
}

function VerifyEmailContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const verifyEmail = useCallback(async (t: string): Promise<void> => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t }),
      });

      const data = (await res.json()) as {
        success: boolean;
        data?: { message?: string };
        error?: { message?: string };
      };

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.data?.message ?? 'Email verified successfully.');
      } else {
        setStatus('error');
        setMessage(data.error?.message ?? 'Verification failed.');
      }
    } catch {
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  }, []);

  useEffect(() => {
    if (token) {
      void verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token, verifyEmail]);

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border border-default-200 bg-card p-8 text-center shadow-lg'>
        {status === 'loading' && (
          <>
            <div className='flex justify-center'>
              <LoadingSpinner />
            </div>
            <h2 className='mt-4 text-xl font-semibold'>Verifying your email...</h2>
            <p className='mt-2 text-sm text-default-500'>
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100'>
              <span className='text-3xl text-success-600'>✓</span>
            </div>
            <h2 className='mt-4 text-xl font-semibold text-success-700'>
              Email Verified!
            </h2>
            <p className='mt-2 text-sm text-default-500'>{message}</p>
            <a
              className='mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
              href='/login'
            >
              Go to Login
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-100'>
              <span className='text-3xl text-danger-600'>✕</span>
            </div>
            <h2 className='mt-4 text-xl font-semibold text-danger-700'>
              Verification Failed
            </h2>
            <p className='mt-2 text-sm text-default-500'>{message}</p>
            <a
              className='mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
              href='/register'
            >
              Back to Registration
            </a>
          </>
        )}
      </div>
    </div>
  );
}
