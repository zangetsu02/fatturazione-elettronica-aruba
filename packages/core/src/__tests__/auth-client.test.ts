import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ArubaClient } from '../index.js';
import { MemoryTokenStorage, AuthenticationError, type AuthToken } from '../types/index.js';

function makeToken(overrides: Partial<AuthToken> = {}): AuthToken {
  const now = Date.now();
  return {
    access_token: 'access-123',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'refresh-123',
    userName: 'user',
    'as:client_id': 'client',
    '.issued': new Date(now).toUTCString(),
    '.expires': new Date(now + 3600 * 1000).toUTCString(),
    ...overrides,
  };
}

function mockTokenFetch() {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(makeToken()),
  });
}

function jsonResp(body: unknown, status = 200) {
  return {
    ok: status < 400,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(body),
  };
}

function bodyOf(call: unknown[]): string {
  const init = call[1] as { body?: unknown };
  return init?.body == null ? '' : String(init.body);
}

describe('AuthClient.ensureAuthenticated', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('signs in lazily when there is no token', async () => {
    const fetchMock = mockTokenFetch();
    vi.stubGlobal('fetch', fetchMock);
    const client = new ArubaClient({ environment: 'demo', autoRefresh: false });

    expect(client.isAuthenticated()).toBe(false);
    await client.auth.ensureAuthenticated('user', 'pass');

    expect(client.isAuthenticated()).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(bodyOf(fetchMock.mock.calls[0]!)).toContain('grant_type=password');
  });

  it('is a no-op when already authenticated', async () => {
    const fetchMock = mockTokenFetch();
    vi.stubGlobal('fetch', fetchMock);
    const client = new ArubaClient({ environment: 'demo', autoRefresh: false });

    await client.auth.ensureAuthenticated('user', 'pass');
    await client.auth.ensureAuthenticated('user', 'pass');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent sign-ins (no thundering herd on cold start)', async () => {
    const fetchMock = mockTokenFetch();
    vi.stubGlobal('fetch', fetchMock);
    const client = new ArubaClient({ environment: 'demo', autoRefresh: false });

    await Promise.all([
      client.auth.ensureAuthenticated('user', 'pass'),
      client.auth.ensureAuthenticated('user', 'pass'),
      client.auth.ensureAuthenticated('user', 'pass'),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(client.isAuthenticated()).toBe(true);
  });

  it('refreshes instead of signing in when an expired token with refresh_token exists', async () => {
    const fetchMock = mockTokenFetch();
    vi.stubGlobal('fetch', fetchMock);

    const storage = new MemoryTokenStorage();
    storage.setToken(
      makeToken({ '.expires': new Date(Date.now() - 1000).toUTCString() }) // expired
    );

    const client = new ArubaClient({ environment: 'demo', autoRefresh: false, tokenStorage: storage });

    expect(client.isAuthenticated()).toBe(false);
    await client.auth.ensureAuthenticated(); // no credentials needed: refresh available

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(bodyOf(fetchMock.mock.calls[0]!)).toContain('grant_type=refresh_token');
    expect(client.isAuthenticated()).toBe(true);
  });

  it('throws when not authenticated and no credentials are provided', async () => {
    const client = new ArubaClient({ environment: 'demo', autoRefresh: false });

    await expect(client.auth.ensureAuthenticated()).rejects.toBeInstanceOf(AuthenticationError);
  });
});

describe('Automatic authentication via HttpClient interceptor', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('auto-authenticates on the first request (no manual signIn/ensureAuthenticated)', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/auth/signin')) return Promise.resolve(jsonResp(makeToken()));
      if (url.includes('/auth/userInfo')) return Promise.resolve(jsonResp({ userName: 'mario' }));
      return Promise.resolve(jsonResp({}));
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new ArubaClient({
      environment: 'demo',
      autoRefresh: false,
      username: 'user',
      password: 'pass',
    });

    // Nessuna chiamata esplicita ad auth: l'interceptor fa signIn prima del GET.
    const info = await client.auth.getUserInfo();

    expect(info).toEqual({ userName: 'mario' });
    expect(client.isAuthenticated()).toBe(true);
    const calledUrls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(calledUrls.some((u) => u.includes('/auth/signin'))).toBe(true);
    expect(calledUrls.some((u) => u.includes('/auth/userInfo'))).toBe(true);
  });

  it('re-authenticates and retries once on a 401', async () => {
    let userInfoCalls = 0;
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/auth/signin')) return Promise.resolve(jsonResp(makeToken()));
      if (url.includes('/auth/userInfo')) {
        userInfoCalls += 1;
        if (userInfoCalls === 1) {
          return Promise.resolve(
            jsonResp({ error: { code: 'UNAUTHORIZED', message: 'token rejected' } }, 401)
          );
        }
        return Promise.resolve(jsonResp({ userName: 'mario' }));
      }
      return Promise.resolve(jsonResp({}));
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new ArubaClient({
      environment: 'demo',
      autoRefresh: false,
      username: 'user',
      password: 'pass',
    });

    const info = await client.auth.getUserInfo();

    expect(info).toEqual({ userName: 'mario' });
    expect(userInfoCalls).toBe(2); // primo 401 -> reauth -> retry ok
  });
});
