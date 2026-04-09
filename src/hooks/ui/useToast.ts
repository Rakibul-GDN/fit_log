'use client';

import { useCallback } from 'react';
import { useUiStore } from '@/store/uiStore';

/**
 * Hook that returns toast helper functions.
 * Provides convenience wrappers over useUiStore.addToast.
 */
export function useToast() {
  const addToast = useUiStore((state) => state.addToast);

  const success = useCallback(
    (message: string) => {
      addToast({ message, type: 'success' });
    },
    [addToast],
  );

  const error = useCallback(
    (message: string) => {
      addToast({ message, type: 'error' });
    },
    [addToast],
  );

  const info = useCallback(
    (message: string) => {
      addToast({ message, type: 'info' });
    },
    [addToast],
  );

  const warning = useCallback(
    (message: string) => {
      addToast({ message, type: 'warning' });
    },
    [addToast],
  );

  return { success, error, info, warning };
}
