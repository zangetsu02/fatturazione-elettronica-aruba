import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RetryHandler, defaultRetryConfig } from '../retry-handler.js';
import { RateLimitError } from '../../types/index.js';

describe('RetryHandler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute operation successfully on first try', async () => {
    const handler = new RetryHandler();
    const operation = vi.fn().mockResolvedValue('success');

    const result = await handler.execute(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on RateLimitError', async () => {
    const handler = new RetryHandler({ maxRetries: 2 });
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new RateLimitError('Rate limited'))
      .mockResolvedValue('success');

    const executePromise = handler.execute(operation);

    // First attempt fails
    await vi.advanceTimersByTimeAsync(0);
    // Wait for retry delay
    await vi.advanceTimersByTimeAsync(defaultRetryConfig.baseDelay);

    const result = await executePromise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should throw after max retries exceeded', async () => {
    vi.useRealTimers(); // Use real timers for this test to avoid unhandled rejection
    
    const handler = new RetryHandler({ maxRetries: 2, baseDelay: 1 }); // Very short delay
    const error = new RateLimitError('Rate limited');
    const operation = vi.fn().mockRejectedValue(error);

    await expect(handler.execute(operation)).rejects.toThrow(RateLimitError);
    expect(operation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    
    vi.useFakeTimers(); // Restore fake timers for other tests
  });

  it('should not retry for non-retryable errors', async () => {
    const handler = new RetryHandler();
    const error = new Error('Non-retryable error');
    const operation = vi.fn().mockRejectedValue(error);

    await expect(handler.execute(operation)).rejects.toThrow('Non-retryable error');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should use custom retry delay from getRetryDelay', async () => {
    const handler = new RetryHandler({ maxRetries: 1 });
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new RateLimitError('Rate limited', 5))
      .mockResolvedValue('success');

    const getRetryDelay = vi.fn().mockReturnValue(5000);
    const executePromise = handler.execute(operation, getRetryDelay);

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(5000);

    const result = await executePromise;

    expect(result).toBe('success');
    expect(getRetryDelay).toHaveBeenCalled();
  });

  it('should use exponential backoff', async () => {
    const handler = new RetryHandler({
      maxRetries: 3,
      baseDelay: 100,
      backoffMultiplier: 2,
    });
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new RateLimitError('Rate limited'))
      .mockRejectedValueOnce(new RateLimitError('Rate limited'))
      .mockResolvedValue('success');

    const executePromise = handler.execute(operation);

    // First retry: 100ms
    await vi.advanceTimersByTimeAsync(100);
    // Second retry: 200ms (100 * 2^1)
    await vi.advanceTimersByTimeAsync(200);

    const result = await executePromise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should allow custom retryOn function', async () => {
    const customError = new Error('Custom error');
    const handler = new RetryHandler({
      maxRetries: 1,
      retryOn: (error) => error.message === 'Custom error',
    });
    const operation = vi
      .fn()
      .mockRejectedValueOnce(customError)
      .mockResolvedValue('success');

    const executePromise = handler.execute(operation);

    await vi.advanceTimersByTimeAsync(defaultRetryConfig.baseDelay);

    const result = await executePromise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
