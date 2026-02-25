import { describe, it, expect, beforeAll } from 'vitest';
import { ArubaClient } from '@fatturazione-elettronica-aruba/core';
import { InvoicesClient } from '@fatturazione-elettronica-aruba/invoices';
import { NotificationsClient } from '@fatturazione-elettronica-aruba/notifications';
import {
  createTestClient,
  skipIfNoCredentials,
} from './helpers.js';

const hasCredentials = !skipIfNoCredentials();

describe.skipIf(!hasCredentials)('Notifications Integration Tests', () => {
  let client: ArubaClient;
  let invoices: InvoicesClient;
  let notifications: NotificationsClient;
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
    notifications = new NotificationsClient({ httpClient: client.http });
    const userInfo = await client.auth.getUserInfo();
    countryCode = userInfo.countryCode;
    vatCode = userInfo.vatCode;
  });

  it('should get notifications for sent invoices', async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    try {
      const sentInvoices = await invoices.findSent({
        creationStartDate: startDate.toISOString(),
        creationEndDate: endDate.toISOString(),
        senderCountry: countryCode,
        senderVatcode: vatCode,
        size: 1,
      });

      if (sentInvoices.content.length > 0) {
        const result = await notifications.getSentNotifications({
          filename: sentInvoices.content[0].filename,
        });

        expect(result).toBeDefined();
        expect(result.notifications).toBeDefined();
      }
    } catch (error: any) {
      // Skip if account lacks FAW-R delegation
      if (error.message?.includes('delega')) return;
      throw error;
    }
  });

  it('should get notifications for received invoices', async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    try {
      const receivedInvoices = await invoices.findReceived({
        creationStartDate: startDate.toISOString(),
        creationEndDate: endDate.toISOString(),
        receiverCountry: countryCode,
        receiverVatcode: vatCode,
        size: 1,
      });

      if (receivedInvoices.content.length > 0) {
        const result = await notifications.getReceivedNotifications({
          filename: receivedInvoices.content[0].filename,
        });

        expect(result).toBeDefined();
        expect(result.notifications).toBeDefined();
      }
    } catch (error: any) {
      // Skip if account lacks FAW-IN delegation
      if (error.message?.includes('delega')) return;
      throw error;
    }
  });
});
