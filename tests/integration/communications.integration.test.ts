import { describe, it, expect, beforeAll } from 'vitest';
import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
import { CommunicationsClient } from '@fatturazione-elettronica-aruba/communications';
import {
  createTestClient,
  skipIfNoCredentials,
} from './helpers.js';

const hasCredentials = !skipIfNoCredentials();

describe.skipIf(!hasCredentials)('Communications Integration Tests', () => {
  let client: ArubaClient;
  let communications: CommunicationsClient;

  beforeAll(async () => {
    if (!hasCredentials) return;
    client = createTestClient();
    await client.auth.signIn(
      process.env.ARUBA_USERNAME!,
      process.env.ARUBA_PASSWORD!
    );
    communications = new CommunicationsClient(client.http);
  });

  it('should have communications client initialized', () => {
    expect(communications).toBeDefined();
  });

  // Note: Actual communication tests require valid XML files
  // and should be run with caution as they submit real data
});
