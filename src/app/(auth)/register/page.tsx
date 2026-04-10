'use client';

import { RegisterForm } from '@/components/forms/RegisterForm';
import { AuthCard } from '@/components/layout/AuthCard';
import Link from 'next/link';

export default function RegisterPage(): React.ReactElement {
  return (
    <AuthCard title="Create account" description="Register to start tracking your workouts and progress">
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link className="font-medium text-primary hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
