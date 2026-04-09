'use client';

import { RegisterForm } from '@/components/forms/RegisterForm';
import Link from 'next/link';

/**
 * Registration page — displays registration form.
 */
export default function RegisterPage(): React.ReactElement {
  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-md rounded-lg border border-default-200 bg-card p-8 shadow-lg'>
        <div className='mb-6 text-center'>
          <h1 className='text-2xl font-bold'>Create Account</h1>
          <p className='mt-1 text-sm text-default-500'>
            Start tracking your workouts today
          </p>
        </div>

        <RegisterForm />

        <p className='mt-6 text-center text-sm text-default-500'>
          Already have an account?{' '}
          <Link className='font-medium text-primary hover:underline' href='/login'>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
