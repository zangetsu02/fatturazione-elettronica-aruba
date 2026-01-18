import {
  type Environment,
  ENVIRONMENT_URLS,
  RateLimitError,
  type Logger,
  ConsoleLogger,
} from '../types/index.js';
import { RequestBuilder, type BaseUrlType } from './request-builder.js';
import { FetchClient } from './fetch-client.js';
import { ResponseHandler } from './response-handler.js';
import { RetryHandler, type RetryConfig } from './retry-handler.js';

export interface HttpClientOptions {
  environment: Environment;
  timeout?: number;
  retry?: Partial<RetryConfig>;
  headers?: Record<string, string>;
  logger?: Logger;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  skipRetry?: boolean;
}

export { type BaseUrlType } from './request-builder.js';

export class HttpClient {
  private readonly requestBuilder: RequestBuilder;
  private readonly fetchClient: FetchClient;
  private readonly responseHandler: ResponseHandler;
  private readonly retryHandler: RetryHandler;
  private readonly defaultTimeout: number;
  private readonly logger: Logger;

  constructor(options: HttpClientOptions) {
    const config = ENVIRONMENT_URLS[options.environment];

    this.requestBuilder = new RequestBuilder(config, options.headers);
    this.fetchClient = new FetchClient();
    this.responseHandler = new ResponseHandler();
    this.retryHandler = new RetryHandler(options.retry);
    this.defaultTimeout = options.timeout ?? 30000;
    this.logger = options.logger ?? new ConsoleLogger();
  }

  setAccessToken(token: string | null): void {
    this.requestBuilder.setAccessToken(token);
  }

  getAccessToken(): string | null {
    return this.requestBuilder.getAccessToken();
  }

  async get<T>(
    baseType: BaseUrlType,
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<T> {
    const { url, init } = this.requestBuilder.build({
      method: 'GET',
      baseType,
      path,
      params,
      headers: options?.headers,
    });

    return this.execute<T>(url, init, options);
  }

  async post<T>(
    baseType: BaseUrlType,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const { url, init } = this.requestBuilder.build({
      method: 'POST',
      baseType,
      path,
      body,
      headers: options?.headers,
    });

    return this.execute<T>(url, init, options);
  }

  async postForm<T>(
    baseType: BaseUrlType,
    path: string,
    data: Record<string, string>,
    options?: RequestOptions
  ): Promise<T> {
    const { url, init } = this.requestBuilder.buildFormRequest(baseType, path, data);
    return this.execute<T>(url, init, options);
  }

  private async execute<T>(
    url: string,
    init: RequestInit,
    options?: RequestOptions
  ): Promise<T> {
    const timeout = options?.timeout ?? this.defaultTimeout;
    const signal = options?.signal;

    const operation = async () => {
      const response = await this.fetchClient.fetch(url, init, { timeout, signal });
      return this.responseHandler.handle<T>(response);
    };

    if (options?.skipRetry) {
      return operation();
    }

    return this.retryHandler.execute(operation, (error) => {
      if (error instanceof RateLimitError) {
        return error.retryAfter ? error.retryAfter * 1000 : undefined;
      }
      return undefined;
    });
  }
}
