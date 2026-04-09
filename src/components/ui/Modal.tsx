'use client';

import type { ReactNode } from 'react';

/**
 * Modal component — simple controlled overlay.
 * Accepts `isOpen`/`onClose` props for convenience.
 */
export function Modal({
  children,
  isOpen = false,
  onClose,
  title,
}: {
  children: ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
}): ReactNode {
  if (!isOpen) return null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={title}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'
      onClick={onClose}
    >
      <div
        className='mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className='mb-4 text-lg font-semibold'>{title}</h2>}
        <div>{children}</div>
        <button
          className='absolute right-4 top-4 text-default-400 hover:text-foreground'
          onClick={onClose}
          type='button'
          aria-label='Close modal'
        >
          ×
        </button>
      </div>
    </div>
  );
}
