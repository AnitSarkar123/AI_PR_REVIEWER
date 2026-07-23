import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { AuthError, toErrorResponse, toSuccessResponse, type ActionResponse } from './app-error';

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export async function requireSession(): Promise<SessionUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new AuthError();
  }
  return {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
  };
}

export async function safeAction<T>(fn: () => Promise<T>): Promise<ActionResponse<T>> {
  try {
    const result = await fn();
    return toSuccessResponse(result);
  } catch (error) {
    console.error(
      `[Action Error] ${error instanceof Error ? error.message : 'Unknown error'}`,
      error,
    );
    return toErrorResponse(error);
  }
}
