'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Header navigation item.
 */
export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

/**
 * Header component with navigation links, user menu, and sign-out button.
 */
export function Header({
  navItems = [],
  children,
}: {
  navItems?: NavItem[];
  children?: ReactNode;
}): ReactNode {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 border-b border-default-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4'>
        {/* Brand */}
        <Link className='flex items-center gap-2 text-xl font-bold text-primary' href='/'>
          <span className='text-2xl'>🏋️</span>
          <span>LogFit</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden items-center gap-1 md:flex'>
          {navItems.map((item) => (
            <Link
              className='flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-default-600 transition-colors hover:bg-default-100 hover:text-foreground'
              href={item.href}
              key={item.href}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className='relative'>
          <button
            className='flex items-center gap-2 rounded-full p-1.5 transition-colors hover:bg-default-100'
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
            type='button'
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground'>
              U
            </div>
          </button>

          {userMenuOpen && (
            <div className='absolute right-0 top-full mt-2 w-48 rounded-lg border border-default-200 bg-card py-1 shadow-lg'>
              <div className='border-b border-default-200 px-3 py-2'>
                <p className='text-sm font-medium'>Account</p>
                <p className='text-xs text-default-500'>Manage your settings</p>
              </div>
              <Link
                className='block px-3 py-2 text-sm text-default-600 transition-colors hover:bg-default-100'
                href='/settings'
                onClick={() => setUserMenuOpen(false)}
              >
                ⚙️ Settings
              </Link>
              <div className='border-t border-default-200'>
                <button
                  className='w-full px-3 py-2 text-left text-sm text-danger-600 transition-colors hover:bg-danger-50'
                  onClick={() => {
                    void signOut({ callbackUrl: '/login' });
                  }}
                  type='button'
                >
                  🚪 Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

        {children}
      </div>
    </header>
  );
}
