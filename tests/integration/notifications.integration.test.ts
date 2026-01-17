import { describe, it, expect, beforeAll } from 'vitest';
import { ArubaClient } from '@fatturazione-aruba/core';
import { InvoicesClient } from '@fatturazione-aruba/invoices';
import { NotificationsClient } from '@fatturazione-aruba/notifications';
import {
  createTestClient,
  skipIfNoCredentials,
} from './helpers.js';

const hasCredentials = !skipIfNoCredentials();

describe.skipIf(!hasCredentials)('Notifications Integration Tests', () => {
  let client: ArubaClient;
  let invoices: InvoicesClient;
  let notifications: NotificationsClient;

  beforeAll(async () => {
    if (!hasCredentials) return;
    client = createTestClient();
    await client.auth.signIn(
      process.env.ARUBA_USERNAME!,
      process.env.ARUBA_PASSWORD!
    );
    invoices = new InvoicesClient(client.http);
    notifications = new NotificationsClient(client.http);
  });

  it('should get notifications for sent invoices', async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    const sentInvoices = await invoices.findSent({
      creationStartDate: startDate.toISOString(),
      creationEndDate: endDate.toISOString(),
      size: 1,
    });

    if (sentInvoices.content.length > 0) {
      const result = await notifications.getSentNotifications({
        invoiceFilename: sentInvoices.content[0].filename,
      });

      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
    }
  });

  it('should get notifications for received invoices', async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    const receivedInvoices = await invoices.findReceived({
      creationStartDate: startDate.toISOString(),
      creationEndDate: endDate.toISOString(),
      size: 1,
    });

    if (receivedInvoices.content.length > 0) {
      const result = await notifications.getReceivedNotifications({
        invoiceFilename: receivedInvoices.content[0].filename,
      });

      expect(result).toBeDefined();
      expect(result.notifications).toBeDefined();
    }
  });
});
