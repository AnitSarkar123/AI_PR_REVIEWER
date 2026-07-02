export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        baseDelayMs?: number;
        maxDelayMs?: number;
        shouldRetry?: (error: unknown) => boolean;
    } = {}
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

            const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
            const jitter = Math.random() * 200;

            await new Promise((resolve) => setTimeout(resolve, delay + jitter));
        }
    }

    throw lastError;
}

export function isRateLimitError(error: unknown): boolean {
    if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status: number }).status;
        return status === 429 || status === 403;
    }
    return false;
}
