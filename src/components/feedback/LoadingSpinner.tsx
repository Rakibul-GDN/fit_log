import { Spinner } from '@heroui/react';
import type { SpinnerProps } from '@heroui/react';

/**
 * Loading spinner props extending HeroUI SpinnerProps.
 */
export interface LoadingSpinnerProps extends SpinnerProps {
  fullScreen?: boolean;
}

/**
 * Loading spinner component with optional full-screen overlay.
 */
export function LoadingSpinner({
  fullScreen = false,
  ...props
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <Spinner {...props} />
      </div>
    );
  }

  return <Spinner {...props} />;
}
