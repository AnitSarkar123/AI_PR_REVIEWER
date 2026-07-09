"use client";

export function registerUnhandledRejectionHandler(): () => void {
  const handler = (event: PromiseRejectionEvent) => {
    const error = event.reason;
    const message =
      error instanceof Error ? error.message : "Unknown promise rejection";

    console.error("[UnhandledRejection]", message, error);
  };

  window.addEventListener("unhandledrejection", handler);
  return () => window.removeEventListener("unhandledrejection", handler);
}

export function registerGlobalErrorHandler(): () => void {
  const handler = (event: ErrorEvent) => {
    console.error("[GlobalError]", event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  };

  window.addEventListener("error", handler);
  return () => window.removeEventListener("error", handler);
}