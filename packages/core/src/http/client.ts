import {
  type Environment,
  type EnvironmentConfig,
  ENVIRONMENT_URLS,
  ArubaApiError,
  RateLimitError,
  TimeoutError,
  NetworkError,
  type ApiErrorResponse,
} from '../types/index.js';

export interface HttpClientOptions {
  environment: Environment;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  skipRetry?: boolean;
}

export type BaseUrlType = 'auth' | 'ws';

export class HttpClient {
  private readonly config: EnvironmentConfig;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly defaultHeaders: Record<string, string>;
  private accessToken: string | null = null;

  constructor(options: HttpClientOptions) {
    this.config = ENVIRONMENT_URLS[options.environment];
    this.timeout = options.timeout ?? 30000;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private buildUrl(baseType: BaseUrlType, path: string): string {
    const baseUrl = baseType === 'auth' ? this.config.authUrl : this.config.wsUrl;
    return `${baseUrl}${path}`;
  }

  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timeout after ${timeout}ms`);
      }
      throw new NetworkError(error instanceof Error ? error.message : 'Network error');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json() as Promise<T>;
      }
      return response.text() as unknown as T;
    }

    let errorBody: ApiErrorResponse | null = null;
    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      // Non-JSON response
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(
        'Rate limit exceeded',
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    }

    if (errorBody) {
      throw ArubaApiError.fromResponse(errorBody, response.status);
    }

    throw new ArubaApiError(
      response.statusText || 'Request failed',
      'HTTP_ERROR',
      response.status
    );
  }

  private async executeWithRetry<T>(
    url: string,
    init: RequestInit,
    options?: RequestOptions,
    retryCount = 0
  ): Promise<T> {
    const timeout = options?.timeout ?? this.timeout;

    try {
      const response = await this.fetchWithTimeout(url, init, timeout);
      return await this.handleResponse<T>(response);
    } catch (error) {
      // Exponential backoff retry on rate limit
      if (
        error instanceof RateLimitError &&
        !options?.skipRetry &&
        retryCount < this.maxRetries
      ) {
        const delay = error.retryAfter
          ? error.retryAfter * 1000
          : this.retryDelay * Math.pow(2, retryCount);

        await this.sleep(delay);
        return this.executeWithRetry<T>(url, init, options, retryCount + 1);
      }
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get<T>(
    baseType: BaseUrlType,
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<T> {
    let url = this.buildUrl(baseType, path);

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.executeWithRetry<T>(
      url,
      { method: 'GET', headers: this.buildHeaders(options) },
      options
    );
  }

  async post<T>(
    baseType: BaseUrlType,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(baseType, path);

    return this.executeWithRetry<T>(
      url,
      {
        method: 'POST',
        headers: this.buildHeaders(options),
        body: body ? JSON.stringify(body) : undefined,
      },
      options
    );
  }

  async postForm<T>(
    baseType: BaseUrlType,
    path: string,
    data: Record<string, string>,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildUrl(baseType, path);
    const body = new URLSearchParams(data).toString();

    const headers = this.buildHeaders(options);
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    return this.executeWithRetry<T>(url, { method: 'POST', headers, body }, options);
  }
}
