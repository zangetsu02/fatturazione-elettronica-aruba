export type HttpStatusCode = 200 | 201 | 400 | 401 | 403 | 404 | 413 | 429 | 500;

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp?: string;
}

export const SYNC_ERROR_CODES = {
  '0001': 'Nome file già presente nel sistema',
  '0002': 'Fattura duplicata',
  '0003': 'Superato limite spazio disponibile',
  '0005': 'Base64 non valido',
  '0096': 'Servizio temporaneamente non disponibile',
  '0097': 'Errore controlli deleghe',
} as const;

export type SyncErrorCode = keyof typeof SYNC_ERROR_CODES;

export const ASYNC_ERROR_CODES = {
  FATRSM212: 'IdTrasmittente non corretto',
  FATRSM001: 'Errore di validazione schema XML',
  FATRSM002: 'Firma digitale non valida',
} as const;

export type AsyncErrorCode = keyof typeof ASYNC_ERROR_CODES;

export class ArubaApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: string;

  constructor(message: string, code: string, statusCode: number, details?: string) {
    super(message);
    this.name = 'ArubaApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ArubaApiError);
    }
  }

  static fromResponse(response: ApiErrorResponse, statusCode: number): ArubaApiError {
    return new ArubaApiError(
      response.error.message,
      response.error.code,
      statusCode,
      response.error.details
    );
  }
}

export class AuthenticationError extends ArubaApiError {
  constructor(message: string, details?: string) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends ArubaApiError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class TimeoutError extends ArubaApiError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT', 408);
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends ArubaApiError {
  constructor(message: string = 'Network error') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}
