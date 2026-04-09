'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Button } from '@/components/ui/Button';

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
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');

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

  const handleResend = useCallback(async (): Promise<void> => {
    setResendStatus('sending');
    setResendMessage('');
    try {
      const email = sessionStorage.getItem('pendingVerificationEmail');
      if (!email) {
        setResendStatus('error');
        setResendMessage('No email available. Please register again.');
        return;
      }
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (res.ok && data.success) {
        setResendStatus('sent');
        setResendMessage('Verification email resent. Check your inbox.');
      } else {
        setResendStatus('error');
        setResendMessage(data.error?.message ?? 'Failed to resend.');
      }
    } catch {
      setResendStatus('error');
      setResendMessage('An unexpected error occurred.');
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
            <div className='mt-4 space-y-3'>
              <a
                className='inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                href='/register'
              >
                Back to Registration
              </a>
              <div className='border-t border-default-200 pt-3'>
                <p className='mb-2 text-sm text-default-500'>
                  Didn't receive a verification email?
                </p>
                <Button
                  isLoading={resendStatus === 'sending'}
                  isDisabled={resendStatus === 'sent'}
                  onPress={() => void handleResend()}
                  size='sm'
                >
                  Resend Verification Email
                </Button>
                {resendMessage && (
                  <p
                    className={`mt-1 text-xs ${
                      resendStatus === 'error'
                        ? 'text-danger-600'
                        : 'text-success-600'
                    }`}
                  >
                    {resendMessage}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
