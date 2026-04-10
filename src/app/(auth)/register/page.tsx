'use client';

import { Button } from '@/components/ui/button';
import { RegisterForm } from '@/components/forms/RegisterForm';
import Link from 'next/link';

export default function RegisterPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Register to start tracking your workouts</p>
        <div className="mt-6"><RegisterForm /></div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link className="text-primary hover:underline" href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
