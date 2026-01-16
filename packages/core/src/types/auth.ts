export interface AuthToken {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  refresh_token: string;
  userName: string;
  'as:client_id': string;
  '.issued': string;
  '.expires': string;
}

export interface AccountStatus {
  expired: boolean;
  expirationDate: string;
}

export interface UsageStatus {
  usedSpaceKB: number;
  maxSpaceKB: number;
}

export interface UserInfo {
  username: string;
  pec: string;
  userDescription: string;
  countryCode: string;
  vatCode: string;
  fiscalCode: string;
  accountStatus: AccountStatus;
  usageStatus: UsageStatus;
}

export type MulticedenteStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'REQUESTED_FOR_ACTIVATION'
  | 'REQUESTED_FOR_DEACTIVATION';

export interface Multicedente {
  id: string;
  description: string;
  countryCode: string;
  vatCode: string;
  usedSpaceKB: number;
  creationDate: string;
  status: MulticedenteStatus;
}

export interface MulticedentiSearchParams {
  status?: MulticedenteStatus;
  vatCode?: string;
  page?: number;
  size?: number;
}

export interface SignInCredentials {
  username: string;
  password: string;
}

export interface RefreshTokenOptions {
  refreshToken: string;
}

export interface TokenStorage {
  getToken(): AuthToken | null;
  setToken(token: AuthToken): void;
  clearToken(): void;
}

export class MemoryTokenStorage implements TokenStorage {
  private token: AuthToken | null = null;

  getToken(): AuthToken | null {
    return this.token;
  }

  setToken(token: AuthToken): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }
}
