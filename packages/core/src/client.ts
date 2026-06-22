import { HttpClient, type HttpClientOptions } from './http/client.js';
import { AuthClient, type AuthClientOptions } from './auth/auth-client.js';
import { type Environment, type TokenStorage, type Logger, ConsoleLogger } from './types/index.js';

export interface ArubaClientOptions {
  environment: Environment;
  timeout?: number;
  maxRetries?: number;
  tokenStorage?: TokenStorage;
  autoRefresh?: boolean;
  refreshMargin?: number;
  logger?: Logger;
  /**
   * Credenziali per l'autenticazione automatica. Se fornite, il client si
   * autentica (e rinnova) da solo a ogni richiesta: non serve chiamare
   * `auth.signIn()` né `auth.ensureAuthenticated()` manualmente.
   */
  username?: string;
  password?: string;
}

export class ArubaClient {
  public readonly http: HttpClient;
  public readonly auth: AuthClient;
  public readonly logger: Logger;

  constructor(options: ArubaClientOptions) {
    this.logger = options.logger ?? new ConsoleLogger();

    const httpOptions: HttpClientOptions = {
      environment: options.environment,
      timeout: options.timeout,
      retry: options.maxRetries ? { maxRetries: options.maxRetries } : undefined,
      logger: this.logger,
    };

    this.http = new HttpClient(httpOptions);

    const authOptions: AuthClientOptions = {
      httpClient: this.http,
      tokenStorage: options.tokenStorage,
      autoRefresh: options.autoRefresh,
      refreshMargin: options.refreshMargin,
      logger: this.logger,
      username: options.username,
      password: options.password,
    };

    this.auth = new AuthClient(authOptions);

    // Autenticazione automatica trasparente: ogni richiesta (non-auth) assicura
    // un token valido prima di partire, e un 401 innesca una ri-autenticazione
    // con retry. Così i consumer non devono chiamare signIn/ensureAuthenticated.
    this.http.setRequestInterceptor(() => this.auth.ensureAuthenticated());
    this.http.setOnUnauthorized(() => this.auth.reauthenticate());
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
}
