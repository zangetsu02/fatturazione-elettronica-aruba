import { HttpClient, type HttpClientOptions } from './http/client.js';
import { AuthClient, type AuthClientOptions } from './auth/auth-client.js';
import type { Environment, TokenStorage } from './types/index.js';

export interface ArubaClientOptions {
  environment: Environment;
  timeout?: number;
  maxRetries?: number;
  tokenStorage?: TokenStorage;
  autoRefresh?: boolean;
  refreshMargin?: number;
}

export class ArubaClient {
  public readonly http: HttpClient;
  public readonly auth: AuthClient;

  constructor(options: ArubaClientOptions) {
    const httpOptions: HttpClientOptions = {
      environment: options.environment,
      timeout: options.timeout,
      maxRetries: options.maxRetries,
    };

    this.http = new HttpClient(httpOptions);

    const authOptions: AuthClientOptions = {
      httpClient: this.http,
      tokenStorage: options.tokenStorage,
      autoRefresh: options.autoRefresh,
      refreshMargin: options.refreshMargin,
    };

    this.auth = new AuthClient(authOptions);
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
}
