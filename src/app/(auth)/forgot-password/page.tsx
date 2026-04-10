'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthCard } from '@/components/layout/AuthCard';
import Link from 'next/link';
import { useCallback, useState } from 'react';

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
    <AuthCard title="Forgot password" description="Enter your email and we'll send you a password reset link">
      {status === 'sent' ? (
        <div className="space-y-4">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </div>
          <Link className="text-sm font-medium text-primary hover:underline" href="/login">
            ← Back to Login
          </Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />

          {status === 'error' && (
            <p className="text-sm text-destructive">{message}</p>
          )}

          <Button type="submit" disabled={status === 'sending'} className="w-full">
            {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Link className="text-sm font-medium text-primary hover:underline" href="/login">
            ← Back to Login
          </Link>
        </form>
      )}
    </AuthCard>
  );
}
