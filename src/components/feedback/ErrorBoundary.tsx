'use client';

import type { ErrorInfo, ReactNode } from 'react';
import { Component as ReactComponent } from 'react';

/**
 * Error boundary props.
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error boundary state.
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary wrapper to catch rendering errors in child components.
 */
export class ErrorBoundary extends ReactComponent<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const error = this.state.error ?? new Error('Unknown error');
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(error, this.reset);
      }
      return (
        this.props.fallback ?? (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm mt-1">{this.state.error?.message}</p>
            <button
              className="mt-2 px-3 py-1 text-sm bg-destructive/20 rounded hover:bg-destructive/30"
              onClick={this.reset}
              type="button"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
