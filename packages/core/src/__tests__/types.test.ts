import { describe, it, expect } from 'vitest';
import {
  ENVIRONMENT_URLS,
  RATE_LIMITS,
  FILE_LIMITS,
  ARUBA_CONSTANTS,
  SYNC_ERROR_CODES,
  ArubaApiError,
  AuthenticationError,
  RateLimitError,
  TimeoutError,
  NetworkError,
  MemoryTokenStorage,
} from '../index.js';

describe('Environment configuration', () => {
  it('should have correct demo URLs', () => {
    expect(ENVIRONMENT_URLS.demo.authUrl).toBe(
      'https://demoauth.fatturazioneelettronica.aruba.it'
    );
    expect(ENVIRONMENT_URLS.demo.wsUrl).toBe(
      'https://demows.fatturazioneelettronica.aruba.it'
    );
  });

  it('should have correct production URLs', () => {
    expect(ENVIRONMENT_URLS.production.authUrl).toBe(
      'https://auth.fatturazioneelettronica.aruba.it'
    );
    expect(ENVIRONMENT_URLS.production.wsUrl).toBe(
      'https://ws.fatturazioneelettronica.aruba.it'
    );
  });

  it('should have correct rate limits', () => {
    expect(RATE_LIMITS.auth).toBe(1);
    expect(RATE_LIMITS.upload).toBe(30);
    expect(RATE_LIMITS.search).toBe(12);
  });

  it('should have correct file limits', () => {
    expect(FILE_LIMITS.maxFileSize).toBe(5 * 1024 * 1024);
  });

  it('should have correct Aruba constants', () => {
    expect(ARUBA_CONSTANTS.codiceDestinatario).toBe('KRRH6B9');
    expect(ARUBA_CONSTANTS.idTrasmittente).toBe('IT01879020517');
  });
});

describe('Error codes', () => {
  it('should have sync error codes', () => {
    expect(SYNC_ERROR_CODES['0001']).toBe('Nome file già presente nel sistema');
    expect(SYNC_ERROR_CODES['0002']).toBe('Fattura duplicata');
  });
});

describe('Error classes', () => {
  it('should create ArubaApiError correctly', () => {
    const error = new ArubaApiError('Test error', 'TEST_CODE', 400, 'details');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.statusCode).toBe(400);
    expect(error.details).toBe('details');
    expect(error.name).toBe('ArubaApiError');
  });

  it('should create AuthenticationError correctly', () => {
    const error = new AuthenticationError('Not authenticated');

    expect(error.message).toBe('Not authenticated');
    expect(error.code).toBe('AUTH_ERROR');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('AuthenticationError');
  });

  it('should create RateLimitError correctly', () => {
    const error = new RateLimitError('Rate limit exceeded', 60);

    expect(error.message).toBe('Rate limit exceeded');
    expect(error.code).toBe('RATE_LIMIT');
    expect(error.statusCode).toBe(429);
    expect(error.retryAfter).toBe(60);
    expect(error.name).toBe('RateLimitError');
  });

  it('should create TimeoutError correctly', () => {
    const error = new TimeoutError();

    expect(error.message).toBe('Request timeout');
    expect(error.code).toBe('TIMEOUT');
    expect(error.statusCode).toBe(408);
    expect(error.name).toBe('TimeoutError');
  });

  it('should create NetworkError correctly', () => {
    const error = new NetworkError('Connection refused');

    expect(error.message).toBe('Connection refused');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.statusCode).toBe(0);
    expect(error.name).toBe('NetworkError');
  });
});

describe('MemoryTokenStorage', () => {
  it('should store and retrieve token', () => {
    const storage = new MemoryTokenStorage();
    const token = {
      access_token: 'test-token',
      token_type: 'bearer' as const,
      expires_in: 1800,
      refresh_token: 'refresh-token',
      userName: 'testuser',
      'as:client_id': 'client-id',
      '.issued': '2024-01-01T00:00:00.000Z',
      '.expires': '2024-01-01T00:30:00.000Z',
    };

    expect(storage.getToken()).toBeNull();

    storage.setToken(token);
    expect(storage.getToken()).toEqual(token);

    storage.clearToken();
    expect(storage.getToken()).toBeNull();
  });
});
