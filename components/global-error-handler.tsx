'use client';

import { useEffect } from 'react';

export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const message = error instanceof Error ? error.message : 'Unhandled promise rejection';
      console.error('[GlobalErrorHandler] Unhandled rejection:', message, error);
    };

    const errorHandler = (event: ErrorEvent) => {
      console.error('[GlobalErrorHandler] Uncaught error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    };

    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    window.addEventListener('error', errorHandler);

    return () => {
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  return <>{children}</>;
}
