import { TimeoutError, NetworkError } from '../types/index.js';

export interface FetchOptions {
  timeout: number;
  signal?: AbortSignal;
}

export class FetchClient {
  async fetch(url: string, init: RequestInit, options: FetchOptions): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    const signal = options.signal
      ? this.combineSignals(options.signal, controller.signal)
      : controller.signal;

    try {
      return await fetch(url, { ...init, signal });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (options.signal?.aborted) {
            throw error;
          }
          throw new TimeoutError(`Request timeout after ${options.timeout}ms`);
        }
      }
      throw new NetworkError(error instanceof Error ? error.message : 'Network error');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private combineSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort());
    }

    return controller.signal;
  }
}
