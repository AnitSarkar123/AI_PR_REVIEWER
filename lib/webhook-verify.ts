import { createHmac, timingSafeEqual } from 'node:crypto';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

export function verifyWebhookSignature(
  payload: string,
  signatureHeader: string | null
): boolean {
  if (!WEBHOOK_SECRET) {
    return false;
  }

  if (!signatureHeader) {
    return false;
  }

  const sig = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice(7)
    : signatureHeader;

  const expected = createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  try {
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const sigBuffer = Buffer.from(sig, 'utf8');

    if (expectedBuffer.length !== sigBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, sigBuffer);
  } catch {
    return false;
  }
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipRequestCounts = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = ipRequestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

interface WebhookPayload {
  action?: string;
  number?: number;
  repository?: {
    owner: { login: string };
    name: string;
  };
}

export function validateWebhookPayload(body: unknown): body is WebhookPayload {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.action !== 'string') {
    return false;
  }

  if (typeof payload.number !== 'number') {
    return false;
  }

  if (!payload.repository || typeof payload.repository !== 'object') {
    return false;
  }

  const repo = payload.repository as Record<string, unknown>;

  if (!repo.owner || typeof repo.owner !== 'object') {
    return false;
  }

  const owner = repo.owner as Record<string, unknown>;

  if (typeof owner.login !== 'string') {
    return false;
  }

  if (typeof repo.name !== 'string') {
    return false;
  }

  return true;
}
