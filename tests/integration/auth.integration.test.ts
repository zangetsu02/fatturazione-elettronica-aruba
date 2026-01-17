import { describe, it, expect, beforeAll } from 'vitest';
import { ArubaClient } from '@fatturazione-aruba/core';
import {
  createTestClient,
  skipIfNoCredentials,
} from './helpers.js';

const hasCredentials = !skipIfNoCredentials();

describe('Auth Integration Tests', () => {
  describe('UC-ENV-01: Environment configuration (no credentials needed)', () => {
    it('should create demo client', () => {
      const demoClient = new ArubaClient({ environment: 'demo' });
      expect(demoClient).toBeDefined();
    });

    it('should create production client', () => {
      const prodClient = new ArubaClient({ environment: 'production' });
      expect(prodClient).toBeDefined();
    });

    it('should accept custom timeout', () => {
      const customClient = new ArubaClient({
        environment: 'demo',
        timeout: 60000,
      });
      expect(customClient).toBeDefined();
    });
  });

  describe.skipIf(!hasCredentials)('UC-AUTH: Authentication (requires credentials)', () => {
    let client: ArubaClient;
    let username: string;
    let password: string;

    beforeAll(() => {
      if (!hasCredentials) return;
      client = createTestClient();
      username = process.env.ARUBA_USERNAME!;
      password = process.env.ARUBA_PASSWORD!;
    });

    it('UC-AUTH-01: should receive access_token and refresh_token', async () => {
      const result = await client.auth.signIn(username, password);

      expect(result.access_token).toBeDefined();
      expect(result.access_token.length).toBeGreaterThan(0);
      expect(result.refresh_token).toBeDefined();
      expect(result.refresh_token.length).toBeGreaterThan(0);
      expect(result.token_type).toBe('bearer');
      expect(result.expires_in).toBeGreaterThan(0);
    });

    it('UC-AUTH-02: should handle 401 error for invalid credentials', async () => {
      const invalidClient = createTestClient();

      await expect(
        invalidClient.auth.signIn('invalid_user', 'invalid_pass')
      ).rejects.toMatchObject({
        status: 401,
      });
    });

    it('UC-AUTH-03: should refresh token', async () => {
      const loginResult = await client.auth.signIn(username, password);
      const refreshResult = await client.auth.refresh(loginResult.refresh_token);

      expect(refreshResult.access_token).toBeDefined();
      expect(refreshResult.refresh_token).toBeDefined();
    });

    it('UC-AUTH-06: should get user info', async () => {
      await client.auth.signIn(username, password);
      const userInfo = await client.auth.getUserInfo();

      expect(userInfo.username).toBeDefined();
      expect(userInfo.vatCode).toBeDefined();
      expect(userInfo.accountStatus).toBeDefined();
      expect(userInfo.usageStatus).toBeDefined();
    });
  });
});
