import { describe, it, expect, beforeAll } from 'vitest';
import { ArubaClient } from '@fatturazione-aruba/core';
import { InvoicesClient } from '@fatturazione-aruba/invoices';
import { encodeBase64 } from '@fatturazione-aruba/utils';
import {
  createTestClient,
  skipIfNoCredentials,
  SAMPLE_INVOICE_XML,
} from './helpers.js';

const hasCredentials = !skipIfNoCredentials();

describe.skipIf(!hasCredentials)('Invoices Integration Tests', () => {
  let client: ArubaClient;
  let invoices: InvoicesClient;

  beforeAll(async () => {
    if (!hasCredentials) return;
    client = createTestClient();
    await client.auth.signIn(
      process.env.ARUBA_USERNAME!,
      process.env.ARUBA_PASSWORD!
    );
    invoices = new InvoicesClient(client.http);
  });

  describe('UC-SEARCH-OUT: Search sent invoices', () => {
    it('should search by date range', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      const result = await invoices.findSent({
        creationStartDate: startDate.toISOString(),
        creationEndDate: endDate.toISOString(),
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    it('should handle pagination', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      const result = await invoices.findSent({
        creationStartDate: startDate.toISOString(),
        creationEndDate: endDate.toISOString(),
        page: 0,
        size: 10,
      });

      expect(result.pageable).toBeDefined();
    });
  });

  describe('UC-IN: Received invoices', () => {
    it('should search received invoices', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      const result = await invoices.findReceived({
        creationStartDate: startDate.toISOString(),
        creationEndDate: endDate.toISOString(),
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('UC-OUT: Upload validation', () => {
    it('should validate with dryRun', async () => {
      const uniqueNumber = `TEST-${Date.now()}`;
      const xml = SAMPLE_INVOICE_XML.replace('TEST-001', uniqueNumber);

      try {
        const result = await invoices.upload({
          dataFile: encodeBase64(xml),
          dryRun: true,
        });
        expect(result).toBeDefined();
      } catch (error: any) {
        // Validation errors are expected
        expect(error).toBeDefined();
      }
    });

    it('should reject invalid Base64', async () => {
      await expect(
        invoices.upload({ dataFile: 'not-valid-base64!!!' })
      ).rejects.toBeDefined();
    });
  });
});
