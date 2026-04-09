'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Header navigation item.
 */
export interface NavItem {
  label: string;
  href: string;
}

/**
 * Header component with navigation links.
 */
export function Header({
  navItems = [],
  children,
}: {
  navItems?: NavItem[];
  children?: ReactNode;
}): ReactNode {
  return (
    <header className='sticky top-0 z-50 border-b border-default-200 bg-background/80 backdrop-blur-sm'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4'>
        <Link className='text-xl font-bold' href='/'>
          LogFit
        </Link>
        <nav className='flex items-center gap-4'>
          {navItems.map((item) => (
            <Link
              className='text-sm text-default-600 transition hover:text-foreground'
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          {children}
        </nav>
      </div>
    </header>
  );
}
