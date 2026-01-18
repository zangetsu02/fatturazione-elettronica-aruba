import type { EnvironmentConfig } from '../types/index.js';

export type BaseUrlType = 'auth' | 'ws';

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  baseType: BaseUrlType;
  path: string;
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
}

export class RequestBuilder {
  private readonly config: EnvironmentConfig;
  private readonly defaultHeaders: Record<string, string>;
  private accessToken: string | null = null;

  constructor(config: EnvironmentConfig, defaultHeaders: Record<string, string> = {}) {
    this.config = config;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...defaultHeaders,
    };
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  build(config: RequestConfig): { url: string; init: RequestInit } {
    const url = this.buildUrl(config);
    const headers = this.buildHeaders(config.headers);
    const body = this.buildBody(config.body, config.method);

    return {
      url,
      init: {
        method: config.method,
        headers,
        body,
      },
    };
  }

  buildFormRequest(
    baseType: BaseUrlType,
    path: string,
    data: Record<string, string>
  ): { url: string; init: RequestInit } {
    const baseUrl = this.getBaseUrl(baseType);

    return {
      url: `${baseUrl}${path}`,
      init: {
        method: 'POST',
        headers: {
          ...this.buildHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data).toString(),
      },
    };
  }

  private buildUrl(config: RequestConfig): string {
    const baseUrl = this.getBaseUrl(config.baseType);
    let url = `${baseUrl}${config.path}`;

    if (config.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(config.params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  private getBaseUrl(type: BaseUrlType): string {
    return type === 'auth' ? this.config.authUrl : this.config.wsUrl;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...this.defaultHeaders };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (extra) {
      Object.assign(headers, extra);
    }

    return headers;
  }

  private buildBody(body: unknown, method: string): string | undefined {
    if (!body || method === 'GET') {
      return undefined;
    }
    return JSON.stringify(body);
  }
}
