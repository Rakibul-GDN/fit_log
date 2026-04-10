'use client';

import { LoginForm } from '@/components/forms/LoginForm';
import { AuthCard } from '@/components/layout/AuthCard';
import Link from 'next/link';

export default function LoginPage(): React.ReactElement {
  return (
    <AuthCard title="Welcome back" description="Enter your credentials to sign in to your account">
      <LoginForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link className="font-medium text-primary hover:underline" href="/register">
          Create one
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        <Link className="font-medium text-primary hover:underline" href="/forgot-password">
          Forgot your password?
        </Link>
      </p>
    </AuthCard>
  );
}
