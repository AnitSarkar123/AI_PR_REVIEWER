import { describe, test, expect } from 'vitest';
import {
  AppError,
  AuthError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  PlanLimitError,
  toErrorResponse,
  toSuccessResponse
} from './app-error';

describe('AppError classes', () => {
  test('AppError instantiates with correct defaults', () => {
    const error = new AppError('Something went wrong');
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('AppError');
    expect(error.details).toBeUndefined();
  });

  test('AppError instantiates with custom values', () => {
    const error = new AppError('Custom error', 'CUSTOM_CODE', 418, { teapot: true });
    expect(error.message).toBe('Custom error');
    expect(error.code).toBe('CUSTOM_CODE');
    expect(error.statusCode).toBe(418);
    expect(error.details).toEqual({ teapot: true });
  });

  test('AuthError has correct properties', () => {
    const error = new AuthError();
    expect(error.message).toBe('Authentication required');
    expect(error.code).toBe('UNAUTHORIZED');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('AuthError');
  });

  test('NotFoundError has correct properties', () => {
    const error = new NotFoundError('User');
    expect(error.message).toBe('User not found');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
  });

  test('RateLimitError includes retryAfter in details', () => {
    const error = new RateLimitError(120);
    expect(error.message).toContain('120 seconds');
    expect(error.code).toBe('RATE_LIMIT');
    expect(error.statusCode).toBe(429);
    expect(error.details).toEqual({ retryAfter: 120 });
  });

  test('ValidationError includes field in details', () => {
    const error = new ValidationError('Invalid email', 'email');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: 'email' });
  });

  test('PlanLimitError has correct properties', () => {
    const error = new PlanLimitError();
    expect(error.code).toBe('PLAN_LIMIT');
    expect(error.statusCode).toBe(403);
  });
});

describe('Response formatters', () => {
  test('toSuccessResponse formats correctly', () => {
    const response = toSuccessResponse({ id: 1, name: 'Test' });
    expect(response).toEqual({
      success: true,
      data: { id: 1, name: 'Test' }
    });
  });

  test('toErrorResponse formats AppError correctly', () => {
    const appError = new ValidationError('Bad input', 'username');
    const response = toErrorResponse(appError);
    expect(response).toEqual({
      success: false,
      error: 'Bad input',
      code: 'VALIDATION_ERROR',
      details: { field: 'username' }
    });
  });

  test('toErrorResponse formats standard Error correctly', () => {
    const standardError = new Error('Standard failure');
    const response = toErrorResponse(standardError);
    expect(response).toEqual({
      success: false,
      error: 'Standard failure',
      code: 'UNKNOWN_ERROR'
    });
  });

  test('toErrorResponse formats unknown objects correctly', () => {
    const response = toErrorResponse('just a string');
    expect(response).toEqual({
      success: false,
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    });
  });
});
