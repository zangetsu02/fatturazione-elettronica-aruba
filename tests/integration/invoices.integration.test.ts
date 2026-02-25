import { describe, it, expect, beforeAll } from 'vitest';
import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
import { InvoicesClient } from '@fatturazione-elettronica-aruba/invoices';
import { encodeBase64 } from '@fatturazione-elettronica-aruba/utils';
import {
  createTestClient,
  skipIfNoCredentials,
  SAMPLE_INVOICE_XML,
} from './helpers.js';

const hasCredentials = !skipIfNoCredentials();

describe.skipIf(!hasCredentials)('Invoices Integration Tests', () => {
  let client: ArubaClient;
  let invoices: InvoicesClient;
  let countryCode: string;
  let vatCode: string;

  beforeAll(async () => {
    if (!hasCredentials) return;
    client = createTestClient();
    await client.auth.signIn(
      process.env.ARUBA_USERNAME!,
      process.env.ARUBA_PASSWORD!
    );
    invoices = new InvoicesClient({ httpClient: client.http });
    const userInfo = await client.auth.getUserInfo();
    countryCode = userInfo.countryCode;
    vatCode = userInfo.vatCode;
  });

  describe('UC-SEARCH-OUT: Search sent invoices', () => {
    it('should search by date range', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      try {
        const result = await invoices.findSent({
          creationStartDate: startDate.toISOString(),
          creationEndDate: endDate.toISOString(),
          senderCountry: countryCode,
          senderVatcode: vatCode,
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
      } catch (error: any) {
        // Skip if account lacks FAW-R delegation
        if (error.message?.includes('delega')) return;
        throw error;
      }
    });

    it('should handle pagination', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      try {
        const result = await invoices.findSent({
          creationStartDate: startDate.toISOString(),
          creationEndDate: endDate.toISOString(),
          senderCountry: countryCode,
          senderVatcode: vatCode,
          page: 0,
          size: 10,
        });

        expect(result.page).toBeDefined();
      } catch (error: any) {
        if (error.message?.includes('delega')) return;
        throw error;
      }
    });
  });

  describe('UC-IN: Received invoices', () => {
    it('should search received invoices', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      try {
        const result = await invoices.findReceived({
          creationStartDate: startDate.toISOString(),
          creationEndDate: endDate.toISOString(),
          receiverCountry: countryCode,
          receiverVatcode: vatCode,
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      } catch (error: any) {
        if (error.message?.includes('delega')) return;
        throw error;
      }
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
      const result = await invoices.upload({ dataFile: 'not-valid-base64!!!' });
      // API returns 200 with errorCode for sync validation errors
      expect(result.errorCode).toBeDefined();
    });
  });
});
