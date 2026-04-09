'use client';

import type { ReactNode } from 'react';

/**
 * Toast notification props.
 */
export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
}

/**
 * Toast notification component.
 */
export function Toast({
  message,
  type = 'info',
  onClose,
}: ToastProps): ReactNode {
  const colorMap = {
    success: 'bg-success-50 text-success-700',
    error: 'bg-danger-50 text-danger-700',
    info: 'bg-primary-50 text-primary-700',
    warning: 'bg-warning-50 text-warning-700',
  };

  return (
    <div
      className={`rounded-lg p-4 shadow-md ${colorMap[type]}`}
      role='alert'
    >
      <div className='flex items-center justify-between gap-4'>
        <span className='text-sm'>{message}</span>
        {onClose && (
          <button
            className='ml-auto text-lg leading-none opacity-60 hover:opacity-100'
            onClick={onClose}
            type='button'
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
