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
}

export class AuthClient {
  private readonly httpClient: HttpClient;
  private readonly tokenStorage: TokenStorage;
  private readonly autoRefresh: boolean;
  private readonly refreshMargin: number;
  private readonly logger: Logger;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(options: AuthClientOptions) {
    this.httpClient = options.httpClient;
    this.tokenStorage = options.tokenStorage ?? new MemoryTokenStorage();
    this.autoRefresh = options.autoRefresh ?? true;
    this.refreshMargin = options.refreshMargin ?? 60;
    this.logger = options.logger ?? new ConsoleLogger();
  }

  async signIn(username: string, password: string): Promise<AuthToken> {
    const token = await this.httpClient.postForm<AuthToken>('auth', '/auth/signin', {
      grant_type: 'password',
      username,
      password,
    });

    this.handleNewToken(token);
    return token;
  }

  async refresh(refreshToken?: string): Promise<AuthToken> {
    const tokenToUse = refreshToken ?? this.tokenStorage.getToken()?.refresh_token;

    if (!tokenToUse) {
      throw new AuthenticationError('No refresh token available');
    }

    const token = await this.httpClient.postForm<AuthToken>('auth', '/auth/signin', {
      grant_type: 'refresh_token',
      refresh_token: tokenToUse,
    });

    this.handleNewToken(token);
    return token;
  }

  async getUserInfo(): Promise<UserInfo> {
    this.ensureAuthenticated();
    return this.httpClient.get<UserInfo>('auth', '/auth/userInfo');
  }

  async getMulticedenti(
    params?: MulticedentiSearchParams
  ): Promise<PagedResponse<Multicedente>> {
    this.ensureAuthenticated();
    return this.httpClient.get<PagedResponse<Multicedente>>(
      'auth',
      '/auth/multicedenti',
      params as Record<string, string | number | boolean | undefined>
    );
  }

  async getMulticedenteById(id: string): Promise<Multicedente> {
    this.ensureAuthenticated();
    return this.httpClient.get<Multicedente>('auth', `/auth/multicedenti/${id}`);
  }

  async getMulticedentiReport(): Promise<{ jobId: string }> {
    this.ensureAuthenticated();
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

  private ensureAuthenticated(): void {
    if (!this.isAuthenticated()) {
      throw new AuthenticationError('Not authenticated');
    }
  }
}
