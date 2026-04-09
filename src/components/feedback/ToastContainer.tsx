'use client';

import { useUiStore } from '@/store/uiStore';
import { Toast } from '@/components/ui/Toast';

/** Toast container rendered at root level — displays all active toasts. */
export function ToastContainer(): React.ReactElement {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  return (
    <div className='fixed right-4 top-4 z-50 flex flex-col gap-2'>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
