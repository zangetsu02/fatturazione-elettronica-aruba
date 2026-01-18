import { RateLimitError } from '../types/index.js';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  backoffMultiplier: number;
  retryOn: (error: Error) => boolean;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  backoffMultiplier: 2,
  retryOn: (error) => error instanceof RateLimitError,
};

export class RetryHandler {
  private readonly config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...defaultRetryConfig, ...config };
  }

  async execute<T>(
    operation: () => Promise<T>,
    getRetryDelay?: (error: Error) => number | undefined
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (!this.config.retryOn(lastError) || attempt === this.config.maxRetries) {
          throw lastError;
        }

        const delay = getRetryDelay?.(lastError) ?? this.calculateDelay(attempt);

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    return this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
