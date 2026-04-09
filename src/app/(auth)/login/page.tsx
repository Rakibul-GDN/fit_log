'use client';

import { LoginForm } from '@/components/forms/LoginForm';
import Link from 'next/link';
import { Suspense } from 'react';

/**
 * Login page — displays login form with link to register.
 */
export default function LoginPage(): React.ReactElement {
  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border border-default-200 bg-card p-8 shadow-lg'>
        <div className='mb-6 text-center'>
          <h1 className='text-2xl font-bold'>Welcome Back</h1>
          <p className='mt-1 text-sm text-default-500'>
            Sign in to your LogFit account
          </p>
        </div>

        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <p className='mt-6 text-center text-sm text-default-500'>
          Don&apos;t have an account?{' '}
          <Link className='font-medium text-primary hover:underline' href='/register'>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFormFallback(): React.ReactElement {
  return <div>Loading login form...</div>;
}
