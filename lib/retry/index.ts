import { RetryOptions, delay, calculateBackoff } from './backoff';

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 10000,
  factor: 2,
};

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === opts.retries) break;

      const waitTime = calculateBackoff(attempt, opts);
      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${waitTime}ms...`, error);
      await delay(waitTime);
    }
  }

  throw lastError;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delayTime = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const jitter = Math.random() * 200;

      await delay(delayTime + jitter);
    }
  }

  throw lastError;
}

export function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status === 429 || status === 403;
  }
  return false;
}
