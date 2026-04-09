'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Sidebar item definition.
 */
export interface SidebarItem {
  label: string;
  href: string;
}

/**
 * Sidebar section definition.
 */
export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

/**
 * Sidebar component props.
 */
export interface SidebarProps {
  sections: SidebarSection[];
  defaultExpandedKeys?: string[];
}

/**
 * Sidebar component with collapsible sections.
 */
export function Sidebar({
  sections,
}: SidebarProps): ReactNode {
  return (
    <aside className='h-full border-r border-divider p-2'>
      {sections.map((section) => (
        <div className='mb-4' key={section.title}>
          <h3 className='px-3 py-2 text-xs font-semibold uppercase text-default-400'>
            {section.title}
          </h3>
          <nav className='flex flex-col gap-1'>
            {section.items.map((item) => (
              <Link
                className='rounded-md px-3 py-2 text-sm text-default-600 transition hover:bg-default-100 hover:text-foreground'
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ))}
    </aside>
  );
}
