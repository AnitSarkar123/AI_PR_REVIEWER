export interface RetryOptions {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const calculateBackoff = (attempt: number, options: Required<RetryOptions>): number => {
  const { minTimeout, maxTimeout, factor } = options;
  const timeout = minTimeout * Math.pow(factor, attempt);
  return Math.min(timeout, maxTimeout);
};
