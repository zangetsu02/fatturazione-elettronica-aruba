import {
  type Environment,
  ENVIRONMENT_URLS,
  ArubaApiError,
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
  /**
   * Salta l'interceptor di autenticazione e il retry reattivo sul 401.
   * Usato dalle chiamate di auth (signin/refresh) per evitare ricorsione.
   */
  skipAuth?: boolean;
}

/** Eseguito prima di ogni richiesta (non-auth) per garantire un token valido. */
export type RequestInterceptor = () => Promise<void>;
/** Eseguito su un 401: deve ri-autenticare e ritornare `true` se è possibile ritentare. */
export type UnauthorizedHandler = () => Promise<boolean>;

export { type BaseUrlType } from './request-builder.js';

export class HttpClient {
  private readonly requestBuilder: RequestBuilder;
  private readonly fetchClient: FetchClient;
  private readonly responseHandler: ResponseHandler;
  private readonly retryHandler: RetryHandler;
  private readonly defaultTimeout: number;
  private readonly logger: Logger;
  private requestInterceptor: RequestInterceptor | null = null;
  private onUnauthorized: UnauthorizedHandler | null = null;

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

  /** Registra l'hook che garantisce un token valido prima di ogni richiesta. */
  setRequestInterceptor(interceptor: RequestInterceptor | null): void {
    this.requestInterceptor = interceptor;
  }

  /** Registra l'hook di ri-autenticazione invocato su risposta 401. */
  setOnUnauthorized(handler: UnauthorizedHandler | null): void {
    this.onUnauthorized = handler;
  }

  async get<T>(
    baseType: BaseUrlType,
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(
      () =>
        this.requestBuilder.build({
          method: 'GET',
          baseType,
          path,
          params,
          headers: options?.headers,
        }),
      options
    );
  }

  async post<T>(
    baseType: BaseUrlType,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(
      () =>
        this.requestBuilder.build({
          method: 'POST',
          baseType,
          path,
          body,
          headers: options?.headers,
        }),
      options
    );
  }

  async postForm<T>(
    baseType: BaseUrlType,
    path: string,
    data: Record<string, string>,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(
      () => this.requestBuilder.buildFormRequest(baseType, path, data),
      options
    );
  }

  /**
   * Pipeline di autenticazione attorno a una richiesta:
   *  1. interceptor pre-richiesta (garantisce un token valido prima di costruire gli header)
   *  2. su 401, ri-autentica e ritenta UNA volta (gestisce token scaduto/clock skew)
   *
   * Il request viene ricostruito a ogni tentativo (`buildFn`) così l'header
   * Authorization riflette sempre il token aggiornato. Le richieste `skipAuth`
   * (signin/refresh) bypassano la pipeline per evitare ricorsione.
   */
  private async request<T>(
    buildFn: () => { url: string; init: RequestInit },
    options?: RequestOptions
  ): Promise<T> {
    if (!options?.skipAuth && this.requestInterceptor) {
      await this.requestInterceptor();
    }

    try {
      const { url, init } = buildFn();
      return await this.execute<T>(url, init, options);
    } catch (error) {
      if (
        !options?.skipAuth &&
        this.onUnauthorized &&
        error instanceof ArubaApiError &&
        error.statusCode === 401
      ) {
        const recovered = await this.onUnauthorized();
        if (recovered) {
          const { url, init } = buildFn();
          return this.execute<T>(url, init, options);
        }
      }
      throw error;
    }
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
