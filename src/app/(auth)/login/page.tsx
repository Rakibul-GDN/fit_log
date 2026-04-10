'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoginForm } from '@/components/forms/LoginForm';
import Link from 'next/link';

export default function LoginPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue</p>
        <div className="mt-6"><LoginForm /></div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link className="text-primary hover:underline" href="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
