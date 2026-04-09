'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Login form with validation and NextAuth credentials login.
 */
export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    setServerError(null);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError('Invalid email or password. Please try again.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
      <Input
        
        label='Email'
        type='email'
        {...register('email')}
      />
      {errors.email && (
        <p className='text-sm text-danger-600'>{errors.email.message}</p>
      )}

      <Input
        
        label='Password'
        type='password'
        {...register('password')}
      />
      {errors.password && (
        <p className='text-sm text-danger-600'>{errors.password.message}</p>
      )}

      {serverError && (
        <div className='text-sm text-danger-600'>
          <p>{serverError}</p>
          <p className='mt-1'>
            If you just registered, please check your email (including spam)
            to verify your account first.
          </p>
        </div>
      )}

      <div className='flex items-center justify-end'>
        <Link className='text-sm text-primary hover:underline' href='/reset-password'>
          Forgot Password?
        </Link>
      </div>

      <Button className='w-full' isLoading={isSubmitting} type='submit'>
        Sign In
      </Button>
    </form>
  );
}
