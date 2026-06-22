import type { HttpClient } from '../http/client.js';
import {
  type AuthToken,
  type UserInfo,
  type Multicedente,
  type MulticedentiSearchParams,
  type TokenStorage,
  type PagedResponse,
  MemoryTokenStorage,
  AuthenticationError,
  type Logger,
  ConsoleLogger,
} from '../types/index.js';

export interface AuthClientOptions {
  httpClient: HttpClient;
  tokenStorage?: TokenStorage;
  autoRefresh?: boolean;
  refreshMargin?: number;
  logger?: Logger;
  /** Credenziali per l'auto-signIn (cold start) senza chiamare signIn a mano. */
  username?: string;
  password?: string;
}

export class AuthClient {
  private readonly httpClient: HttpClient;
  private readonly tokenStorage: TokenStorage;
  private readonly autoRefresh: boolean;
  private readonly refreshMargin: number;
  private readonly logger: Logger;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  private authInFlight: Promise<void> | null = null;
  private credentials?: { username: string; password: string };

  constructor(options: AuthClientOptions) {
    this.httpClient = options.httpClient;
    this.tokenStorage = options.tokenStorage ?? new MemoryTokenStorage();
    this.autoRefresh = options.autoRefresh ?? true;
    this.refreshMargin = options.refreshMargin ?? 60;
    this.logger = options.logger ?? new ConsoleLogger();
    if (options.username && options.password) {
      this.credentials = { username: options.username, password: options.password };
    }
  }

  /** Imposta/aggiorna le credenziali usate per l'auto-signIn. */
  setCredentials(username: string, password: string): void {
    this.credentials = { username, password };
  }

  async signIn(username: string, password: string): Promise<AuthToken> {
    const token = await this.httpClient.postForm<AuthToken>(
      'auth',
      '/auth/signin',
      {
        grant_type: 'password',
        username,
        password,
      },
      { skipAuth: true }
    );

    this.handleNewToken(token);
    return token;
  }

  async refresh(refreshToken?: string): Promise<AuthToken> {
    const tokenToUse = refreshToken ?? this.tokenStorage.getToken()?.refresh_token;

    if (!tokenToUse) {
      throw new AuthenticationError('No refresh token available');
    }

    const token = await this.httpClient.postForm<AuthToken>(
      'auth',
      '/auth/signin',
      {
        grant_type: 'refresh_token',
        refresh_token: tokenToUse,
      },
      { skipAuth: true }
    );

    this.handleNewToken(token);
    return token;
  }

  async ensureAuthenticated(username?: string, password?: string): Promise<void> {
    if (this.isAuthenticated()) {
      return;
    }
    return this.runAuth(username, password);
  }

  /**
   * Forza la ri-autenticazione (refresh o signIn) ignorando lo stato locale del
   * token. Usato come reazione a un 401 del server (token revocato / clock skew).
   * Ritorna `true` se ora c'è un token valido.
   */
  async reauthenticate(username?: string, password?: string): Promise<boolean> {
    try {
      await this.runAuth(username, password);
      return this.isAuthenticated();
    } catch (error) {
      this.logger.error('Re-authentication failed:', error);
      return false;
    }
  }

  async getUserInfo(): Promise<UserInfo> {
    return this.httpClient.get<UserInfo>('auth', '/auth/userInfo');
  }

  async getMulticedenti(
    params?: MulticedentiSearchParams
  ): Promise<PagedResponse<Multicedente>> {
    return this.httpClient.get<PagedResponse<Multicedente>>(
      'auth',
      '/auth/multicedenti',
      params as Record<string, string | number | boolean | undefined>
    );
  }

  async getMulticedenteById(id: string): Promise<Multicedente> {
    return this.httpClient.get<Multicedente>('auth', `/auth/multicedenti/${id}`);
  }

  async getMulticedentiReport(): Promise<{ jobId: string }> {
    return this.httpClient.post<{ jobId: string }>('ws', '/api/v2/multicedenti/report');
  }

  logout(): void {
    this.clearRefreshTimeout();
    this.tokenStorage.clearToken();
    this.httpClient.setAccessToken(null);
  }

  isAuthenticated(): boolean {
    const token = this.tokenStorage.getToken();
    if (!token) return false;

    const expiresAt = new Date(token['.expires']).getTime();
    return Date.now() < expiresAt;
  }

  getToken(): AuthToken | null {
    return this.tokenStorage.getToken();
  }

  private handleNewToken(token: AuthToken): void {
    this.tokenStorage.setToken(token);
    this.httpClient.setAccessToken(token.access_token);

    if (this.autoRefresh) {
      this.scheduleRefresh(token);
    }
  }

  private scheduleRefresh(token: AuthToken): void {
    this.clearRefreshTimeout();

    const refreshIn = (token.expires_in - this.refreshMargin) * 1000;

    if (refreshIn > 0) {
      this.refreshTimeout = setTimeout(async () => {
        try {
          await this.refresh();
          this.logger.debug('Token refreshed successfully');
        } catch (error) {
          this.logger.error('Auto-refresh failed:', error);
        }
      }, refreshIn);
    }
  }

  private clearRefreshTimeout(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  /** Deduplica le autenticazioni concorrenti su una singola promise in volo. */
  private runAuth(username?: string, password?: string): Promise<void> {
    if (!this.authInFlight) {
      this.authInFlight = this.authenticate(username, password).finally(() => {
        this.authInFlight = null;
      });
    }
    return this.authInFlight;
  }

  private async authenticate(username?: string, password?: string): Promise<void> {
    // Prova prima il refresh se abbiamo un refresh token (più economico e
    // preserva la sessione); in caso di fallimento ricade sul signIn.
    const refreshToken = this.tokenStorage.getToken()?.refresh_token;
    if (refreshToken) {
      try {
        await this.refresh(refreshToken);
        return;
      } catch (error) {
        this.logger.debug('Refresh failed, falling back to signIn:', error);
      }
    }

    const creds =
      username && password ? { username, password } : this.credentials;
    if (!creds) {
      throw new AuthenticationError(
        'Not authenticated and no credentials available to sign in'
      );
    }

    await this.signIn(creds.username, creds.password);
  }
}
