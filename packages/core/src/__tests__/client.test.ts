import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ArubaClient } from '../index.js';

describe('ArubaClient', () => {
  it('should create client with demo environment', () => {
    const client = new ArubaClient({ environment: 'demo' });

    expect(client).toBeInstanceOf(ArubaClient);
    expect(client.http).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.isAuthenticated()).toBe(false);
  });

  it('should create client with production environment', () => {
    const client = new ArubaClient({ environment: 'production' });

    expect(client).toBeInstanceOf(ArubaClient);
  });

  it('should accept custom options', () => {
    const client = new ArubaClient({
      environment: 'demo',
      timeout: 60000,
      maxRetries: 5,
      autoRefresh: false,
    });

    expect(client).toBeInstanceOf(ArubaClient);
  });
});

describe('HttpClient', () => {
  let client: ArubaClient;

  beforeEach(() => {
    client = new ArubaClient({ environment: 'demo' });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should set and get access token', () => {
    expect(client.http.getAccessToken()).toBeNull();

    client.http.setAccessToken('test-token');
    expect(client.http.getAccessToken()).toBe('test-token');

    client.http.setAccessToken(null);
    expect(client.http.getAccessToken()).toBeNull();
  });

  it('should make GET request with correct URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ data: 'test' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await client.http.get<{ data: string }>('ws', '/api/v2/test');

    expect(result).toEqual({ data: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://demows.fatturazioneelettronica.aruba.it/api/v2/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      })
    );
  });

  it('should make GET request with query params', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    await client.http.get('ws', '/api/v2/test', { page: 0, size: 20 });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://demows.fatturazioneelettronica.aruba.it/api/v2/test?page=0&size=20',
      expect.any(Object)
    );
  });

  it('should include Authorization header when token is set', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', mockFetch);

    client.http.setAccessToken('my-token');
    await client.http.get('ws', '/api/v2/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      })
    );
  });

  it('should make POST request with JSON body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const body = { data: 'test' };
    await client.http.post('ws', '/api/v2/test', body);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://demows.fatturazioneelettronica.aruba.it/api/v2/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      })
    );
  });

  it('should make POST request with form data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await client.http.postForm('auth', '/auth/signin', {
      grant_type: 'password',
      username: 'user',
      password: 'pass',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://demoauth.fatturazioneelettronica.aruba.it/auth/signin',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: 'grant_type=password&username=user&password=pass',
      })
    );
  });
});

describe('AuthClient', () => {
  let client: ArubaClient;

  beforeEach(() => {
    client = new ArubaClient({ environment: 'demo', autoRefresh: false });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should sign in and store token', async () => {
    const mockToken = {
      access_token: 'test-access-token',
      token_type: 'bearer',
      expires_in: 1800,
      refresh_token: 'test-refresh-token',
      userName: 'testuser',
      'as:client_id': 'client-id',
      '.issued': '2024-01-01T00:00:00.000Z',
      '.expires': '2099-01-01T00:30:00.000Z',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockToken),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await client.auth.signIn('user', 'pass');

    expect(result).toEqual(mockToken);
    expect(client.isAuthenticated()).toBe(true);
    expect(client.http.getAccessToken()).toBe('test-access-token');
  });

  it('should logout and clear token', async () => {
    const mockToken = {
      access_token: 'test-access-token',
      token_type: 'bearer',
      expires_in: 1800,
      refresh_token: 'test-refresh-token',
      userName: 'testuser',
      'as:client_id': 'client-id',
      '.issued': '2024-01-01T00:00:00.000Z',
      '.expires': '2099-01-01T00:30:00.000Z',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockToken),
    });
    vi.stubGlobal('fetch', mockFetch);

    await client.auth.signIn('user', 'pass');
    expect(client.isAuthenticated()).toBe(true);

    client.auth.logout();
    expect(client.isAuthenticated()).toBe(false);
    expect(client.http.getAccessToken()).toBeNull();
  });
});
