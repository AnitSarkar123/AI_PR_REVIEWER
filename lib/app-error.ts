export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number = 60) {
    super(`Rate limit exceeded. Try again in ${retryAfter} seconds.`, 'RATE_LIMIT', 429, {
      retryAfter,
    });
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, field ? { field } : undefined);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class PlanLimitError extends AppError {
  constructor(message: string = 'Plan limit reached') {
    super(message, 'PLAN_LIMIT', 403);
    this.name = 'PlanLimitError';
  }
}

export type ErrorResponse = {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type SuccessResponse<T = unknown> = {
  success: true;
  data: T;
};

export type ActionResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

export function toSuccessResponse<T>(data: T): SuccessResponse<T> {
  return { success: true, data };
}
